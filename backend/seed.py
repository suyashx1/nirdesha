"""
Nirdesha SIH Demo Seed
======================

Creates:

- Department
- JSO role
- SSO target role
- Skills
- Prototype role-skill requirements
- S. K. Raman demo employee
- Baseline skill evidence

IMPORTANT:

These role-to-skill mappings are prototype mappings for the SIH demonstration.
"""

from __future__ import annotations

from datetime import (
    datetime,
    timedelta,
    timezone,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import (
    Department,
    EmployeeProfile,
    Role,
    RoleSkillRequirement,
    Skill,
    SkillEvidence,
)

from .services.competency_engine import (
    recalculate_employee_skills,
)


# ---------------------------------------------------------------------------
# DEMO SKILLS
# ---------------------------------------------------------------------------

SKILLS = [

    (
        "SURVEY_SAMPLING",
        "Survey Sampling",
        "Statistical",
        "Sampling design, estimation and survey methodology.",
    ),

    (
        "CAPI_VERIFICATION",
        "CAPI Verification",
        "Statistical",
        "Digital survey schedule verification and field-data quality checks.",
    ),

    (
        "MACRO_DEFLATORS",
        "Macroeconomic Deflators",
        "Statistical",
        "Price indices, GDP deflators and national-accounting price concepts.",
    ),

    (
        "PYTHON",
        "Python Computing",
        "Technical",
        "Python for official-statistics analysis and automation.",
    ),

    (
        "SQL",
        "SQL",
        "Technical",
        "Relational querying and data extraction.",
    ),

    (
        "GIS",
        "GIS",
        "Technical",
        "Geospatial analysis and statistical mapping.",
    ),

    (
        "DATA_VIS",
        "Data Visualization",
        "Technical",
        "Analytical charts and statistical communication.",
    ),

    (
        "DPDP",
        "Data Privacy & DPDP",
        "Digital Governance",
        "Privacy, secure handling and responsible data processing.",
    ),

    (
        "NSS_FRAME",
        "NSS Frame Design",
        "Statistical",
        "Frame construction and field survey design concepts.",
    ),

    (
        "LEADERSHIP",
        "Leadership & Communication",
        "Behavioural/Managerial",
        "Team coordination, communication and decision support.",
    ),

]


# ---------------------------------------------------------------------------
# PROTOTYPE ROLE REQUIREMENTS
#
# Format:
#
# skill:
# (
#   required proficiency,
#   criticality,
#   blocks progression
# )
# ---------------------------------------------------------------------------

ROLE_REQUIREMENTS = {

    "JSO": {

        "SURVEY_SAMPLING":
            (3, 5, True),

        "CAPI_VERIFICATION":
            (3, 4, False),

        "MACRO_DEFLATORS":
            (2, 3, False),

        "PYTHON":
            (2, 3, False),

        "SQL":
            (2, 2, False),

        "GIS":
            (1, 2, False),

        "DATA_VIS":
            (2, 2, False),

        "DPDP":
            (2, 4, True),

        "NSS_FRAME":
            (3, 4, False),

        "LEADERSHIP":
            (2, 2, False),

    },

    "SSO": {

        "SURVEY_SAMPLING":
            (4, 5, True),

        "CAPI_VERIFICATION":
            (4, 4, False),

        "MACRO_DEFLATORS":
            (4, 5, True),

        "PYTHON":
            (4, 4, True),

        "SQL":
            (3, 3, False),

        "GIS":
            (3, 3, False),

        "DATA_VIS":
            (3, 3, False),

        "DPDP":
            (3, 4, True),

        "NSS_FRAME":
            (4, 4, False),

        "LEADERSHIP":
            (3, 4, False),

    },

}


# ---------------------------------------------------------------------------
# INITIAL DEMO EVIDENCE
#
# Values:
#
# Formal
# Quiz
# Course
# Self Assessment
# ---------------------------------------------------------------------------

DEMO_EVIDENCE = {

    "SURVEY_SAMPLING":
        (86, 84, 100, 85),

    "CAPI_VERIFICATION":
        (82, 84, 100, 85),

    "MACRO_DEFLATORS":
        (45, 50, 40, 55),

    "PYTHON":
        (65, 62, 70, 65),

    "SQL":
        (55, 60, 60, 60),

    "GIS":
        (40, 45, 30, 45),

    "DATA_VIS":
        (68, 72, 80, 70),

    "DPDP":
        (72, 70, 80, 70),

    "NSS_FRAME":
        (78, 76, 100, 80),

    "LEADERSHIP":
        (60, 65, 80, 70),

}


# ---------------------------------------------------------------------------
# GET OR CREATE HELPER
# ---------------------------------------------------------------------------

def get_or_create(
    db: Session,
    model,
    defaults: dict | None = None,
    **lookup,
):

    instance = db.scalar(

        select(model)
        .filter_by(
            **lookup
        )

    )

    if instance is not None:

        return instance

    values = dict(
        lookup
    )

    if defaults:

        values.update(
            defaults
        )

    instance = model(
        **values
    )

    db.add(
        instance
    )

    db.flush()

    return instance


# ---------------------------------------------------------------------------
# MAIN SEED FUNCTION
# ---------------------------------------------------------------------------

def seed_database(
    db: Session,
) -> None:

    # -----------------------------------------------------------------------
    # DEPARTMENT
    # -----------------------------------------------------------------------

    department = get_or_create(

        db,
        Department,

        code="NSO-FOD",

        defaults={

            "name":
                "NSO / Field Operations Division",

        },

    )

    # -----------------------------------------------------------------------
    # ROLES
    # -----------------------------------------------------------------------

    jso = get_or_create(

        db,
        Role,

        code="JSO",

        defaults={

            "name":
                "Junior Statistical Officer (JSO)",

            "description":
                "Prototype current-role mapping for Nirdesha SIH demo.",

            "level":
                2,

        },

    )

    sso = get_or_create(

        db,
        Role,

        code="SSO",

        defaults={

            "name":
                "Senior Statistical Officer (SSO)",

            "description":
                "Prototype target-role mapping for Nirdesha SIH demo.",

            "level":
                3,

        },

    )

    # -----------------------------------------------------------------------
    # SKILLS
    # -----------------------------------------------------------------------

    skill_by_code: dict[
        str,
        Skill,
    ] = {}

    for (
        code,
        name,
        domain,
        description,
    ) in SKILLS:

        skill_by_code[
            code
        ] = get_or_create(

            db,
            Skill,

            code=code,

            defaults={

                "name":
                    name,

                "domain":
                    domain,

                "description":
                    description,

                "active":
                    True,

            },

        )

    # -----------------------------------------------------------------------
    # ROLE REQUIREMENTS
    # -----------------------------------------------------------------------

    role_by_code = {

        "JSO":
            jso,

        "SSO":
            sso,

    }

    for (
        role_code,
        requirements,
    ) in ROLE_REQUIREMENTS.items():

        role = role_by_code[
            role_code
        ]

        for (
            skill_code,
            requirement_values,
        ) in requirements.items():

            (
                required,
                criticality,
                blocks,
            ) = requirement_values

            skill = skill_by_code[
                skill_code
            ]

            requirement = db.scalar(

                select(
                    RoleSkillRequirement
                )

                .where(

                    RoleSkillRequirement
                    .role_id
                    == role.id,

                    RoleSkillRequirement
                    .skill_id
                    == skill.id,

                )

            )

            if requirement is None:

                requirement = (
                    RoleSkillRequirement(

                        role_id=
                            role.id,

                        skill_id=
                            skill.id,

                    )
                )

                db.add(
                    requirement
                )

            requirement.required_proficiency = (
                required
            )

            requirement.criticality = (
                criticality
            )

            requirement.blocks_progression = (
                blocks
            )

            requirement.active = True

    # -----------------------------------------------------------------------
    # DEMO EMPLOYEE
    # -----------------------------------------------------------------------

    employee = db.scalar(

        select(
            EmployeeProfile
        )

        .where(

            EmployeeProfile
            .employee_code
            == "SSS-2024-8891"

        )

    )

    if employee is None:

        employee = EmployeeProfile(

            employee_code=
                "SSS-2024-8891",

            name=
                "S. K. Raman",

            email=
                "raman.sk@mospi.gov.in",

            department_id=
                department.id,

            current_role_id=
                jso.id,

            target_role_id=
                sso.id,

            designation=
                "Junior Statistical Officer (JSO)",

            division=
                "Field Operations Division (NSSO / FOD)",

            cadre=
                "Subordinate Statistical Service (SSS)",

            ministry=
                "MoSPI, Government of India",

            station=
                "FOD Regional Office, Pune / New Delhi",

            tenure=
                "2024 Batch (2 Years Completed)",

            status=
                "Prototype officer profile for Nirdesha SIH demonstration.",

            education=
                "Statistics / Quantitative Methods",

            experience_years=
                2.0,

            preferred_language=
                "English",

        )

        db.add(
            employee
        )

        db.flush()

    # -----------------------------------------------------------------------
    # INITIAL EVIDENCE
    # -----------------------------------------------------------------------

    already_seeded = db.scalar(

        select(
            SkillEvidence.id
        )

        .where(

            SkillEvidence.employee_id
            == employee.id,

            SkillEvidence.source
            == "seed_demo",

        )

        .limit(1)

    )

    if already_seeded is None:

        now = datetime.now(
            timezone.utc
        )

        for (
            skill_code,
            scores,
        ) in DEMO_EVIDENCE.items():

            (
                formal,
                quiz,
                course,
                self_score,
            ) = scores

            skill = skill_by_code[
                skill_code
            ]

            entries = [

                (
                    "formal_assessment",
                    formal,
                    "baseline-formal",
                    12,
                ),

                (
                    "quiz",
                    quiz,
                    "baseline-quiz",
                    5,
                ),

                (
                    "course_completion",
                    course,
                    "baseline-course",
                    20,
                ),

                (
                    "self_assessment",
                    self_score,
                    "baseline-self",
                    25,
                ),

            ]

            for (
                evidence_type,
                score,
                reference,
                age_days,
            ) in entries:

                db.add(

                    SkillEvidence(

                        employee_id=
                            employee.id,

                        skill_id=
                            skill.id,

                        evidence_type=
                            evidence_type,

                        score=
                            float(score),

                        source=
                            "seed_demo",

                        source_ref=(
                            f"{skill_code.lower()}-"
                            f"{reference}"
                        ),

                        notes=(
                            "Seeded prototype evidence; "
                            "replace with real learner "
                            "evidence during the demo."
                        ),

                        recorded_at=(
                            now
                            - timedelta(
                                days=age_days
                            )
                        ),

                    )

                )

    db.commit()

    # Build EmployeeSkill states
    # automatically after seeding.

    recalculate_employee_skills(

        db,
        employee.id,

    )