import os
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import ValidationError
from datetime import datetime
from typing import Dict, Any
import logging

from schemas import LLMResponse  # Import the updated schema

# Load environment variables from the .env file
load_dotenv()

# Configure the logger
logger = logging.getLogger(__name__)

# Configure the Gemini AI client
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise EnvironmentError("GEMINI_API_KEY is not set in the .env file.")
genai.configure(api_key=gemini_api_key)

async def get_suggestions(data: dict) -> dict:
    # Processes user financial data and sends it to the LLM for suggestions
    required_keys = ["balance_id", "current_balance", "total_income", "total_expense"]
    missing_keys = [key for key in required_keys if key not in data]

    if missing_keys:
        raise ValueError(f"Missing required keys in data: {missing_keys}")

    logger.info(f"Received user data: {data}")

    try:
        # Prepare the prompt
        prompt = (
            "You are a financial advisor assistant. Based on the user's financial data provided below, "
            "analyze their financial situation and provide actionable, personalized suggestions to improve "
            "their financial health.\n\n"
            f"Balance ID: {data['balance_id']}\n"
            f"Current Balance: ${data['current_balance']}\n"
            f"Total Income: ${data['total_income']}\n"
            f"Total Expense: ${data['total_expense']}\n\n"
            "Include:\n"
            "1. High-level analysis (cash flow status, warnings, etc.).\n"
            "2. Actionable suggestions (category, details, priority, links).\n\n"
            "Output the response in JSON format without additional text or markdown formatting.\n"
            "Structure:\n"
            "{\n"
            "  'balance_id': int,\n"
            "  'current_balance': float,\n"
            "  'total_income': float,\n"
            "  'total_expense': float,\n"
            "  'analysis': {\n"
            "    'cash_flow_status': str,\n"
            "    'summary': str,\n"
            "    'warnings': List[str]\n"
            "  },\n"
            "  'suggestions': [\n"
            "    {\n"
            "      'category': str,\n"
            "      'details': str,\n"
            "      'priority': int,\n"
            "      'actionable': bool,\n"
            "      'reference_url': Optional[str]\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        # Generate content using the Gemini model
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                max_output_tokens=3500,
                temperature=0.7,
            ),
        )

        if not response or not hasattr(response, "text"):
            raise ValueError("No response or invalid response from LLM.")

        # Remove markdown code block formatting if present
        raw_output = response.text.strip()
        if raw_output.startswith("```json"):
            raw_output = raw_output[7:]  # Remove the leading ```json
        if raw_output.endswith("```"):
            raw_output = raw_output[:-3]  # Remove the trailing ```

        # Validate and parse the response into the schema
        parsed_response = LLMResponse.parse_raw(raw_output)

        # Add metadata (e.g., generation timestamp)
        parsed_response.generated_at = datetime.utcnow().isoformat()

        return parsed_response.dict()

    except ValidationError as ve:
        raise ValueError(f"Validation error: {ve.json()}")
    except Exception as e:
        raise Exception(f"LLM API error: {str(e)}")
