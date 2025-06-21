from typing import List

class PasswordConfig:
    """Configuration for password validation and security policies"""
    
    # Password requirements
    MIN_LENGTH = 8
    MAX_LENGTH = 64
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_NUMBERS = True
    REQUIRE_SPECIAL_CHARS = True
    SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    # Login attempt limits
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 15
    
    # Common passwords to block (basic list - in production, use a comprehensive database)
    COMMON_PASSWORDS = [
        "123456", "123456789", "qwerty", "password", "12345", "12345678",
        "111111", "1234567", "sunshine", "qwerty123", "123123", "welcome",
        "admin", "password123", "iloveyou", "princess", "dragon", "monkey",
        "letmein", "abc123", "mustang", "access", "master", "michael",
        "superman", "696969", "123qwe", "batman", "passw0rd", "freedom",
        "love", "hot", "sexy", "jordan", "harley", "robert", "matthew",
        "daniel", "andrew", "andrea", "joshua", "charlie", "david",
        "jessica", "michelle", "lisa", "ashley", "nicole", "william",
        "phoenix", "carlos", "jennifer", "christian", "football", "jordan23",
        "arsenal", "liverpool", "chelsea", "manchester", "barcelona",
        "welcome123", "admin123", "user", "test", "guest", "demo",
        "temp", "changeme", "secret", "login", "root", "toor", "Administrator"
    ]
    
    # Additional patterns to block
    BLOCKED_PATTERNS = [
        # Sequential numbers
        "012345", "123456", "234567", "345678", "456789", "567890",
        # Sequential letters  
        "abcdef", "bcdefg", "cdefgh", "defghi", "efghij", "fghijk",
        # Keyboard patterns
        "qwerty", "asdfgh", "zxcvbn", "qwertz", "azerty",
        # Common substitutions
        "p@ssw0rd", "passw0rd", "pa$$word", "pa55word"
    ]
    
    @classmethod
    def is_common_password(cls, password: str) -> bool:
        """Check if password is in the common passwords list"""
        password_lower = password.lower()
        
        # Check exact matches
        if password_lower in [p.lower() for p in cls.COMMON_PASSWORDS]:
            return True
            
        # Check blocked patterns
        if password_lower in [p.lower() for p in cls.BLOCKED_PATTERNS]:
            return True
            
        return False
    
    @classmethod
    def get_password_requirements_message(cls) -> str:
        """Get human-readable password requirements"""
        requirements = [
            f"Be between {cls.MIN_LENGTH} and {cls.MAX_LENGTH} characters long"
        ]
        
        if cls.REQUIRE_UPPERCASE:
            requirements.append("Contain at least one uppercase letter")
        if cls.REQUIRE_LOWERCASE:
            requirements.append("Contain at least one lowercase letter")
        if cls.REQUIRE_NUMBERS:
            requirements.append("Contain at least one number")
        if cls.REQUIRE_SPECIAL_CHARS:
            requirements.append(f"Contain at least one special character ({cls.SPECIAL_CHARS})")
            
        requirements.append("Not be a commonly used password")
        
        return "Password must:\n• " + "\n• ".join(requirements)
