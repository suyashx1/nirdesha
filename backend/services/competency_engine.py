"""
Nirdesha Deterministic Competency Engine
=======================================

Responsibilities:

1. Calculate employee skill state
2. Calculate role skill gaps
3. Prioritize gaps
4. Calculate role readiness
5. Explain why a skill is considered a priority
"""

from __future__ import annotations

from datetime import (
    datetime,
    timezone,
)

from sqlalchemy import select

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from ..models import (
    EmployeeProfile,
    EmployeeSkill,
    RoleSkillRequirement,
    Skill,
    SkillEvidence,
)

from .confidence_engine import (
    calculate_confidence,
)


# ---------------------------------------------------------------------------
# PRIORITY WEIGHTS
# ---------------------------------------------------------------------------

W_GAP = 0.40
W_CRITICALITY = 0.30
W_RECENCY = 0.10
W_BLOCKS_TARGET = 0.20


# ---------------------------------------------------------------------------
# RECENCY PENALTY
# ---------------------------------------------------------------------------

def recency_penalty(
    last_evidence_at: datetime | None,
) -> float:
    """
    Return a 0-5 penalty.

    New evidence = low penalty.
    Old/no evidence = high penalty.
    """

    if last_evidence_at is None:
        return 5.0

    if last_evidence_at.tzinfo is None:

        last_evidence_at = (
            last_evidence_at.replace(
                tzinfo=timezone.utc
            )
        )

    now = datetime.now(
        timezone.utc
    )

    days = max(
        0,
        (
            now
            - last_evidence_at.astimezone(
                timezone.utc
            )
        ).days,
    )

    if days <= 30:
        return 0.0

    if days <= 90:
        return 1.0

    if days <= 180:
        return 2.0

    if days <= 365:
        return 3.0

    return 5.0


# ---------------------------------------------------------------------------
# HUMAN-FRIENDLY LABELS
# ---------------------------------------------------------------------------

def gap_label(
    gap: int,
) -> str:

    if gap <= 0:
        return "Requirement Met"

    if gap == 1:
        return "Minor Gap"

    if gap == 2:
        return "Moderate Gap"

    return "High Gap"


def priority_label(
    score: float,
    gap: int,
) -> str:

    if gap <= 0:
        return "Met"

    if score >= 3.5:
        return "Critical"

    if score >= 2.5:
        return "High"

    if score >= 1.5:
        return "Moderate"

    return "Low"


# ---------------------------------------------------------------------------
# EXPLANATION GENERATOR
# ---------------------------------------------------------------------------

def build_reason(
    skill_name: str,
    current: int,
    required: int,
    priority: str,
    blocks_progression: bool,
) -> str:

    if current >= required:

        return (
            f"{skill_name} currently meets "
            f"the evaluated role requirement "
            f"({current}/5 vs {required}/5)."
        )

    text = (
        f"{skill_name} is {current}/5 "
        f"while the evaluated role requires "
        f"{required}/5."
    )

    if blocks_progression:

        text += (
            " It is marked as a "
            "progression-critical competency "
            "in the prototype role mapping."
        )

    text += (
        f" Priority: {priority}."
    )

    return text


# ---------------------------------------------------------------------------
# EMPLOYEE LOADER
# ---------------------------------------------------------------------------

def get_employee(
    db: Session,
    employee_id: int,
):

    return db.scalar(

        select(
            EmployeeProfile
        )

        .options(

            joinedload(
                EmployeeProfile.department
            ),

            joinedload(
                EmployeeProfile.current_role
            ),

            joinedload(
                EmployeeProfile.target_role
            ),

        )

        .where(
            EmployeeProfile.id
            == employee_id
        )

    )


# ---------------------------------------------------------------------------
# RECALCULATE ONE SKILL
# ---------------------------------------------------------------------------

