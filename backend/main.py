"""Nirdesha Phase-3 FastAPI application.

Run from project root:

uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001

Port 8001 remains deliberate because server.py continues serving
the frontend + existing AI Mentor on port 8000.
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
    courses,
    evidence,
    learning,
    materials,
    profiles,
    recommendations,
    resume,
)

from .seed import (
    seed_database,
)

from .phase3_seed import (
    seed_phase3_database,
)


# Importing registers table metadata.

from . import phase2_models  # noqa: F401
from . import phase3_models  # noqa: F401


@asynccontextmanager
async def lifespan(
    _app: FastAPI,
):

    # Creates only missing tables.
    #
    # Existing Phase-1 and Phase-2 data
    # remains intact.

    Base.metadata.create_all(
        bind=engine
    )


    with SessionLocal() as db:

        # Existing employee/skill seed.

        seed_database(
            db
        )


        # Phase-3 prototype learning catalogue.

        seed_phase3_database(
            db
        )


    yield


app = FastAPI(

    title=(
        "Nirdesha Competency "
        "Intelligence API"
    ),

    version=
        "3.0.0-phase3",

    description=(

        "Nirdesha competency intelligence, "
        "document/quiz intelligence, "
        "explainable learning recommendations "
        "and adaptive roadmap APIs."

    ),

    lifespan=lifespan,

)


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


# ================================================================
# PHASE 1
# ================================================================

app.include_router(
    profiles.router
)

app.include_router(
    competency.router
)

app.include_router(
    evidence.router
)


# ================================================================
# PHASE 2
# ================================================================

app.include_router(
    resume.router
)

app.include_router(
    materials.router
)


# ================================================================
# PHASE 3
# ================================================================

app.include_router(
    courses.router
)

app.include_router(
    recommendations.router
)

app.include_router(
    learning.router
)


@app.get("/")
def root():

    return {

        "name":
            "Nirdesha Competency Intelligence API",

        "phase":
            3,

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
            3,

        "database":
            "connected",

        "learning_catalogue":
            "prototype_iGOT_NSSTA",

    }