import logging
from sqlalchemy.exc import SQLAlchemyError
from .database import Base, engine
from .upgrade import upgrade_database, add_foreign_key_constraint

# Import all models to ensure they are registered with the Base metadata
from .models import Balance, Income, Expense, SuggestionCache, User, LoginAttempt

# Configure logging
logger = logging.getLogger(__name__)

def init_db():
    """
    Initialize the database by creating all tables
    with error handling and upgrade logic
    """
    try:
        logger.info("Starting database initialization...")
        
        # Step 1: Run upgrade script for existing installations
        upgrade_database(engine)
        
        # Step 2: Create all tables (this will create new tables but won't modify existing ones)
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Step 3: Add foreign key constraints after all tables exist
        add_foreign_key_constraint(engine)
        
        logger.info("✅ Database initialization completed successfully!")
        
    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error during database initialization: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {str(e)}")
        raise