from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Boolean, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(Text, nullable=False)  # Using Text for future hashing
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    balances = relationship("Balance", back_populates="user", cascade="all, delete-orphan")
    login_attempts = relationship("LoginAttempt", back_populates="user", cascade="all, delete-orphan")

class Balance(Base):
    __tablename__ = "balances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) 
    amount = Column(Float, nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="balances")
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

class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    ip_address = Column(String(45), nullable=False)
    attempted_at = Column(DateTime(timezone=True), server_default=func.now())
    success = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User", back_populates="login_attempts")