def recalculate_skill(
    db: Session,
    employee_id: int,
    skill_id: int,
) -> EmployeeSkill:
    """
    Recalculate one employee skill
    using all available evidence.
    """

    employee = db.get(
        EmployeeProfile,
        employee_id,
    )

    skill = db.get(
        Skill,
        skill_id,
    )

    if employee is None:
        raise ValueError(
            "Employee not found."
        )

    if skill is None:
        raise ValueError(
            "Skill not found."
        )

    evidence = db.scalars(

        select(
            SkillEvidence
        )

        .where(

            SkillEvidence.employee_id
            == employee_id,

            SkillEvidence.skill_id
            == skill_id,

        )

        .order_by(
            SkillEvidence.recorded_at.asc()
        )

    ).all()

    result = calculate_confidence(
        evidence
    )

    state = db.scalar(

        select(
            EmployeeSkill
        )

        .where(

            EmployeeSkill.employee_id
            == employee_id,

            EmployeeSkill.skill_id
            == skill_id,

        )

    )

    if state is None:

        state = EmployeeSkill(

            employee_id=employee_id,
            skill_id=skill_id,

        )

        db.add(
            state
        )

    state.current_proficiency = (
        result[
            "current_proficiency"
        ]
    )

    state.confidence_score = (
        result[
            "final_confidence"
        ]
    )

    state.evidence_count = (
        result[
            "evidence_count"
        ]
    )

    state.last_evidence_at = (
        result[
            "last_evidence_at"
        ]
    )

    db.flush()

    return state


# ---------------------------------------------------------------------------
# RECALCULATE ALL EMPLOYEE SKILLS
# ---------------------------------------------------------------------------

def recalculate_employee_skills(
    db: Session,
    employee_id: int,
) -> None:

    employee = get_employee(
        db,
        employee_id,
    )

    if employee is None:

        raise ValueError(
            "Employee not found."
        )

    # Skills for which the employee
    # already has learning evidence.

    skill_ids = set(

        db.scalars(

            select(
                SkillEvidence.skill_id
            )

            .where(
                SkillEvidence.employee_id
                == employee_id
            )

        ).all()

    )

    # Also include all skills required
    # by current or target role.

    role_ids = [

        role_id

        for role_id in (

            employee.current_role_id,
            employee.target_role_id,

        )

        if role_id is not None

    ]

    if role_ids:

        required_skill_ids = db.scalars(

            select(
                RoleSkillRequirement.skill_id
            )

            .where(

                RoleSkillRequirement.role_id.in_(
                    role_ids
                ),

                RoleSkillRequirement.active.is_(
                    True
                ),

            )

        ).all()

        skill_ids.update(
            required_skill_ids
        )

    for skill_id in skill_ids:

        recalculate_skill(

            db,
            employee_id,
            skill_id,

        )

    db.commit()


# ---------------------------------------------------------------------------
# FULL COMPETENCY SNAPSHOT
# ---------------------------------------------------------------------------

