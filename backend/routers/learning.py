"""Phase-3 learning progress API.

Important principle:

Course completion creates `course_completion` evidence.

It does NOT automatically mark the employee as having mastered
the competency.

Quiz/formal assessment remains stronger evidence.
"""

from __future__ import annotations

from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    EmployeeProfile,
    Skill,
    SkillEvidence,
)

from ..phase3_models import (
    LearningCourse,
    LearningProgress,
    CourseSkillMap,
    CoursePrerequisite,
)

from ..phase3_schemas import (
    LearningProgressOut,
    ProgressActionResponse,
    ProgressUpdateRequest,
)

from ..services.competency_engine import (
    get_competency_snapshot,
    recalculate_skill,
)

from ..services.course_service import (
    get_course_by_code,
    get_progress_map,
)


router = APIRouter(

    prefix="/api/learning-progress",

    tags=[
        "Phase 3 - Learning Progress"
    ],

)


def _now() -> datetime:

    return datetime.now(
        timezone.utc
    )


def _progress_payload(
    db: Session,
    progress: LearningProgress,
) -> dict:

    course = db.get(

        LearningCourse,
        progress.course_id,

    )


    return {

        "course_code":
            course.course_code,

        "course_title":
            course.title,

        "status":
            progress.status,

        "progress_pct":
            progress.progress_pct,

        "started_at":
            progress.started_at,

        "last_activity_at":
            progress.last_activity_at,

        "completed_at":
            progress.completed_at,

    }


def _get_employee_and_course(
    db: Session,
    employee_id: int,
    course_code: str,
):

    employee = db.get(

        EmployeeProfile,
        employee_id,

    )


    if employee is None:

        raise HTTPException(

            status_code=404,

            detail=
                "Employee profile not found.",

        )


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


    return (
        employee,
        course,
    )


def _missing_prerequisite_codes(
    db: Session,
    employee_id: int,
    course_id: int,
) -> list[str]:

    prerequisite_courses = db.execute(

        select(

            LearningCourse.id,

            LearningCourse.course_code,

        )

        .join(

            CoursePrerequisite,

            CoursePrerequisite
            .prerequisite_course_id
            == LearningCourse.id,

        )

        .where(

            CoursePrerequisite.course_id
            == course_id

        )

    ).all()


    missing: list[
        str
    ] = []


    for (
        prerequisite_id,
        prerequisite_code,
    ) in prerequisite_courses:

        completed = db.scalar(

            select(
                LearningProgress.id
            )

            .where(

                LearningProgress.employee_id
                == employee_id,

                LearningProgress.course_id
                == prerequisite_id,

                LearningProgress.status
                == "completed",

            )

        )


        if completed is None:

            missing.append(
                prerequisite_code
            )


    return missing


def _ensure_prerequisites(
    db: Session,
    employee_id: int,
    course_id: int,
) -> None:

    missing = (
        _missing_prerequisite_codes(

            db,
            employee_id,
            course_id,

        )
    )


    if missing:

        raise HTTPException(

            status_code=409,

            detail=(

                "Complete prerequisite course(s) first: "

                + ", ".join(
                    missing
                )

            ),

        )


def _get_or_create_progress(
    db: Session,
    employee_id: int,
    course_id: int,
) -> LearningProgress:

    progress = db.scalar(

        select(
            LearningProgress
        )

        .where(

            LearningProgress.employee_id
            == employee_id,

            LearningProgress.course_id
            == course_id,

        )

    )


    if progress is None:

        progress = LearningProgress(

            employee_id=
                employee_id,

            course_id=
                course_id,

            status=
                "not_started",

            progress_pct=
                0.0,

        )


        db.add(
            progress
        )


        db.flush()


    return progress


@router.get(
    "/{employee_id}",
    response_model=list[
        LearningProgressOut
    ],
)
def list_progress(

    employee_id: int,

    db: Session = Depends(
        get_db
    ),

):

    if (
        db.get(
            EmployeeProfile,
            employee_id,
        )
        is None
    ):

        raise HTTPException(

            status_code=404,

            detail=
                "Employee profile not found.",

        )


    progress_map = (
        get_progress_map(

            db,
            employee_id,

        )
    )


    return [

        _progress_payload(

            db,
            progress,

        )

        for progress
        in sorted(

            progress_map.values(),

            key=lambda item:
                item.updated_at,

            reverse=True,

        )

    ]


@router.post(
    "/{employee_id}/courses/{course_code}/start",
    response_model=ProgressActionResponse,
)
def start_course(

    employee_id: int,
    course_code: str,

    db: Session = Depends(
        get_db
    ),

):

    (
        employee,
        course,
    ) = _get_employee_and_course(

        db,
        employee_id,
        course_code,

    )


    _ensure_prerequisites(

        db,
        employee.id,
        course.id,

    )


    progress = (
        _get_or_create_progress(

            db,
            employee.id,
            course.id,

        )
    )


    now = _now()


    if progress.started_at is None:

        progress.started_at = (
            now
        )


    if (
        progress.status
        != "completed"
    ):

        progress.status = (
            "in_progress"
        )


        progress.progress_pct = max(

            float(
                progress.progress_pct
            ),

            5.0,

        )


        progress.last_activity_at = (
            now
        )


    db.commit()


    db.refresh(
        progress
    )


    return {

        "progress":
            _progress_payload(
                db,
                progress,
            ),

        "competency":
            get_competency_snapshot(

                db,
                employee.id,

            ),

        "course_completion_evidence_added":
            0,

    }


