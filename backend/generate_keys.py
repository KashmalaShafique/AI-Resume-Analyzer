#!/usr/bin/env python3
"""
Generate secret keys for the application
"""
import secrets
import os

def generate_secret_key():
    """Generate a secure secret key"""
    return secrets.token_urlsafe(32)

def create_env_file():
    """Create .env file with generated keys"""
    secret_key = generate_secret_key()
    
    env_content = f"""# Database Configuration
DATABASE_URL=postgresql://postgres:1234@localhost:5432/resume_analyzer

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Security Configuration
SECRET_KEY={secret_key}

# Server Configuration
HOST=0.0.0.0
PORT=8000
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created with generated secret key!")
    print(f"🔑 Secret Key: {secret_key}")
    print("\n📝 Next steps:")
    print("1. Update DATABASE_URL with your PostgreSQL password")
    print("2. Get OpenAI API key from: https://platform.openai.com/api-keys")
    print("3. Replace 'your_openai_api_key_here' with your actual key")

if __name__ == "__main__":
    print("🔐 Generating Secret Keys")
    print("=" * 30)
    create_env_file()
