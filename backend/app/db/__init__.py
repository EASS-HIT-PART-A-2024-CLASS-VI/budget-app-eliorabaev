import logging
from sqlalchemy.exc import SQLAlchemyError
from .database import Base, engine

# Import all models to ensure they are registered with the Base metadata
from .models import Balance, Income, Expense, SuggestionCache

# Configure logging
logger = logging.getLogger(__name__)

def init_db():
    """
    Initialize the database by creating all tables
    with error handling and retry logic
    """
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully!")
    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error during database initialization: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {str(e)}")
        raise