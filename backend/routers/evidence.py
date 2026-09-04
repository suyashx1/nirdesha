"""
Evidence and Assessment API
===========================

Quiz
  ↓
Score 85% in Python
  ↓
SkillEvidence
  ↓
Confidence recalculated
  ↓
Gap recalculated
  ↓
Dashboard receives new value
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

from ..schemas import (
    AssessmentResultCreate,
    AssessmentResultResponse,
    EvidenceCreate,
    EvidenceCreateResponse,
    EvidenceOut,
)

from ..services.competency_engine import (
    get_competency_snapshot,
    recalculate_skill,
)


router = APIRouter(

    prefix="/api",
    tags=["Evidence"],

)


# ---------------------------------------------------------------------------
# SKILL RESOLVER
# ---------------------------------------------------------------------------

def resolve_skill(
    db: Session,
    skill_id: int | None,
    skill_code: str | None,
) -> Skill:

    skill = None

    if skill_id is not None:

        skill = db.get(
            Skill,
            skill_id,
        )

    if (
        skill is None
        and skill_code
    ):

        skill = db.scalar(

            select(Skill)

            .where(

                Skill.code
                == skill_code
                .strip()
                .upper()

            )

        )

    if skill is None:

        raise HTTPException(

            status_code=404,
            detail="Skill not found.",

        )

    return skill


# ---------------------------------------------------------------------------
# FIND ONE SKILL INSIDE SNAPSHOT
# ---------------------------------------------------------------------------

def find_snapshot_skill(
    snapshot: dict,
    skill_id: int,
):

    return next(

        (

            item

            for item
            in snapshot["skills"]

            if item["skill_id"]
            == skill_id

        ),

        None,

    )


# ---------------------------------------------------------------------------
# ADD SINGLE EVIDENCE
# ---------------------------------------------------------------------------

@router.post(
    "/evidence",
    response_model=EvidenceCreateResponse,
    status_code=201,
)
def create_evidence(
    payload: EvidenceCreate,
    db: Session = Depends(get_db),
):

    employee = db.get(

        EmployeeProfile,
        payload.employee_id,

    )

    if employee is None:

        raise HTTPException(

            status_code=404,
            detail="Employee profile not found.",

        )

    skill = resolve_skill(

        db,
        payload.skill_id,
        payload.skill_code,

    )

    evidence = SkillEvidence(

        employee_id=
            employee.id,

        skill_id=
            skill.id,

        evidence_type=
            payload.evidence_type,

        score=
            payload.score,

        source=
            payload.source,

        source_ref=
            payload.source_ref,

        notes=
            payload.notes,

        metadata_json=
            payload.metadata,

        recorded_at=(

            payload.recorded_at

            or datetime.now(
                timezone.utc
            )

        ),

    )

    db.add(
        evidence
    )

    db.flush()

    # Immediately update only
    # the affected competency.

    recalculate_skill(

        db,
        employee.id,
        skill.id,

    )

    db.commit()

    db.refresh(
        evidence
    )

    snapshot = (
        get_competency_snapshot(

            db,
            employee.id,

        )
    )

    return {

        "evidence":
            evidence,

        "updated_skill":
            find_snapshot_skill(

                snapshot,
                skill.id,

            ),

    }


# ---------------------------------------------------------------------------
# LIST EMPLOYEE EVIDENCE
# ---------------------------------------------------------------------------

@router.get(
    "/evidence/{employee_id}",
    response_model=list[EvidenceOut],
)
def list_evidence(
    employee_id: int,
    db: Session = Depends(get_db),
):

    employee = db.get(

        EmployeeProfile,
        employee_id,

    )

    if employee is None:

        raise HTTPException(

            status_code=404,
            detail="Employee profile not found.",

        )

    return db.scalars(

        select(
            SkillEvidence
        )

        .where(

            SkillEvidence.employee_id
            == employee_id

        )

        .order_by(

            SkillEvidence
            .recorded_at
            .desc()

        )

    ).all()


# ---------------------------------------------------------------------------
# SAVE COMPLETE QUIZ / ASSESSMENT RESULT
# ---------------------------------------------------------------------------

@router.post(
    "/assessment-result",
    response_model=AssessmentResultResponse,
    status_code=201,
)
def save_assessment_result(
    payload: AssessmentResultCreate,
    db: Session = Depends(get_db),
):
    """
    Receives one normalized score per skill.

    Example:

    Python:
    8 correct / 10
        ↓
    80%
        ↓
    Stored as quiz evidence
    """

    employee = db.get(

        EmployeeProfile,
        payload.employee_id,

    )

    if employee is None:

        raise HTTPException(

            status_code=404,
            detail="Employee profile not found.",

        )

    saved = []

    touched_skill_ids = set()

    for result in payload.results:

        skill = db.scalar(

            select(Skill)

            .where(

                Skill.code
                == result.skill_code
                .strip()
                .upper()

            )

        )

        if skill is None:

            raise HTTPException(

                status_code=400,

                detail=(
                    "Unknown skill_code: "
                    f"{result.skill_code}"
                ),

            )

        metadata = dict(
            result.metadata
            or {}
        )

        if result.correct is not None:

            metadata[
                "correct"
            ] = result.correct

        if result.total is not None:

            metadata[
                "total"
            ] = result.total

        metadata[
            "assessment_title"
        ] = payload.assessment_title

        evidence = SkillEvidence(

            employee_id=
                employee.id,

            skill_id=
                skill.id,

            evidence_type=
                payload.assessment_type,

            score=
                result.score,

            source=
                "assessment_engine",

            source_ref=
                payload.source_ref,

            notes=(

                "Assessment evidence from: "
                f"{payload.assessment_title}"

            ),

            metadata_json=
                metadata,

            recorded_at=
                datetime.now(
                    timezone.utc
                ),

        )

        db.add(
            evidence
        )

        saved.append(
            evidence
        )

        touched_skill_ids.add(
            skill.id
        )

    db.flush()

    # Recalculate only skills
    # affected by this assessment.

    for skill_id in touched_skill_ids:

        recalculate_skill(

            db,
            employee.id,
            skill_id,

        )

    db.commit()

    for evidence in saved:

        db.refresh(
            evidence
        )

    return {

        "saved_evidence":
            saved,

        "competency":
            get_competency_snapshot(

                db,
                employee.id,

            ),

    }