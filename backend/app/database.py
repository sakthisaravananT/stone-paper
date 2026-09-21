import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

# Primary database URL from environment or default MySQL configuration
DEFAULT_MYSQL_URL = "mysql+pymysql://root:password@localhost:3306/stone_paper_scissors"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_MYSQL_URL)

engine = None
SessionLocal = None

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # MySQL engine with connection pool recycling
        engine = create_engine(
            DATABASE_URL,
            pool_recycle=3600,
            pool_pre_ping=True
        )
        # Test connection
        with engine.connect() as conn:
            pass
except Exception as e:
    print(f"[Database Warning] Unable to connect to primary database ({DATABASE_URL}): {e}")
    print("[Database Warning] Falling back to local SQLite database: sqlite:///./stone_paper_scissors.db")
    FALLBACK_URL = "sqlite:///./stone_paper_scissors.db"
    engine = create_engine(FALLBACK_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
