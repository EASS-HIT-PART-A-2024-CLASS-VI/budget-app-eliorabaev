# llm_microservice/app/utils/logger.py
import logging

def configure_logger():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    return logging.getLogger("llm_microservice")
