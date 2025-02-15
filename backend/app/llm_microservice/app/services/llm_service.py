import os
import asyncio
import random
from pathlib import Path
import google.generativeai as genai
from datetime import datetime, timezone
from typing import Dict, Any
import logging
from string import Template
from pydantic import ValidationError
from app.models.schemas import LLMResponse
from app.core.config import Settings

settings = Settings()
logger = logging.getLogger(__name__)

# Configure the Gemini AI client
if not settings.gemini_api_key:
    raise EnvironmentError("GEMINI_API_KEY is not set in the .env file.")

genai.configure(api_key=settings.gemini_api_key)

# Helper to load prompt templates
def load_prompt_template(filepath: str) -> str:
    template_path = Path(filepath)
    if not template_path.exists():
        raise FileNotFoundError(f"Prompt template not found: {filepath}")
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            content = f.read()
            logger.debug(f"Loaded template content: {content}")
            return content
    except Exception as e:
        logger.error(f"Error reading prompt template: {e}")
        raise

# Path to the prompt template
PROMPT_TEMPLATE_PATH = os.getenv("PROMPT_TEMPLATE_PATH", "app/prompts/financial_advisor_prompt.txt")

async def get_suggestions(data: dict) -> dict:
    required_keys = ["balance_id", "current_balance", "total_income", "total_expense"]
    missing_keys = [key for key in required_keys if key not in data]

    if missing_keys:
        raise ValueError(f"Missing required keys in data: {missing_keys}")

    logger.info(f"Received user data: {data}")

    try:
        # Load the prompt template
        prompt_template = load_prompt_template(PROMPT_TEMPLATE_PATH)

        # Use string.Template for safe substitution
        template = Template(prompt_template)
        try:
            formatted_prompt = template.substitute(data)
            logger.debug("Formatted prompt: %s", formatted_prompt)
        except KeyError as e:
            logger.error(f"Template substitution error: Missing key {e}")
            raise ValueError(f"Missing key in data for substitution: {e}")

        # Generate content using the Gemini model with retry logic
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        max_retries = 5  # Increased retries
        response = None

        for attempt in range(max_retries):
            try:
                response = model.generate_content(
                    formatted_prompt,
                    generation_config=genai.GenerationConfig(
                        max_output_tokens=3500,
                        temperature=0.7,
                    ),
                )
                break  # Exit loop if successful
            except Exception as e:
                if "429" in str(e):
                    # Exponential backoff with jitter: e.g. 2^attempt + random delay between 0 and 1 sec
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    logger.warning(
                        f"Received 429 error, retrying after {wait_time:.2f} seconds (attempt {attempt + 1}/{max_retries})"
                    )
                    if attempt < max_retries - 1:
                        await asyncio.sleep(wait_time)
                    else:
                        logger.error("Max retries reached for 429 error.")
                        raise Exception(f"LLM API error: {str(e)}")
                else:
                    raise

        # Validate the response
        if not response or not hasattr(response, "text"):
            logger.error("No response or invalid response from LLM.")
            raise ValueError("No response or invalid response from LLM.")

        raw_output = response.text.strip()
        logger.debug("Raw LLM response: %r", raw_output)

        # Clean and validate JSON format
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]
        raw_output = raw_output.replace("\\n", "\n")
        logger.debug("Cleaned LLM response: %s", raw_output)

        # Parse and enrich the response
        parsed_response = LLMResponse.parse_raw(raw_output)
        parsed_response.generated_at = datetime.now(timezone.utc).isoformat()

        return parsed_response.dict()

    except ValidationError as ve:
        logger.error("Validation error: %s", ve.json())
        raise ValueError(f"Validation error: {ve.json()}")
    except Exception as e:
        logger.error(f"LLM API error: {str(e)}")
        raise Exception(f"LLM API error: {str(e)}")
