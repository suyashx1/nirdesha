"""
Role, Skill and Competency API:
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    Role,
    Skill,
)

from ..schemas import (
    CompetencySkillItem,
    CompetencySummary,
    RoleOut,
    SkillOut,
)

from ..services.competency_engine import (
    get_competency_snapshot,
    recalculate_employee_skills,
)


router = APIRouter(

    prefix="/api",
    tags=["Competency"],

)


# ---------------------------------------------------------------------------
# ROLES
# ---------------------------------------------------------------------------

@router.get(
    "/roles",
    response_model=list[RoleOut],
)
def list_roles(
    db: Session = Depends(get_db),
):

    return db.scalars(

        select(Role)

        .order_by(

            Role.level.asc(),
            Role.name.asc(),

        )

    ).all()


# ---------------------------------------------------------------------------
# SKILLS
# ---------------------------------------------------------------------------

@router.get(
    "/skills",
    response_model=list[SkillOut],
)
def list_skills(
    db: Session = Depends(get_db),
):

    return db.scalars(

        select(Skill)

        .where(
            Skill.active.is_(True)
        )

        .order_by(
            Skill.domain,
            Skill.name,
        )

    ).all()


# ---------------------------------------------------------------------------
# FULL COMPETENCY SNAPSHOT
# ---------------------------------------------------------------------------

@router.get(
    "/competency/{employee_id}",
    response_model=CompetencySummary,
)
def competency_snapshot(
    employee_id: int,
    db: Session = Depends(get_db),
):

    try:

        return get_competency_snapshot(

            db,
            employee_id,

        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,
            detail=str(exc),

        ) from exc


# ---------------------------------------------------------------------------
# ONLY SKILL GAPS
# ---------------------------------------------------------------------------

@router.get(
    "/competency/{employee_id}/gaps",
    response_model=list[CompetencySkillItem],
)
def competency_gaps(
    employee_id: int,
    db: Session = Depends(get_db),
):

    try:

        snapshot = (
            get_competency_snapshot(

                db,
                employee_id,

            )
        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,
            detail=str(exc),

        ) from exc

    return [

        item

        for item
        in snapshot["skills"]

        if item["gap_size"] > 0

    ]


# ---------------------------------------------------------------------------
# ONE SPECIFIC SKILL
# ---------------------------------------------------------------------------

@router.get(
    "/competency/{employee_id}/skill/{skill_code}",
    response_model=CompetencySkillItem,
)
def competency_skill(
    employee_id: int,
    skill_code: str,
    db: Session = Depends(get_db),
):

    try:

        snapshot = (
            get_competency_snapshot(

                db,
                employee_id,

            )
        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,
            detail=str(exc),

        ) from exc

    requested_code = (
        skill_code
        .strip()
        .upper()
    )

    item = next(

        (

            skill

            for skill
            in snapshot["skills"]

            if (
                skill["skill_code"]
                .upper()
                == requested_code
            )

        ),

        None,

    )

    if item is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Skill is not part of "
                "the evaluated role mapping."
            ),

        )

    return item


# ---------------------------------------------------------------------------
# MANUAL RECALCULATION
# ---------------------------------------------------------------------------

@router.post(
    "/competency/{employee_id}/recalculate",
    response_model=CompetencySummary,
)
def recalculate(
    employee_id: int,
    db: Session = Depends(get_db),
):

    try:

        recalculate_employee_skills(

            db,
            employee_id,

        )

        return get_competency_snapshot(

            db,
            employee_id,

        )

    except ValueError as exc:

        raise HTTPException(

            status_code=404,
            detail=str(exc),

        ) from exc