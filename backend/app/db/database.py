from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database connection parameters from environment variables with defaults
DB_HOST = os.getenv("DB_HOST", "mysql")
DB_USER = os.getenv("DB_USER", "budget_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "budget_password")
DB_NAME = os.getenv("DB_NAME", "budget_db")

# Create the database URL
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

# Function to create engine with retry logic
def create_engine_with_retry(url, max_retries=5, retry_interval=2):
    """Create a SQLAlchemy engine with retry logic for connection issues"""
    retry_count = 0
    last_exception = None
    
    while retry_count < max_retries:
        try:
            logger.info(f"Attempting to connect to database (attempt {retry_count + 1}/{max_retries})...")
            engine = create_engine(
                url,
                pool_pre_ping=True,  # Verify connection before using from pool
                pool_recycle=3600,   # Recycle connections after 1 hour
                connect_args={"connect_timeout": 10}  # Connection timeout in seconds
            )
            
            # Test the connection
            with engine.connect() as conn:
                logger.info("Database connection successful!")
                return engine
                
        except Exception as e:
            last_exception = e
            retry_count += 1
            logger.warning(f"Database connection failed: {str(e)}. Retrying in {retry_interval} seconds...")
            time.sleep(retry_interval)
            # Increase retry interval for subsequent attempts
            retry_interval = min(retry_interval * 1.5, 30)  # Cap at 30 seconds
    
    # If we get here, all retries failed
    logger.error(f"Failed to connect to database after {max_retries} attempts.")
    if last_exception:
        raise last_exception
    raise Exception("Could not connect to the database")

# Create the SQLAlchemy engine with retry logic
engine = create_engine_with_retry(SQLALCHEMY_DATABASE_URL)

# Create a SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class for database models
Base = declarative_base()

# Function to get a database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()