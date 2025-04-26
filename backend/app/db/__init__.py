from .database import Base, engine

# Import all models to ensure they are registered with the Base metadata
from .models import Balance, Income, Expense, SuggestionCache

# Function to initialize the database
def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)