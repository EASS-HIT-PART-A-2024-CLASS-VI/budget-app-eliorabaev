from sqlalchemy.orm import Session
from db.models import SuggestionCache, Balance
from fastapi import HTTPException
import json

def get_suggestion_cache(db: Session, balance_id: int):
    """Get the cached suggestion for a balance"""
    return db.query(SuggestionCache).filter(SuggestionCache.balance_id == balance_id).first()

def create_or_update_suggestion_cache(db: Session, balance_id: int, suggestion_data: dict):
    """Create or update a suggestion cache entry"""
    # Verify that the balance exists
    balance = db.query(Balance).filter(Balance.id == balance_id).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    # Check if a cache entry already exists
    existing_cache = get_suggestion_cache(db, balance_id)
    
    if existing_cache:
        # Update existing entry
        existing_cache.suggestion_data = suggestion_data
        db.commit()
        db.refresh(existing_cache)
        return existing_cache
    else:
        # Create new entry
        db_suggestion = SuggestionCache(
            balance_id=balance_id,
            suggestion_data=suggestion_data
        )
        db.add(db_suggestion)
        db.commit()
        db.refresh(db_suggestion)
        return db_suggestion

def delete_suggestion_cache(db: Session, balance_id: int):
    """Delete a suggestion cache entry"""
    db_suggestion = get_suggestion_cache(db, balance_id)
    if db_suggestion:
        db.delete(db_suggestion)
        db.commit()
        return True
    return False