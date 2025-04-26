from sqlalchemy.orm import Session
from db.models import Expense, Balance
from schemas.balance import ExpenseCreate, ExpenseUpdate
from fastapi import HTTPException

def get_expense(db: Session, expense_id: int):
    """Get an expense by ID"""
    return db.query(Expense).filter(Expense.id == expense_id).first()

def get_expenses_by_balance(db: Session, balance_id: int):
    """Get all expenses for a balance"""
    return db.query(Expense).filter(Expense.balance_id == balance_id).all()

def get_all_expenses(db: Session, skip: int = 0, limit: int = 100):
    """Get all expenses with pagination"""
    return db.query(Expense).offset(skip).limit(limit).all()

def create_expense(db: Session, expense: ExpenseCreate):
    """Create a new expense"""
    # Verify that the balance exists
    balance = db.query(Balance).filter(Balance.id == expense.balance_id).first()
    if not balance:
        raise HTTPException(status_code=404, detail="Balance not found")
    
    db_expense = Expense(
        balance_id=expense.balance_id,
        category=expense.category,
        amount=expense.amount
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def update_expense(db: Session, expense_id: int, expense: ExpenseUpdate):
    """Update an expense"""
    db_expense = get_expense(db, expense_id)
    if not db_expense:
        return None
    
    update_data = expense.dict(exclude_unset=True)
    
    # If balance_id is being updated, verify that the balance exists
    if "balance_id" in update_data:
        balance = db.query(Balance).filter(Balance.id == update_data["balance_id"]).first()
        if not balance:
            raise HTTPException(status_code=404, detail="Balance not found")
    
    for key, value in update_data.items():
        setattr(db_expense, key, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

def delete_expense(db: Session, expense_id: int):
    """Delete an expense"""
    db_expense = get_expense(db, expense_id)
    if db_expense:
        db.delete(db_expense)
        db.commit()
        return True
    return False