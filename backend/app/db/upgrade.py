# backend/app/db/upgrade.py
"""
Database upgrade script for adding user authentication to existing installations
This will be run automatically when the app starts
"""

from sqlalchemy import text, inspect
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)

def upgrade_database(engine):
    """
    Upgrade existing database to support user authentication
    """
    try:
        inspector = inspect(engine)
        
        # Check if balances table has user_id column
        columns = [col['name'] for col in inspector.get_columns('balances')]
        needs_upgrade = 'user_id' not in columns
        
        if not needs_upgrade:
            logger.info("Balances table already has user_id column, skipping upgrade")
            return True
        
        logger.info("Upgrading database: adding user_id column to balances table...")
        
        with engine.begin() as conn:
            # Add user_id column to balances table
            logger.info("Adding user_id column to balances table...")
            conn.execute(text("""
                ALTER TABLE balances 
                ADD COLUMN user_id INT NULL
            """))
            
            # Add index for performance
            conn.execute(text("""
                CREATE INDEX idx_balances_user_id ON balances (user_id)
            """))
            
            logger.info("✅ Added user_id column and index to balances table")
            
        logger.info("✅ Database upgrade completed successfully")
        return True
        
    except SQLAlchemyError as e:
        logger.error(f"Database upgrade failed: {str(e)}")
        # Don't raise - let the app continue with existing functionality
        return False
    except Exception as e:
        logger.error(f"Unexpected error during database upgrade: {str(e)}")
        return False

def add_foreign_key_constraint(engine):
    """
    Add foreign key constraint after users table is created
    This is called after Base.metadata.create_all()
    """
    try:
        inspector = inspect(engine)
        
        # First check if user_id column exists
        columns = [col['name'] for col in inspector.get_columns('balances')]
        if 'user_id' not in columns:
            logger.warning("user_id column doesn't exist in balances table, skipping foreign key")
            return False
        
        # Check if both tables exist
        tables = inspector.get_table_names()
        if 'users' not in tables:
            logger.warning("users table doesn't exist, skipping foreign key")
            return False
        
        # Check if foreign key already exists
        foreign_keys = inspector.get_foreign_keys('balances')
        user_fk_exists = any(
            fk for fk in foreign_keys 
            if fk.get('constrained_columns') and 'user_id' in fk.get('constrained_columns', [])
        )
        
        if user_fk_exists:
            logger.info("Foreign key constraint already exists, skipping")
            return True
        
        logger.info("Adding foreign key constraint for user_id...")
        with engine.begin() as conn:
            conn.execute(text("""
                ALTER TABLE balances 
                ADD CONSTRAINT fk_balances_user_id 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
            """))
        logger.info("✅ Added foreign key constraint for user_id")
        return True
        
    except SQLAlchemyError as e:
        logger.warning(f"Could not add foreign key constraint: {str(e)}")
        # This is not critical - the app can work without the constraint
        return False
    except Exception as e:
        logger.warning(f"Unexpected error adding foreign key: {str(e)}")
        return False