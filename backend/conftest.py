import os

# Set test environment variables before any app modules are imported by pytest
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
os.environ.setdefault("ANTHROPIC_API_KEY", "test-key")