"""
Phase-4 authoritative context endpoints
for the AI Study Mentor.
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from ..database import (
    get_db,
)

from ..phase4_schemas import (
    MentorContextOut,
    MentorContextSummaryOut,
)

from ..services.mentor_context import (
    build_mentor_context,
)


router = APIRouter(

    prefix="/api/mentor",

    tags=[
        "Phase 4 - Context-Aware AI Mentor"
    ],

)


@router.get(
    "/context/{employee_id}",
    response_model=MentorContextOut,
)
def mentor_context(

    employee_id: int,

    recent_limit: int = Query(
        default=5,
        ge=1,
        le=10,
    ),

    db: Session = Depends(
        get_db
    ),

):

    try:

        return build_mentor_context(

            db,
            employee_id,

            recent_limit=
                recent_limit,

        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,

            detail=str(exc),

        ) from exc


@router.get(
    "/context/{employee_id}/summary",
    response_model=MentorContextSummaryOut,
)
def mentor_context_summary(

    employee_id: int,

    db: Session = Depends(
        get_db
    ),

):

    try:

        context = (
            build_mentor_context(

                db,
                employee_id,

                recent_limit=1,

            )
        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,

            detail=str(exc),

        ) from exc


    return {

        "context_version":
            context[
                "context_version"
            ],

        "generated_at":
            context[
                "generated_at"
            ],

        "employee_id":
            context[
                "employee_id"
            ],

        "employee_name":
            context[
                "employee_name"
            ],

        "current_role":
            context[
                "current_role"
            ],

        "target_role":
            context[
                "target_role"
            ],

        "readiness_pct":
            context[
                "readiness_pct"
            ],

        "top_gap": (

            context[
                "top_gaps"
            ][0]

            if context[
                "top_gaps"
            ]

            else None

        ),

        "active_course":
            context[
                "active_course"
            ],

        "recent_assessment": (

            context[
                "recent_assessments"
            ][0]

            if context[
                "recent_assessments"
            ]

            else None

        ),

        "suggested_prompts":
            context[
                "suggested_prompts"
            ],

    }