import hashlib
import secrets
import base64
from typing import Tuple
import logging

logger = logging.getLogger(__name__)

class PasswordHasher:
    """
    PBKDF2 password hashing with unique salts
    """
    
    # PBKDF2 configuration - following OWASP recommendations
    ALGORITHM = 'sha256'
    ITERATIONS = 600_000  # OWASP 2023 recommendation for PBKDF2-SHA256
    SALT_LENGTH = 32      # 32 bytes = 256 bits
    HASH_LENGTH = 32      # 32 bytes = 256 bits
    
    @classmethod
    def generate_salt(cls) -> bytes:
        """Generate a cryptographically secure random salt"""
        return secrets.token_bytes(cls.SALT_LENGTH)
    
    @classmethod
    def hash_password(cls, password: str, salt: bytes = None) -> str:
        """
        Hash a password using PBKDF2 with a unique salt
        
        Args:
            password: The plain text password to hash
            salt: Optional salt (if None, generates a new one)
            
        Returns:
            String in format "salt:hash" (both base64 encoded)
        """
        if salt is None:
            salt = cls.generate_salt()
        
        # Hash the password using PBKDF2
        password_hash = hashlib.pbkdf2_hmac(
            cls.ALGORITHM,
            password.encode('utf-8'),
            salt,
            cls.ITERATIONS,
            cls.HASH_LENGTH
        )
        
        # Encode salt and hash as base64 for storage
        salt_b64 = base64.b64encode(salt).decode('utf-8')
        hash_b64 = base64.b64encode(password_hash).decode('utf-8')
        
        # Return in format "salt:hash"
        return f"{salt_b64}:{hash_b64}"
    
    @classmethod
    def verify_password(cls, password: str, stored_hash: str) -> bool:
        """
        Verify a password against a stored hash
        
        Args:
            password: The plain text password to verify
            stored_hash: The stored hash in format "salt:hash"
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            # Split the stored hash into salt and hash components
            if ':' not in stored_hash:
                logger.warning("Invalid hash format - missing separator")
                return False
            
            salt_b64, hash_b64 = stored_hash.split(':', 1)
            
            # Decode the salt and hash from base64
            salt = base64.b64decode(salt_b64.encode('utf-8'))
            stored_password_hash = base64.b64decode(hash_b64.encode('utf-8'))
            
            # Hash the provided password with the same salt
            password_hash = hashlib.pbkdf2_hmac(
                cls.ALGORITHM,
                password.encode('utf-8'),
                salt,
                cls.ITERATIONS,
                cls.HASH_LENGTH
            )
            
            # Use secrets.compare_digest for timing-safe comparison
            return secrets.compare_digest(password_hash, stored_password_hash)
            
        except Exception as e:
            logger.error(f"Error verifying password: {str(e)}")
            return False
    
    @classmethod
    def is_password_hashed(cls, password: str) -> bool:
        """
        Check if a password is already hashed (contains salt:hash format)
        
        Args:
            password: The password string to check
            
        Returns:
            True if password appears to be hashed, False otherwise
        """
        if not isinstance(password, str):
            return False
        
        # Check if it has the expected format: salt:hash
        if ':' not in password:
            return False
        
        try:
            salt_b64, hash_b64 = password.split(':', 1)
            
            # Verify base64 encoding and expected lengths
            salt = base64.b64decode(salt_b64.encode('utf-8'))
            password_hash = base64.b64decode(hash_b64.encode('utf-8'))
            
            # Check expected lengths
            return (len(salt) == cls.SALT_LENGTH and 
                   len(password_hash) == cls.HASH_LENGTH)
                   
        except Exception:
            return False

    @classmethod
    def get_hash_info(cls, stored_hash: str) -> dict:
        """
        Get information about a stored hash (for debugging/migration)
        
        Args:
            stored_hash: The stored hash in format "salt:hash"
            
        Returns:
            Dictionary with hash information
        """
        try:
            salt_b64, hash_b64 = stored_hash.split(':', 1)
            salt = base64.b64decode(salt_b64.encode('utf-8'))
            password_hash = base64.b64decode(hash_b64.encode('utf-8'))
            
            return {
                "algorithm": cls.ALGORITHM,
                "iterations": cls.ITERATIONS,
                "salt_length": len(salt),
                "hash_length": len(password_hash),
                "format": "salt:hash (base64)",
                "valid": len(salt) == cls.SALT_LENGTH and len(password_hash) == cls.HASH_LENGTH
            }
        except Exception as e:
            return {"error": str(e), "valid": False}