def get_competency_snapshot(
    db: Session,
    employee_id: int,
) -> dict:
    """
    Returns everything needed by:

    - Employee dashboard
    - Skill-gap screen
    - Skill graph
    - Admin dashboard
    - Recommendation engine later
    """

    employee = get_employee(
        db,
        employee_id,
    )

    if employee is None:

        raise ValueError(
            "Employee not found."
        )

    # Career-gap analysis is evaluated against
    # the target role whenever one exists.

    evaluated_role = (
        employee.target_role
        or employee.current_role
    )

    if evaluated_role is None:

        return {

            "employee_id":
                employee.id,

            "employee_name":
                employee.name,

            "employee_code":
                employee.employee_code,

            "current_role":
                employee.current_role,

            "target_role":
                employee.target_role,

            "evaluated_against_role":
                None,

            "readiness_pct":
                0.0,

            "total_required_skills":
                0,

            "requirements_met":
                0,

            "high_priority_gaps":
                0,

            "skills":
                [],

        }

    requirements = db.scalars(

        select(
            RoleSkillRequirement
        )

        .options(
            joinedload(
                RoleSkillRequirement.skill
            )
        )

        .where(

            RoleSkillRequirement.role_id
            == evaluated_role.id,

            RoleSkillRequirement.active.is_(
                True
            ),

        )

        .order_by(

            RoleSkillRequirement
            .criticality.desc(),

            RoleSkillRequirement
            .id.asc(),

        )

    ).unique().all()

    states = {

        state.skill_id: state

        for state in db.scalars(

            select(
                EmployeeSkill
            )

            .where(
                EmployeeSkill.employee_id
                == employee_id
            )

        ).all()

    }

    skills_payload = []

    weighted_readiness_sum = 0.0
    readiness_weight_total = 0.0

    requirements_met = 0
    high_priority_gaps = 0

    for requirement in requirements:

        skill = requirement.skill

        state = states.get(
            skill.id
        )

        if state:

            current = (
                state.current_proficiency
            )

            confidence = (
                state.confidence_score
            )

            evidence_count = (
                state.evidence_count
            )

            last_evidence = (
                state.last_evidence_at
            )

        else:

            current = 0
            confidence = 0.0
            evidence_count = 0
            last_evidence = None

        evidence = db.scalars(

            select(
                SkillEvidence
            )

            .where(

                SkillEvidence.employee_id
                == employee_id,

                SkillEvidence.skill_id
                == skill.id,

            )

        ).all()

        confidence_details = (
            calculate_confidence(
                evidence
            )
        )

        # ---------------------------------------------------------------
        # GAP
        # ---------------------------------------------------------------

        gap = max(

            0,

            int(
                requirement
                .required_proficiency
            )
            - int(current),

        )

        # ---------------------------------------------------------------
        # PRIORITY
        # ---------------------------------------------------------------

        age_penalty = (
            recency_penalty(
                last_evidence
            )
        )

        block_value = (

            5.0

            if requirement
            .blocks_progression

            else 0.0

        )

        priority_score = (

            W_GAP * float(gap)

            + W_CRITICALITY
            * float(
                requirement.criticality
            )

            + W_RECENCY
            * age_penalty

            + W_BLOCKS_TARGET
            * block_value

        )

        priority_score = round(

            min(
                5.0,
                max(
                    0.0,
                    priority_score,
                ),
            ),

            2,

        )

        p_label = priority_label(

            priority_score,
            gap,

        )

        # ---------------------------------------------------------------
        # SUMMARY COUNTERS
        # ---------------------------------------------------------------

        if gap == 0:

            requirements_met += 1

        if (
            gap > 0
            and p_label
            in {
                "High",
                "Critical",
            }
        ):

            high_priority_gaps += 1

        # ---------------------------------------------------------------
        # READINESS
        # ---------------------------------------------------------------

        required_level = max(

            1,

            requirement
            .required_proficiency,

        )

        skill_readiness = min(

            float(current)
            / float(required_level),

            1.0,

        )

        weight = max(

            1.0,

            float(
                requirement.criticality
            ),

        )

        weighted_readiness_sum += (

            skill_readiness
            * weight

        )

        readiness_weight_total += (
            weight
        )

        # ---------------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------------

        skills_payload.append({

            "skill_id":
                skill.id,

            "skill_code":
                skill.code,

            "skill_name":
                skill.name,

            "domain":
                skill.domain,

            "current_proficiency":
                current,

            "required_proficiency":
                requirement
                .required_proficiency,

            "confidence_score":
                round(
                    confidence,
                    2,
                ),

            "evidence_count":
                evidence_count,

            "gap_size":
                gap,

            "gap_label":
                gap_label(gap),

            "priority_score":
                priority_score,

            "priority_label":
                p_label,

            "criticality":
                requirement.criticality,

            "blocks_progression":
                requirement
                .blocks_progression,

            "last_evidence_at":
                last_evidence,

            "confidence_breakdown": {

                key: value

                for key, value
                in confidence_details.items()

                if key not in {
                    "last_evidence_at",
                    "current_proficiency",
                }

            },

            "reason":
                build_reason(

                    skill.name,
                    current,

                    requirement
                    .required_proficiency,

                    p_label,

                    requirement
                    .blocks_progression,

                ),

        })

    # Highest gaps appear first.

    skills_payload.sort(

        key=lambda item: (

            item[
                "gap_size"
            ] <= 0,

            -item[
                "priority_score"
            ],

            item[
                "skill_name"
            ],

        )

    )

    if readiness_weight_total:

        readiness = (

            100.0
            * weighted_readiness_sum
            / readiness_weight_total

        )

    else:

        readiness = 0.0

    return {

        "employee_id":
            employee.id,

        "employee_name":
            employee.name,

        "employee_code":
            employee.employee_code,

        "current_role":
            employee.current_role,

        "target_role":
            employee.target_role,

        "evaluated_against_role":
            evaluated_role,

        "readiness_pct":
            round(
                readiness,
                2,
            ),

        "total_required_skills":
            len(
                requirements
            ),

        "requirements_met":
            requirements_met,

        "high_priority_gaps":
            high_priority_gaps,

        "skills":
            skills_payload,

    }