@router.put(
    "/{employee_id}/courses/{course_code}",
    response_model=ProgressActionResponse,
)
def update_course_progress(

    employee_id: int,
    course_code: str,

    payload: ProgressUpdateRequest,

    db: Session = Depends(
        get_db
    ),

):

    (
        employee,
        course,
    ) = _get_employee_and_course(

        db,
        employee_id,
        course_code,

    )


    _ensure_prerequisites(

        db,
        employee.id,
        course.id,

    )


    progress = (
        _get_or_create_progress(

            db,
            employee.id,
            course.id,

        )
    )


    now = _now()


    if progress.started_at is None:

        progress.started_at = (
            now
        )


    if (
        progress.status
        != "completed"
    ):

        progress.status = (
            "in_progress"
        )


        # 100% is reserved for
        # explicit completion endpoint.

        progress.progress_pct = min(

            float(
                payload.progress_pct
            ),

            99.0,

        )


        progress.last_activity_at = (
            now
        )


    db.commit()


    db.refresh(
        progress
    )


    return {

        "progress":
            _progress_payload(
                db,
                progress,
            ),

        "competency":
            get_competency_snapshot(

                db,
                employee.id,

            ),

        "course_completion_evidence_added":
            0,

    }


@router.post(
    "/{employee_id}/courses/{course_code}/complete",
    response_model=ProgressActionResponse,
)
def complete_course(

    employee_id: int,
    course_code: str,

    db: Session = Depends(
        get_db
    ),

):

    (
        employee,
        course,
    ) = _get_employee_and_course(

        db,
        employee_id,
        course_code,

    )


    _ensure_prerequisites(

        db,
        employee.id,
        course.id,

    )


    progress = (
        _get_or_create_progress(

            db,
            employee.id,
            course.id,

        )
    )


    now = _now()


    if progress.started_at is None:

        progress.started_at = (
            now
        )


    progress.status = (
        "completed"
    )


    progress.progress_pct = (
        100.0
    )


    progress.last_activity_at = (
        now
    )


    progress.completed_at = (

        progress.completed_at

        or now

    )


    # -------------------------------------------------------------
    # COURSE COMPLETION EVIDENCE
    #
    # Only PRIMARY skill receives the completion evidence.
    #
    # This prevents one course from artificially inflating
    # many skills.
    # -------------------------------------------------------------

    primary_rows = db.execute(

        select(
            CourseSkillMap,
            Skill,
        )

        .join(

            Skill,

            Skill.id
            == CourseSkillMap.skill_id,

        )

        .where(

            CourseSkillMap.course_id
            == course.id,

            CourseSkillMap.is_primary.is_(
                True
            ),

        )

        .order_by(

            CourseSkillMap
            .relevance_weight
            .desc()

        )

    ).all()


    evidence_added = 0


    touched_skill_ids: set[
        int
    ] = set()


    if primary_rows:

        mapping, skill = (
            primary_rows[0]
        )


        source_ref = (

            f"course-completion-"
            f"{employee.id}-"
            f"{course.course_code}-"
            f"{skill.code}"

        )


        existing = db.scalar(

            select(
                SkillEvidence
            )

            .where(

                SkillEvidence.employee_id
                == employee.id,

                SkillEvidence.skill_id
                == skill.id,

                SkillEvidence.source_ref
                == source_ref,

            )

        )


        if existing is None:

            db.add(

                SkillEvidence(

                    employee_id=
                        employee.id,

                    skill_id=
                        skill.id,

                    evidence_type=
                        "course_completion",

                    score=
                        100.0,

                    source=
                        "phase3_learning_path",

                    source_ref=
                        source_ref,

                    notes=(

                        "Prototype learning-course completion evidence. "
                        "Completion does not by itself prove mastery; "
                        "follow-up assessment remains required."

                    ),

                    metadata_json={

                        "course_code":
                            course.course_code,

                        "course_title":
                            course.title,

                        "source_label":
                            course.source_label,

                    },

                    recorded_at=
                        now,

                )

            )


            evidence_added = 1


            touched_skill_ids.add(
                skill.id
            )


    db.flush()


    # Recalculate only skills affected by
    # the new completion evidence.

    for skill_id in touched_skill_ids:

        recalculate_skill(

            db,
            employee.id,
            skill_id,

        )


    db.commit()


    db.refresh(
        progress
    )


    return {

        "progress":
            _progress_payload(
                db,
                progress,
            ),

        "competency":
            get_competency_snapshot(

                db,
                employee.id,

            ),

        "course_completion_evidence_added":
            evidence_added,

    }