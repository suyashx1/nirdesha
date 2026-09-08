"""Phase-3 explainable recommendation and adaptive roadmap API."""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy.orm import Session

from ..database import get_db

from ..phase3_schemas import (
    RecommendationOut,
    RecommendationResponse,
    RoadmapOut,
)

from ..services.recommendation_engine import (
    get_recommendations,
)

from ..services.roadmap_engine import (
    build_roadmap,
)


router = APIRouter(

    prefix="/api",

    tags=[
        "Phase 3 - Recommendations & Roadmap"
    ],

)


@router.get(
    "/recommendations/{employee_id}",
    response_model=RecommendationResponse,
)
def recommendations(

    employee_id: int,

    limit: int = Query(
        default=8,
        ge=1,
        le=20,
    ),

    db: Session = Depends(
        get_db
    ),

):

    try:

        return get_recommendations(

            db,
            employee_id,

            limit=limit,

        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,
            detail=str(exc),

        ) from exc


@router.get(
    "/recommendations/{employee_id}/top",
    response_model=RecommendationOut | None,
)
def top_recommendation(

    employee_id: int,

    db: Session = Depends(
        get_db
    ),

):

    try:

        response = (
            get_recommendations(

                db,
                employee_id,

                limit=1,

            )
        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,
            detail=str(exc),

        ) from exc


    items = response[
        "recommendations"
    ]


    return (

        items[0]

        if items

        else None

    )


@router.get(
    "/roadmap/{employee_id}",
    response_model=RoadmapOut,
)
def roadmap(

    employee_id: int,

    db: Session = Depends(
        get_db
    ),

):

    try:

        return build_roadmap(

            db,
            employee_id,

        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,
            detail=str(exc),

        ) from exc