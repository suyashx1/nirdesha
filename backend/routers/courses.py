"""Phase-3 structured prototype learning catalogue API."""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db

from ..phase3_models import (
    LearningCourse,
)

from ..phase3_schemas import (
    CourseOut,
)

from ..services.course_service import (
    course_to_dict,
    get_course_by_code,
)


router = APIRouter(

    prefix="/api/courses",

    tags=[
        "Phase 3 - Learning Catalogue"
    ],

)


def _list_course_payloads(
    db: Session,
    *,
    source: str | None = None,
    skill_code: str | None = None,
) -> list[dict]:

    courses = db.scalars(

        select(
            LearningCourse
        )

        .where(

            LearningCourse.active.is_(
                True
            )

        )

        .order_by(

            LearningCourse.source_type,

            LearningCourse.title,

        )

    ).all()


    payloads = [

        course_to_dict(
            db,
            course,
        )

        for course
        in courses

    ]


    if source:

        source_normalized = (
            source
            .strip()
            .lower()
        )


        payloads = [

            item

            for item
            in payloads

            if item[
                "source_type"
            ].lower()
            == source_normalized

        ]


    if skill_code:

        code = (
            skill_code
            .strip()
            .upper()
        )


        payloads = [

            item

            for item
            in payloads

            if any(

                skill[
                    "skill_code"
                ] == code

                for skill
                in item[
                    "skills"
                ]

            )

        ]


    return payloads


@router.get(
    "",
    response_model=list[
        CourseOut
    ],
)
def list_courses(

    source: str | None = Query(
        default=None
    ),

    skill_code: str | None = Query(
        default=None
    ),

    db: Session = Depends(
        get_db
    ),

):

    return _list_course_payloads(

        db,

        source=source,

        skill_code=skill_code,

    )


@router.get(
    "/igot",
    response_model=list[
        CourseOut
    ],
)
def list_igot_courses(
    db: Session = Depends(
        get_db
    ),
):

    return _list_course_payloads(

        db,

        source="igot",

    )


@router.get(
    "/nssta",
    response_model=list[
        CourseOut
    ],
)
def list_nssta_courses(
    db: Session = Depends(
        get_db
    ),
):

    return _list_course_payloads(

        db,

        source="nssta",

    )


@router.get(
    "/{course_code}",
    response_model=CourseOut,
)
def get_course(

    course_code: str,

    db: Session = Depends(
        get_db
    ),

):

    course = get_course_by_code(

        db,
        course_code,

    )


    if course is None:

        raise HTTPException(

            status_code=404,

            detail=
                "Course not found.",

        )


    return course_to_dict(

        db,
        course,

    )