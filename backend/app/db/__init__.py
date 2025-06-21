import logging
from sqlalchemy.exc import SQLAlchemyError
from .database import Base, engine, get_db
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
        
        # Step 4: Migrate any existing plain text passwords to PBKDF2
        migrate_existing_passwords()
        
        logger.info("✅ Database initialization completed successfully!")
        
    except SQLAlchemyError as e:
        logger.error(f"SQLAlchemy error during database initialization: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during database initialization: {str(e)}")
        raise

def migrate_existing_passwords():
    """
    Migrate any existing plain text passwords to PBKDF2 hashes
    """
    try:
        # Import here to avoid circular imports
        from crud.user import migrate_plain_text_passwords
        
        # Get a database session
        db_gen = get_db()
        db = next(db_gen)
        
        try:
            logger.info("Checking for plain text passwords to migrate...")
            migrated_count = migrate_plain_text_passwords(db)
            
            if migrated_count > 0:
                logger.info(f"✅ Migrated {migrated_count} passwords to PBKDF2")
            else:
                logger.info("✅ All passwords are already using PBKDF2")
                
        finally:
            db.close()
            
    except Exception as e:
        logger.warning(f"Password migration failed (non-critical): {str(e)}")
        # Don't raise - this is not critical for app startup