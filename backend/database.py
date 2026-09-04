"""
SQLite is used because it requires no external setup.

Later, the same SQLAlchemy models can be moved to PostgreSQL simply by
changing the DATABASE_URL.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


# ---------------------------------------------------------------------------
# DATABASE LOCATION
# ---------------------------------------------------------------------------

BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_DB_PATH = BACKEND_DIR / "nirdesha.db"

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{DEFAULT_DB_PATH.as_posix()}",
)


# ---------------------------------------------------------------------------
# SQLALCHEMY BASE
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    """Base class inherited by every database model."""
    pass


# ---------------------------------------------------------------------------
# DATABASE ENGINE
# ---------------------------------------------------------------------------

engine_kwargs = {
    "pool_pre_ping": True,
}

if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {
        "check_same_thread": False
    }

engine = create_engine(
    DATABASE_URL,
    **engine_kwargs,
)


# ---------------------------------------------------------------------------
# DATABASE SESSION
# ---------------------------------------------------------------------------

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    expire_on_commit=False,
)


# ---------------------------------------------------------------------------
# SQLITE FOREIGN KEY SUPPORT
# ---------------------------------------------------------------------------

if DATABASE_URL.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def enable_sqlite_foreign_keys(
        dbapi_connection,
        _connection_record,
    ):
        """
        SQLite does not enforce foreign keys by default.
        This enables behaviour closer to PostgreSQL.
        """

        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


# ---------------------------------------------------------------------------
# FASTAPI DATABASE DEPENDENCY
# ---------------------------------------------------------------------------

def get_db() -> Generator[Session, None, None]:
    """
    Creates one database session for each API request
    and closes it automatically.
    """

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()