from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Balance(Base):
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    
    # Relationships
    incomes = relationship("Income", back_populates="balance", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="balance", cascade="all, delete-orphan")
    suggestion = relationship("SuggestionCache", back_populates="balance", uselist=False, cascade="all, delete-orphan")

class Income(Base):
    __tablename__ = "incomes"

    id = Column(Integer, primary_key=True, index=True)
    balance_id = Column(Integer, ForeignKey("balances.id"), nullable=False)
    source = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    balance = relationship("Balance", back_populates="incomes")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    balance_id = Column(Integer, ForeignKey("balances.id"), nullable=False)
    category = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    balance = relationship("Balance", back_populates="expenses")

class SuggestionCache(Base):
    __tablename__ = "suggestions_cache"

    id = Column(Integer, primary_key=True, index=True)
    balance_id = Column(Integer, ForeignKey("balances.id"), unique=True, nullable=False)
    suggestion_data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    balance = relationship("Balance", back_populates="suggestion")