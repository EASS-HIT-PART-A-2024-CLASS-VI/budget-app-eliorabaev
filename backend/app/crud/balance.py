# backend/app/crud/balance.py - Update to use balance-specific validation

import crud
from sqlalchemy.orm import Session
from db.models import Balance, User
from schemas.balance import BalanceCreate, BalanceUpdate
from core.validation import validate_balance_amount, validate_id  # Use balance-specific validation
from fastapi import HTTPException

def create_balance(db: Session, balance: BalanceCreate, user_id: int):
    """Create a new balance with validation and user association"""
    # Validate the amount (allows $0)
    validated_amount = validate_balance_amount(balance.amount)
    
    # Create balance with user association
    db_balance = Balance(amount=validated_amount, user_id=user_id)
    db.add(db_balance)
    db.commit()
    db.refresh(db_balance)
    return db_balance


def get_user_balances(db: Session, user_id: int):
    """Get all balances for a specific user"""
    return db.query(Balance).filter(Balance.user_id == user_id).all()

def get_user_primary_balance(db: Session, user_id: int):
    """Get the user's first/primary balance"""
    return db.query(Balance).filter(Balance.user_id == user_id).first()

def get_balance(db: Session, balance_id: int):
    """Get a balance by ID with validation"""
    validate_id(balance_id, "balance_id")
    return db.query(Balance).filter(Balance.id == balance_id).first()

def get_balance_for_user(db: Session, balance_id: int, user_id: int):
    """Get a balance by ID that belongs to a specific user"""
    validate_id(balance_id, "balance_id")
    return db.query(Balance).filter(
        Balance.id == balance_id, 
        Balance.user_id == user_id
    ).first()

def update_balance(db: Session, balance_id: int, balance: BalanceUpdate, user_id: int = None):
    """Update a balance with validation and optional user ownership check"""
    validate_id(balance_id, "balance_id")
    
    # Get balance with optional user check
    if user_id:
        db_balance = get_balance_for_user(db, balance_id, user_id)
    else:
        db_balance = get_balance(db, balance_id)
    
    if db_balance:
        update_data = balance.dict(exclude_unset=True)
        # Validate amount if it's being updated (allows $0)
        if 'amount' in update_data:
            update_data['amount'] = validate_balance_amount(update_data['amount'])
        for key, value in update_data.items():
            setattr(db_balance, key, value)
        db.commit()
        db.refresh(db_balance)
    return db_balance

def delete_balance(db: Session, balance_id: int, user_id: int = None):
    """Delete a balance with optional user ownership check"""
    if user_id:
        db_balance = get_balance_for_user(db, balance_id, user_id)
    else:
        db_balance = get_balance(db, balance_id)
    
    if db_balance:
        db.delete(db_balance)
        db.commit()
        return True
    return False