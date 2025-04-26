from sqlalchemy.orm import Session
from db.models import Balance
from schemas.balance import BalanceCreate, BalanceUpdate

def create_balance(db: Session, balance: BalanceCreate):
    """Create a new balance"""
    db_balance = Balance(amount=balance.amount)
    db.add(db_balance)
    db.commit()
    db.refresh(db_balance)
    return db_balance

def get_balance(db: Session, balance_id: int):
    """Get a balance by ID"""
    return db.query(Balance).filter(Balance.id == balance_id).first()

def update_balance(db: Session, balance_id: int, balance: BalanceUpdate):
    """Update a balance"""
    db_balance = get_balance(db, balance_id)
    if db_balance:
        update_data = balance.dict(exclude_unset=True)
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