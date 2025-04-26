from sqlalchemy.orm import Session
from db.models import Income, Balance
from schemas.balance import IncomeCreate, IncomeUpdate
from fastapi import HTTPException

def get_income(db: Session, income_id: int):
    """Get an income by ID"""
    return db.query(Income).filter(Income.id == income_id).first()

def get_incomes_by_balance(db: Session, balance_id: int):
    """Get all incomes for a balance"""
    return db.query(Income).filter(Income.balance_id == balance_id).all()

def get_all_incomes(db: Session, skip: int = 0, limit: int = 100):
    """Get all incomes with pagination"""
    return db.query(Income).offset(skip).limit(limit).all()

def create_income(db: Session, income: IncomeCreate):
    """Create a new income"""
    # Verify that the balance exists
    balance = db.query(Balance).filter(Balance.id == income.balance_id).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    db_income = Income(
        balance_id=income.balance_id,
        source=income.source,
        amount=income.amount
    )
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income

def update_income(db: Session, income_id: int, income: IncomeUpdate):
    """Update an income"""
    db_income = get_income(db, income_id)
    if not db_income:
        return None
    
    update_data = income.dict(exclude_unset=True)
    
    # If balance_id is being updated, verify that the balance exists
    if "balance_id" in update_data:
        balance = db.query(Balance).filter(Balance.id == update_data["balance_id"]).first()
        if not balance:
            raise HTTPException(status_code=404, detail="Balance not found")
    
    for key, value in update_data.items():
        setattr(db_income, key, value)
    
    db.commit()
    db.refresh(db_income)
    return db_income

def delete_income(db: Session, income_id: int):
    """Delete an income"""
    db_income = get_income(db, income_id)
    if db_income:
        db.delete(db_income)
        db.commit()
        return True
    return False