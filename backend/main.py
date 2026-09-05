"""Nirdesha FastAPI application.

Run from the Nirdesha project root:

uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
"""

from __future__ import annotations

from contextlib import asynccontextmanager

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
    materials,
    profile,
    resume,
)

from .seed import (
    seed_database,
)

# Importing this module registers
# Phase-2 tables with SQLAlchemy metadata.
from . import phase2_models  # noqa: F401


@asynccontextmanager
async def lifespan(
    _app: FastAPI,
):

    # Creates missing tables only.
    #
    # Existing Phase-1 tables/data are
    # not dropped or reset.

    Base.metadata.create_all(
        bind=engine
    )

    with SessionLocal() as db:

        seed_database(
            db
        )

    yield


app = FastAPI(

    title=(
        "Nirdesha Competency "
        "Intelligence API"
    ),

    version=(
        "2.0.0-phase2"
    ),

    description=(
        "Nirdesha competency core plus "
        "Phase-2 document intelligence "
        "and source-grounded quiz generation."
    ),

    lifespan=lifespan,

)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "null"
    ],

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
# PHASE 1 ROUTERS
# ---------------------------------------------------------------------------

app.include_router(
    profile.router
)

app.include_router(
    competency.router
)

app.include_router(
    evidence.router
)


# ---------------------------------------------------------------------------
# PHASE 2 ROUTERS
# ---------------------------------------------------------------------------

app.include_router(
    resume.router
)

app.include_router(
    materials.router
)


@app.get("/")
def root():

    return {

        "name":
            "Nirdesha Competency Intelligence API",

        "phase":
            2,

        "status":
            "ready",

        "docs":
            "/docs",

    }


@app.get("/api/health")
def health():

    return {

        "status":
            "healthy",

        "service":
            "competency-core",

        "phase":
            2,

        "database":
            "connected",

    }