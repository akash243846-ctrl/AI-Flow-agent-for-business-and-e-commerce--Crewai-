"""
AgentFlow AI - Database Engine and Session Management
Configured for SQLite by default, compatible with PostgreSQL migration.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import settings

# For SQLite, check_same_thread=False allows FastAPI multi-threading
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """FastAPI dependency for database session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initializes tables in the database."""
    from backend.app.models import db_models  # Ensure models are loaded
    Base.metadata.create_all(bind=engine)
