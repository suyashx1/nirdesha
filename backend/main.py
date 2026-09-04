"""
Nirdesha FastAPI Application
====================================

Run from the main Nirdesha project folder:

    uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
"""

from __future__ import annotations

from contextlib import (
    asynccontextmanager,
)

from fastapi import FastAPI

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from .database import (
    Base,
    SessionLocal,
    engine,
)

from .routers import (
    competency,
    evidence,
    profiles,
)

from .seed import (
    seed_database,
)


# ---------------------------------------------------------------------------
# STARTUP
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(
    _app: FastAPI,
):

    # Create SQLite tables.
    #
    # For production, Alembic migrations
    # should replace automatic create_all.

    Base.metadata.create_all(
        bind=engine
    )

    # Populate deterministic demo data.

    with SessionLocal() as db:

        seed_database(
            db
        )

    yield


# ---------------------------------------------------------------------------
# FASTAPI APPLICATION
# ---------------------------------------------------------------------------

app = FastAPI(

    title=(
        "Nirdesha Competency "
        "Intelligence API"
    ),

    version=(
        "1.0.0-phase1"
    ),

    description=(

        "Deterministic competency, "
        "skill-gap and evidence engine "
        "for the Nirdesha SIH prototype."

    ),

    lifespan=lifespan,

)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(

    CORSMiddleware,

    # Allows file:// during development.

    allow_origins=[
        "null"
    ],

    # Allows localhost / 127.0.0.1
    # regardless of development port.

    allow_origin_regex=(
        r"https?://"
        r"(localhost|127\.0\.0\.1)"
        r"(:\d+)?"
    ),

    allow_credentials=True,

    allow_methods=[

        "GET",
        "POST",
        "PUT",
        "OPTIONS",

    ],

    allow_headers=[
        "*"
    ],

)


# ---------------------------------------------------------------------------
# ROUTERS
# ---------------------------------------------------------------------------

app.include_router(
    profiles.router
)

app.include_router(
    competency.router
)

app.include_router(
    evidence.router
)


# ---------------------------------------------------------------------------
# ROOT
# ---------------------------------------------------------------------------

@app.get("/")
def root():

    return {

        "name":
            "Nirdesha Competency Intelligence API",

        "phase":
            1,

        "status":
            "ready",

        "docs":
            "/docs",

    }


# ---------------------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():

    return {

        "status":
            "healthy",

        "service":
            "competency-core",

        "phase":
            1,

        "database":
            "connected",

    }