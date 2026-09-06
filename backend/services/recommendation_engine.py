"""Explainable deterministic learning recommendation engine.

AI does not silently decide training priority.

Recommendations are calculated from:

- Live competency gaps
- Role criticality
- Gap priority
- Current proficiency
- Course-level suitability
- Prerequisite completion
- Curated prototype source

The scoring formula is deterministic and auditable.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import (
    EmployeeProfile,
    Skill,
)

from ..phase3_models import (
    LearningCourse,
    CourseSkillMap,
)

from .competency_engine import (
    get_competency_snapshot,
)

from .course_service import (
    course_to_dict,
    get_completed_course_codes,
)


# ================================================================
# RECOMMENDATION WEIGHTS
#
# Total maximum = 100
# ================================================================

W_GAP = 35.0

W_CRITICALITY = 20.0

W_PRIORITY = 15.0

W_LEVEL_FIT = 15.0

W_PREREQUISITES = 10.0

W_SOURCE = 5.0


def _level_fit(
    current: int,
    target_min: int,
    target_max: int,
) -> tuple[float, str]:

    if (
        target_min
        <= current
        <= target_max
    ):

        return (

            1.0,

            "Course difficulty matches the officer's current proficiency band.",

        )


    distance = min(

        abs(
            current
            - target_min
        ),

        abs(
            current
            - target_max
        ),

    )


    if distance == 1:

        return (

            0.55,

            "Course level is one proficiency step away from the current level.",

        )


    return (

        0.15,

        "Course level is not an ideal immediate fit; use only after prerequisite learning.",

    )


def _course_driver(
    mapping_rows: list,
    skill_by_id: dict[int, dict],
) -> tuple | None:
    """
    Choose the competency skill that most strongly
    drives this recommendation.
    """

    candidates = []


    for (
        mapping,
        _skill,
    ) in mapping_rows:

        item = skill_by_id.get(
            mapping.skill_id
        )


        if not item:
            continue


        # Skip skills already confidently meeting
        # their requirement.

        if (
            item["gap_size"] <= 0
            and item[
                "confidence_score"
            ] >= 75
        ):

            continue


        driver_strength = (

            float(
                item["gap_size"]
            )
            * 3.0

            + float(
                item[
                    "priority_score"
                ]
            )

            + float(
                mapping
                .relevance_weight
            )

        )


        candidates.append(

            (
                driver_strength,
                mapping,
                item,
            )

        )


    if not candidates:

        return None


    candidates.sort(

        key=lambda row:
            row[0],

        reverse=True,

    )


    _strength, mapping, item = (
        candidates[0]
    )


    return (
        mapping,
        item,
    )


def get_recommendations(
    db: Session,
    employee_id: int,
    limit: int = 12,
) -> dict:

    employee = db.get(

        EmployeeProfile,
        employee_id,

    )


    if employee is None:

        raise ValueError(
            "Employee not found."
        )


    snapshot = (
        get_competency_snapshot(

            db,
            employee_id,

        )
    )


    skill_by_id = {

        item["skill_id"]:
            item

        for item
        in snapshot["skills"]

    }


    completed_codes = (
        get_completed_course_codes(

            db,
            employee_id,

        )
    )


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
            LearningCourse.id
        )

    ).all()


    recommendations: list[
        dict
    ] = []


    for course in courses:

        mapping_rows = db.execute(

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
                == course.id

            )

            .order_by(

                CourseSkillMap
                .is_primary
                .desc(),

                CourseSkillMap
                .relevance_weight
                .desc(),

            )

        ).all()


        driver = _course_driver(

            mapping_rows,
            skill_by_id,

        )


        if driver is None:

            continue


        mapping, skill_item = (
            driver
        )


        course_payload = (
            course_to_dict(
                db,
                course,
            )
        )


        missing_prerequisites = [

            code

            for code
            in course_payload[
                "prerequisites"
            ]

            if code
            not in completed_codes

        ]


        locked = bool(
            missing_prerequisites
        )


        # ---------------------------------------------------------
        # GAP COMPONENT
        # ---------------------------------------------------------

        gap_component = (

            W_GAP

            * min(

                max(

                    float(
                        skill_item[
                            "gap_size"
                        ]
                    )
                    / 5.0,

                    0.0,

                ),

                1.0,

            )

        )


        # ---------------------------------------------------------
        # ROLE CRITICALITY
        # ---------------------------------------------------------

        criticality_component = (

            W_CRITICALITY

            * min(

                max(

                    float(
                        skill_item[
                            "criticality"
                        ]
                    )
                    / 5.0,

                    0.0,

                ),

                1.0,

            )

        )


        # ---------------------------------------------------------
        # PRIORITY
        # ---------------------------------------------------------

        priority_component = (

            W_PRIORITY

            * min(

                max(

                    float(
                        skill_item[
                            "priority_score"
                        ]
                    )
                    / 5.0,

                    0.0,

                ),

                1.0,

            )

        )


        # ---------------------------------------------------------
        # LEVEL FIT
        # ---------------------------------------------------------

        (
            fit_factor,
            fit_reason,
        ) = _level_fit(

            int(
                skill_item[
                    "current_proficiency"
                ]
            ),

            int(
                mapping
                .target_proficiency_min
            ),

            int(
                mapping
                .target_proficiency_max
            ),

        )


        level_fit_component = (

            W_LEVEL_FIT
            * fit_factor

        )


        prerequisite_component = (

            W_PREREQUISITES

            if not locked

            else 0.0

        )


        # Both source groups are trusted
        # prototype catalogue datasets.
        #
        # Neither gets authority over skill-gap logic.

        source_component = (
            W_SOURCE
        )


        score = round(

            min(

                100.0,

                gap_component

                + criticality_component

                + priority_component

                + level_fit_component

                + prerequisite_component

                + source_component,

            ),

            2,

        )


        # ---------------------------------------------------------
        # EXPLANATIONS
        # ---------------------------------------------------------

        reasons = [

            (
                f"{skill_item['skill_name']} is "
                f"{skill_item['current_proficiency']}/5 "
                f"while the evaluated role requires "
                f"{skill_item['required_proficiency']}/5."
            ),

            (
                f"Competency confidence is "
                f"{skill_item['confidence_score']:.2f}%."
            ),

            (
                f"Role criticality for this skill is "
                f"{skill_item['criticality']}/5."
            ),

            fit_reason,

        ]


        if locked:

            reasons.append(

                "Complete prerequisite course(s) first: "

                + ", ".join(
                    missing_prerequisites
                )

                + "."

            )

        else:

            reasons.append(

                "All prototype course prerequisites are currently satisfied."

            )


        reasons.append(

            f"Source: {course.source_label}; "
            "catalogue is prototype/demo data."

        )


        if (
            skill_item[
                "gap_size"
            ] > 0
        ):

            summary = (

                f"Recommended to close the "
                f"{skill_item['gap_size']}-level "
                f"{skill_item['skill_name']} gap "
                "for the target role."

            )

        else:

            summary = (

                f"Recommended as reinforcement because "
                f"{skill_item['skill_name']} has limited "
                "confidence evidence despite meeting "
                "the current requirement."

            )


        recommendations.append({

            "rank":
                0,

            "score":
                score,

            "locked":
                locked,

            "course":
                course_payload,

            "driver_skill_code":
                skill_item[
                    "skill_code"
                ],

            "driver_skill_name":
                skill_item[
                    "skill_name"
                ],

            "current_proficiency":
                skill_item[
                    "current_proficiency"
                ],

            "required_proficiency":
                skill_item[
                    "required_proficiency"
                ],

            "confidence_score":
                skill_item[
                    "confidence_score"
                ],

            "gap_size":
                skill_item[
                    "gap_size"
                ],

            "priority_label":
                skill_item[
                    "priority_label"
                ],

            "criticality":
                skill_item[
                    "criticality"
                ],

            "missing_prerequisites":
                missing_prerequisites,

            "reasons":
                reasons,

            "summary_reason":
                summary,

        })


    # Actionable courses come first.
    # Locked advanced resources are still shown later.

    recommendations.sort(

        key=lambda item: (

            item["locked"],

            -item["score"],

            item["course"][
                "title"
            ],

        )

    )


    for (
        rank,
        item,
    ) in enumerate(

        recommendations,

        start=1,

    ):

        item["rank"] = (
            rank
        )


    target_role = (

        snapshot["target_role"]

        or snapshot[
            "evaluated_against_role"
        ]

    )


    target_role_name = (

        target_role.name

        if target_role is not None

        else None

    )


    return {

        "employee_id":
            employee.id,

        "employee_name":
            employee.name,

        "target_role":
            target_role_name,

        "generated_from_live_competency":
            True,

        "recommendations":
            recommendations[
                :max(
                    1,
                    limit,
                )
            ],

    }