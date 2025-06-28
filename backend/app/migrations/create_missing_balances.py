# backend/app/migrations/create_missing_balances.py
"""
Migration script to create $0 balances for existing users who don't have one.
This should be run once after implementing the auto-balance creation feature.
"""

from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import User, Balance
import logging

logger = logging.getLogger(__name__)

def create_missing_balances():
    """
    Create $0 balances for any existing users who don't have a balance.
    This is a one-time migration for existing users.
    """
    db = SessionLocal()
    try:
        # Find users without balances
        users_without_balance = db.query(User).filter(
            ~User.id.in_(
                db.query(Balance.user_id).filter(Balance.user_id.isnot(None))
            )
        ).all()
        
        if not users_without_balance:
            logger.info("All users already have balances. No migration needed.")
            return 0
        
        logger.info(f"Found {len(users_without_balance)} users without balances")
        
        # Create $0 balances for these users
        balances_created = 0
        for user in users_without_balance:
            try:
                balance = Balance(
                    amount=0.0,
                    user_id=user.id
                )
                db.add(balance)
                balances_created += 1
                logger.info(f"Created $0 balance for user {user.username} (ID: {user.id})")
            except Exception as e:
                logger.error(f"Failed to create balance for user {user.username}: {str(e)}")
                continue
        
        # Commit all new balances
        db.commit()
        logger.info(f"Successfully created {balances_created} new balances")
        return balances_created
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Run the migration
    logging.basicConfig(level=logging.INFO)
    logger.info("Starting balance migration for existing users...")
    
    try:
        count = create_missing_balances()
        logger.info(f"Migration completed successfully. Created {count} new balances.")
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        exit(1)