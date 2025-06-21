import pytest
from core.password_hashing import PasswordHasher

class TestPasswordHasher:
    """Test cases for PasswordHasher class"""
    
    def test_hash_password_creates_unique_hashes(self):
        """Test that the same password creates different hashes due to unique salts"""
        password = "TestPassword123!"
        
        hash1 = PasswordHasher.hash_password(password)
        hash2 = PasswordHasher.hash_password(password)
        
        # Should be different due to unique salts
        assert hash1 != hash2
        assert ":" in hash1
        assert ":" in hash2
    
    def test_verify_password_correct(self):
        """Test that correct password verification works"""
        password = "TestPassword123!"
        stored_hash = PasswordHasher.hash_password(password)
        
        # Correct password should verify
        assert PasswordHasher.verify_password(password, stored_hash) is True
    
    def test_verify_password_incorrect(self):
        """Test that incorrect password verification fails"""
        password = "TestPassword123!"
        wrong_password = "WrongPassword123!"
        stored_hash = PasswordHasher.hash_password(password)
        
        # Wrong password should not verify
        assert PasswordHasher.verify_password(wrong_password, stored_hash) is False
    
    def test_is_password_hashed_detection(self):
        """Test detection of hashed vs plain text passwords"""
        plain_password = "PlainTextPassword123!"
        hashed_password = PasswordHasher.hash_password(plain_password)
        
        # Should correctly identify hashed vs plain text
        assert PasswordHasher.is_password_hashed(plain_password) is False
        assert PasswordHasher.is_password_hashed(hashed_password) is True
        
        # Edge cases
        assert PasswordHasher.is_password_hashed("invalid:hash") is False
        assert PasswordHasher.is_password_hashed("") is False
        assert PasswordHasher.is_password_hashed("no_colon") is False
    
    def test_hash_info(self):
        """Test getting hash information"""
        password = "TestPassword123!"
        stored_hash = PasswordHasher.hash_password(password)
        
        info = PasswordHasher.get_hash_info(stored_hash)
        
        assert info["algorithm"] == "sha256"
        assert info["iterations"] == 600_000
        assert info["salt_length"] == 32
        assert info["hash_length"] == 32
        assert info["valid"] is True
    
    def test_hash_with_custom_salt(self):
        """Test hashing with a provided salt"""
        password = "TestPassword123!"
        salt = PasswordHasher.generate_salt()
        
        hash1 = PasswordHasher.hash_password(password, salt)
        hash2 = PasswordHasher.hash_password(password, salt)
        
        # Same salt should produce same hash
        assert hash1 == hash2
        assert PasswordHasher.verify_password(password, hash1) is True
    
    def test_security_parameters(self):
        """Test that security parameters meet OWASP recommendations"""
        # OWASP 2023 recommendations
        assert PasswordHasher.ITERATIONS >= 600_000  # PBKDF2-SHA256
        assert PasswordHasher.SALT_LENGTH >= 16      # Minimum 128 bits
        assert PasswordHasher.HASH_LENGTH >= 16      # Minimum 128 bits
        assert PasswordHasher.ALGORITHM == "sha256"   # Strong algorithm
    
    def test_empty_and_edge_cases(self):
        """Test edge cases and error handling"""
        # Empty password
        empty_hash = PasswordHasher.hash_password("")
        assert PasswordHasher.verify_password("", empty_hash) is True
        assert PasswordHasher.verify_password("not empty", empty_hash) is False
        
        # Very long password
        long_password = "a" * 1000
        long_hash = PasswordHasher.hash_password(long_password)
        assert PasswordHasher.verify_password(long_password, long_hash) is True
        
        # Special characters
        special_password = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        special_hash = PasswordHasher.hash_password(special_password)
        assert PasswordHasher.verify_password(special_password, special_hash) is True
        
        # Unicode characters
        unicode_password = "Тест123!пароль"
        unicode_hash = PasswordHasher.hash_password(unicode_password)
        assert PasswordHasher.verify_password(unicode_password, unicode_hash) is True

if __name__ == "__main__":
    # Quick manual test
    print("🔐 Testing PBKDF2 Password Hashing...")
    
    # Test basic functionality
    password = "TestPassword123!"
    print(f"Original password: {password}")
    
    hashed = PasswordHasher.hash_password(password)
    print(f"Hashed password: {hashed}")
    
    # Test verification
    verification_result = PasswordHasher.verify_password(password, hashed)
    print(f"Verification result: {verification_result}")
    
    # Test with wrong password
    wrong_verification = PasswordHasher.verify_password("WrongPassword", hashed)
    print(f"Wrong password verification: {wrong_verification}")
    
    # Test hash detection
    is_hashed = PasswordHasher.is_password_hashed(hashed)
    is_plain = PasswordHasher.is_password_hashed(password)
    print(f"Hash detection - hashed: {is_hashed}, plain: {is_plain}")
    
    # Show hash info
    info = PasswordHasher.get_hash_info(hashed)
    print(f"Hash info: {info}")
    
    print("✅ PBKDF2 implementation test completed!")