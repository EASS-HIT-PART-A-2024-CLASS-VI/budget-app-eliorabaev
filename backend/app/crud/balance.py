from sqlalchemy.orm import Session
from db.models import Balance
from schemas.balance import BalanceCreate, BalanceUpdate
from core.validation import validate_positive_amount, validate_id
from fastapi import HTTPException

def create_balance(db: Session, balance: BalanceCreate):
    """Create a new balance with validation"""
    # The Pydantic model already validates the amount > 0
    # Additional validation/sanitization if needed
    db_balance = Balance(amount=validate_positive_amount(balance.amount))
    db.add(db_balance)
    db.commit()
    db.refresh(db_balance)
    return db_balance

def get_balance(db: Session, balance_id: int):
    """Get a balance by ID with validation"""
    validate_id(balance_id, "balance_id")
    return db.query(Balance).filter(Balance.id == balance_id).first()

def update_balance(db: Session, balance_id: int, balance: BalanceUpdate):
    """Update a balance with validation"""
    validate_id(balance_id, "balance_id")
    db_balance = get_balance(db, balance_id)
    if db_balance:
        update_data = balance.dict(exclude_unset=True)
        # Validate amount if it's being updated
        if 'amount' in update_data:
            update_data['amount'] = validate_positive_amount(update_data['amount'])
        for key, value in update_data.items():
            setattr(db_balance, key, value)
        db.commit()
        db.refresh(db_balance)
    return db_balance

def delete_balance(db: Session, balance_id: int):
    """Delete a balance"""
    db_balance = get_balance(db, balance_id)
    if db_balance:
        db.delete(db_balance)
        db.commit()
        return True
    return False