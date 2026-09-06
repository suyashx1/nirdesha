"""Seed data for Nirdesha Phase 3.

IMPORTANT:

These records are deliberately labelled PROTOTYPE data.

They represent the type of resources that could be synchronized from
iGOT Karmayogi and NSSTA.

Do NOT claim that this is a live authenticated official catalogue.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Skill

from .phase3_models import (
    LearningCourse,
    CourseSkillMap,
    CoursePrerequisite,
)


COURSES = [

    {
        "course_code":
            "IGOT-PY-101",

        "title":
            "Python Foundations for Government Data Workflows",

        "source_type":
            "igot",

        "source_label":
            "Prototype iGOT Catalogue",

        "description":
            "Introductory Python syntax, data structures, reusable functions and safe analytical workflow habits for public-sector data work.",

        "difficulty":
            "Beginner",

        "duration_hours":
            5.0,

        "language":
            "English",

        "delivery_mode":
            "Self-paced",

        "learning_outcomes": [

            "Use core Python data structures and functions",

            "Build small repeatable data-processing scripts",

            "Apply basic validation before analytical output",

        ],

        "tags": [
            "python",
            "foundation",
            "digital skills",
        ],

        "skills": [

            (
                "PYTHON",
                1.0,
                True,
                0,
                2,
            )

        ],
    },

    {
        "course_code":
            "NSSTA-PY-270",

        "title":
            "Python for Official Statistics & Data Quality",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "Applied Python, Pandas, reproducible statistical workflows, validation checks and analytical data preparation for official statistics.",

        "difficulty":
            "Intermediate",

        "duration_hours":
            8.0,

        "language":
            "English",

        "delivery_mode":
            "Blended",

        "learning_outcomes": [

            "Use Pandas for tabular statistical data",

            "Build validation and cleaning workflows",

            "Produce reproducible analytical outputs",

        ],

        "tags": [
            "python",
            "pandas",
            "official statistics",
        ],

        "skills": [

            (
                "PYTHON",
                1.0,
                True,
                2,
                4,
            ),

            (
                "DATA_VIS",
                0.35,
                False,
                1,
                3,
            ),

        ],

        "prerequisites": [
            "IGOT-PY-101"
        ],
    },

    {
        "course_code":
            "IGOT-SQL-110",

        "title":
            "SQL for Public Data Workflows",

        "source_type":
            "igot",

        "source_label":
            "Prototype iGOT Catalogue",

        "description":
            "Relational data concepts, SELECT queries, joins, grouping and safe extraction patterns for administrative and statistical datasets.",

        "difficulty":
            "Beginner",

        "duration_hours":
            4.0,

        "language":
            "English",

        "delivery_mode":
            "Self-paced",

        "learning_outcomes": [

            "Write reliable SELECT and filtering queries",

            "Use joins and aggregation for analysis",

            "Understand basic relational data quality checks",

        ],

        "tags": [
            "sql",
            "database",
            "data extraction",
        ],

        "skills": [

            (
                "SQL",
                1.0,
                True,
                0,
                3,
            )

        ],
    },

    {
        "course_code":
            "NSSTA-SAMP-201",

        "title":
            "Survey Sampling Foundations",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "Foundations of probability sampling, stratification, allocation, sampling error and survey estimation for official statistical work.",

        "difficulty":
            "Beginner",

        "duration_hours":
            6.0,

        "language":
            "English",

        "delivery_mode":
            "Blended",

        "learning_outcomes": [

            "Explain core probability sampling designs",

            "Interpret sampling weights and sampling error",

            "Choose suitable basic designs for survey objectives",

        ],

        "tags": [
            "sampling",
            "survey design",
            "statistics",
        ],

        "skills": [

            (
                "SURVEY_SAMPLING",
                1.0,
                True,
                0,
                2,
            )

        ],
    },

    {
        "course_code":
            "NSSTA-SAMP-301",

        "title":
            "Advanced Multi-Stage Sampling & Survey Design",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "Advanced stratification, cluster and multi-stage designs, unequal probability selection, variance estimation and design-quality review.",

        "difficulty":
            "Advanced",

        "duration_hours":
            10.0,

        "language":
            "English",

        "delivery_mode":
            "Instructor-led / Blended",

        "learning_outcomes": [

            "Design multi-stage probability samples",

            "Evaluate design effects and variance implications",

            "Review complex survey designs for operational quality",

        ],

        "tags": [
            "sampling",
            "multi-stage",
            "variance",
        ],

        "skills": [

            (
                "SURVEY_SAMPLING",
                1.0,
                True,
                2,
                5,
            )

        ],

        "prerequisites": [
            "NSSTA-SAMP-201"
        ],
    },

    {
        "course_code":
            "NSSTA-MACRO-220",

        "title":
            "National Accounts & Deflator Fundamentals",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "Core price-index and deflator concepts used in national accounts, including interpretation, consistency checks and analytical use.",

        "difficulty":
            "Intermediate",

        "duration_hours":
            7.0,

        "language":
            "English",

        "delivery_mode":
            "Blended",

        "learning_outcomes": [

            "Interpret GDP and related deflators",

            "Relate price indices to current and constant price measures",

            "Perform conceptual consistency checks on deflator use",

        ],

        "tags": [
            "national accounts",
            "deflators",
            "price statistics",
        ],

        "skills": [

            (
                "MACRO_DEFLATORS",
                1.0,
                True,
                1,
                4,
            )

        ],
    },

    {
        "course_code":
            "NSSTA-CAPI-230",

        "title":
            "CAPI Quality Assurance & Field Verification",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "CAPI validation rules, field verification, sync-quality checks, supervisor review and practical data-quality escalation.",

        "difficulty":
            "Intermediate",

        "duration_hours":
            5.0,

        "language":
            "English",

        "delivery_mode":
            "Blended",

        "learning_outcomes": [

            "Review CAPI validation and field-quality controls",

            "Identify common verification failures",

            "Escalate and document field-data quality issues",

        ],

        "tags": [
            "capi",
            "field operations",
            "quality assurance",
        ],

        "skills": [

            (
                "CAPI_VERIFICATION",
                1.0,
                True,
                1,
                4,
            )

        ],
    },

    {
        "course_code":
            "NSSTA-GIS-240",

        "title":
            "GIS for Official Statistics",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "Foundational geospatial concepts, statistical mapping, layer handling and spatial presentation for official-statistics use cases.",

        "difficulty":
            "Intermediate",

        "duration_hours":
            6.0,

        "language":
            "English",

        "delivery_mode":
            "Hands-on",

        "learning_outcomes": [

            "Work with common GIS layers and attributes",

            "Create basic statistical maps",

            "Apply geospatial quality checks to analytical outputs",

        ],

        "tags": [
            "gis",
            "mapping",
            "geospatial",
        ],

        "skills": [

            (
                "GIS",
                1.0,
                True,
                0,
                3,
            )

        ],
    },

    {
        "course_code":
            "NSSTA-VIS-250",

        "title":
            "Statistical Data Visualization & Communication",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "Chart selection, truthful visual encoding, dashboard readability and communication of uncertainty in official statistical products.",

        "difficulty":
            "Intermediate",

        "duration_hours":
            4.5,

        "language":
            "English",

        "delivery_mode":
            "Self-paced / Workshop",

        "learning_outcomes": [

            "Choose charts appropriate to statistical questions",

            "Avoid misleading visual encodings",

            "Communicate statistical findings clearly",

        ],

        "tags": [
            "visualization",
            "communication",
            "charts",
        ],

        "skills": [

            (
                "DATA_VIS",
                1.0,
                True,
                1,
                3,
            )

        ],
    },

    {
        "course_code":
            "IGOT-DPDP-120",

        "title":
            "Data Privacy & Secure Handling for Government Data",

        "source_type":
            "igot",

        "source_label":
            "Prototype iGOT Catalogue",

        "description":
            "Practical privacy, purpose limitation, access control, secure handling and responsible use of sensitive government data.",

        "difficulty":
            "Beginner",

        "duration_hours":
            3.5,

        "language":
            "English",

        "delivery_mode":
            "Self-paced",

        "learning_outcomes": [

            "Recognize common data-privacy risks",

            "Apply secure handling and access principles",

            "Understand responsible data-processing practices",

        ],

        "tags": [
            "privacy",
            "dpdp",
            "cybersecurity",
        ],

        "skills": [

            (
                "DPDP",
                1.0,
                True,
                0,
                3,
            )

        ],
    },

    {
        "course_code":
            "NSSTA-NSS-260",

        "title":
            "Sampling Frame Design & Coverage Quality",

        "source_type":
            "nssta",

        "source_label":
            "Prototype NSSTA Programme",

        "description":
            "Frame construction, coverage errors, updating processes and operational quality checks for survey sampling frames.",

        "difficulty":
            "Intermediate",

        "duration_hours":
            6.0,

        "language":
            "English",

        "delivery_mode":
            "Blended",

        "learning_outcomes": [

            "Assess frame completeness and coverage risk",

            "Document frame-update procedures",

            "Connect frame quality with survey-estimation quality",

        ],

        "tags": [
            "sampling frame",
            "coverage",
            "survey quality",
        ],

        "skills": [

            (
                "NSS_FRAME",
                1.0,
                True,
                1,
                4,
            ),

            (
                "SURVEY_SAMPLING",
                0.35,
                False,
                1,
                4,
            ),

        ],
    },

    {
        "course_code":
            "IGOT-LEAD-140",

        "title":
            "Leadership, Communication & Change Management",

        "source_type":
            "igot",

        "source_label":
            "Prototype iGOT Catalogue",

        "description":
            "Communication, team coordination, decision framing, change management and leadership behaviours for government work environments.",

        "difficulty":
            "Intermediate",

        "duration_hours":
            4.0,

        "language":
            "English",

        "delivery_mode":
            "Self-paced",

        "learning_outcomes": [

            "Structure clear professional communication",

            "Coordinate teams through operational change",

            "Use practical decision and stakeholder-management techniques",

        ],

        "tags": [
            "leadership",
            "communication",
            "management",
        ],

        "skills": [

            (
                "LEADERSHIP",
                1.0,
                True,
                1,
                3,
            )

        ],
    },

]


def seed_phase3_database(
    db: Session,
) -> None:
    """
    Create/update prototype learning catalogue.

    This function is idempotent:
    restarting the backend does not duplicate courses.
    """

    skill_by_code = {

        skill.code:
            skill

        for skill
        in db.scalars(

            select(Skill)

            .where(
                Skill.active.is_(True)
            )

        ).all()

    }


    course_by_code: dict[
        str,
        LearningCourse,
    ] = {}


    for payload in COURSES:

        course = db.scalar(

            select(
                LearningCourse
            )

            .where(

                LearningCourse.course_code
                == payload["course_code"]

            )

        )


        if course is None:

            course = LearningCourse(

                course_code=
                    payload[
                        "course_code"
                    ],

                title=
                    payload[
                        "title"
                    ],

                source_type=
                    payload[
                        "source_type"
                    ],

                source_label=
                    payload[
                        "source_label"
                    ],

                description=
                    payload[
                        "description"
                    ],

                difficulty=
                    payload[
                        "difficulty"
                    ],

                duration_hours=
                    float(
                        payload[
                            "duration_hours"
                        ]
                    ),

            )

            db.add(
                course
            )


        course.title = (
            payload["title"]
        )

        course.source_type = (
            payload["source_type"]
        )

        course.source_label = (
            payload["source_label"]
        )

        course.catalog_status = (
            "prototype_catalogue"
        )

        course.description = (
            payload["description"]
        )

        course.difficulty = (
            payload["difficulty"]
        )

        course.duration_hours = float(
            payload["duration_hours"]
        )

        course.language = (
            payload["language"]
        )

        course.delivery_mode = (
            payload["delivery_mode"]
        )

        course.learning_outcomes = list(
            payload["learning_outcomes"]
        )

        course.tags = list(
            payload["tags"]
        )

        course.active = True


        # Required so new course obtains an ID
        # before CourseSkillMap references it.

        db.flush()


        course_by_code[
            course.course_code
        ] = course


        for (

            skill_code,
            relevance_weight,
            is_primary,
            target_min,
            target_max,

        ) in payload["skills"]:

            skill = skill_by_code.get(
                skill_code
            )


            if skill is None:
                continue


            mapping = db.scalar(

                select(
                    CourseSkillMap
                )

                .where(

                    CourseSkillMap.course_id
                    == course.id,

                    CourseSkillMap.skill_id
                    == skill.id,

                )

            )


            if mapping is None:

                mapping = CourseSkillMap(

                    course_id=
                        course.id,

                    skill_id=
                        skill.id,

                )

                db.add(
                    mapping
                )


            mapping.relevance_weight = float(
                relevance_weight
            )

            mapping.is_primary = bool(
                is_primary
            )

            mapping.target_proficiency_min = int(
                target_min
            )

            mapping.target_proficiency_max = int(
                target_max
            )


    db.flush()


    # -------------------------------------------------------------
    # PREREQUISITES
    # -------------------------------------------------------------

    for payload in COURSES:

        course = course_by_code[
            payload["course_code"]
        ]


        for prerequisite_code in (
            payload.get(
                "prerequisites",
                [],
            )
        ):

            prerequisite = (
                course_by_code.get(
                    prerequisite_code
                )
            )


            if prerequisite is None:
                continue


            edge = db.scalar(

                select(
                    CoursePrerequisite
                )

                .where(

                    CoursePrerequisite.course_id
                    == course.id,

                    CoursePrerequisite.prerequisite_course_id
                    == prerequisite.id,

                )

            )


            if edge is None:

                db.add(

                    CoursePrerequisite(

                        course_id=
                            course.id,

                        prerequisite_course_id=
                            prerequisite.id,

                    )

                )


    db.commit()