"""Adaptive roadmap builder for Nirdesha Phase 3."""

from __future__ import annotations

from sqlalchemy.orm import Session

from ..models import (
    EmployeeProfile,
)

from .competency_engine import (
    get_competency_snapshot,
)

from .course_service import (
    get_progress_map,
)

from .recommendation_engine import (
    get_recommendations,
)


def _course_progress(
    progress_map: dict,
    course_id: int,
):

    return progress_map.get(
        course_id
    )


def build_roadmap(
    db: Session,
    employee_id: int,
    max_course_steps: int = 4,
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


    recommendation_response = (
        get_recommendations(

            db,
            employee_id,

            limit=20,

        )
    )


    recommendations = (
        recommendation_response[
            "recommendations"
        ]
    )


    progress_map = (
        get_progress_map(

            db,
            employee_id,

        )
    )


    skill_lookup = {

        item["skill_code"]:
            item

        for item
        in snapshot["skills"]

    }


    selected: list[
        dict
    ] = []


    seen_courses: set[
        str
    ] = set()


    seen_skills: set[
        str
    ] = set()


    # -------------------------------------------------------------
    # SELECT ACTIONABLE COURSES FIRST
    # -------------------------------------------------------------

    for item in recommendations:

        code = item[
            "course"
        ][
            "course_code"
        ]


        skill_code = item[
            "driver_skill_code"
        ]


        if (
            code in seen_courses
            or item["locked"]
        ):

            continue


        if (
            skill_code
            in seen_skills

            and len(
                selected
            ) < 2
        ):

            continue


        selected.append(
            item
        )


        seen_courses.add(
            code
        )


        seen_skills.add(
            skill_code
        )


        if (
            len(selected)
            >= max_course_steps
        ):

            break


    # -------------------------------------------------------------
    # INCLUDE LOCKED FUTURE COURSES
    # -------------------------------------------------------------

    if (
        len(selected)
        < max_course_steps
    ):

        for item in recommendations:

            code = item[
                "course"
            ][
                "course_code"
            ]


            if code in seen_courses:

                continue


            selected.append(
                item
            )


            seen_courses.add(
                code
            )


            if (
                len(selected)
                >= max_course_steps
            ):

                break


    steps: list[
        dict
    ] = []


    step_number = 1


    first_actionable_assigned = (
        False
    )


    for rec in selected:

        course = rec[
            "course"
        ]


        skill = skill_lookup.get(

            rec[
                "driver_skill_code"
            ],

            {},

        )


        progress = (
            _course_progress(

                progress_map,

                course["id"],

            )
        )


        progress_pct = (

            float(
                progress.progress_pct
            )

            if progress

            else 0.0

        )


        stored_status = (

            progress.status

            if progress

            else "not_started"

        )


        gap_size = int(

            skill.get(

                "gap_size",

                rec["gap_size"],

            )

        )


        # ---------------------------------------------------------
        # LEARNING NODE STATUS
        # ---------------------------------------------------------

        if (
            stored_status
            == "completed"

            and gap_size <= 0
        ):

            learn_status = (
                "mastered"
            )


        elif (
            stored_status
            == "completed"
        ):

            learn_status = (
                "completed"
            )


        elif rec["locked"]:

            learn_status = (
                "locked"
            )


        elif (
            stored_status
            == "in_progress"
        ):

            learn_status = (
                "current"
            )

            first_actionable_assigned = (
                True
            )


        elif not first_actionable_assigned:

            learn_status = (
                "current"
            )

            first_actionable_assigned = (
                True
            )


        else:

            learn_status = (
                "upcoming"
            )


        steps.append({

            "step_number":
                step_number,

            "step_type":
                "learn",

            "status":
                learn_status,

            "title":
                course[
                    "title"
                ],

            "subtitle": (

                f"{course['source_label']} • "
                f"{course['difficulty']} • "
                f"{course['duration_hours']:g}h"

            ),

            "skill_code":
                rec[
                    "driver_skill_code"
                ],

            "skill_name":
                rec[
                    "driver_skill_name"
                ],

            "course_code":
                course[
                    "course_code"
                ],

            "source_label":
                course[
                    "source_label"
                ],

            "difficulty":
                course[
                    "difficulty"
                ],

            "progress_pct":
                progress_pct,

            "estimated_hours":
                float(
                    course[
                        "duration_hours"
                    ]
                ),

            "reason":
                rec[
                    "summary_reason"
                ],

            "prerequisites":
                list(
                    course[
                        "prerequisites"
                    ]
                ),

        })


        step_number += 1


        # ---------------------------------------------------------
        # FOLLOW-UP MASTERY CHECK
        # ---------------------------------------------------------

        if (
            stored_status
            == "completed"

            and gap_size <= 0
        ):

            assessment_status = (
                "mastered"
            )


        elif (
            stored_status
            == "completed"
        ):

            assessment_status = (
                "current"
            )

            first_actionable_assigned = (
                True
            )


        elif learn_status in {
            "locked",
            "upcoming",
        }:

            assessment_status = (
                "locked"
            )


        else:

            assessment_status = (
                "upcoming"
            )


        assessment_type = (
            "assessment"
        )


        assessment_title = (

            f"Mastery Check — "
            f"{rec['driver_skill_name']}"

        )


        assessment_reason = (

            "Complete a targeted quiz after learning. "
            "Assessment evidence has stronger competency "
            "weight than course completion alone."

        )


        # If course completed but large gap remains,
        # explicitly create reinforcement.

        if (
            stored_status
            == "completed"

            and gap_size >= 2
        ):

            assessment_type = (
                "reinforcement"
            )


            assessment_title = (

                f"Reinforce Weak Area — "
                f"{rec['driver_skill_name']}"

            )


            assessment_reason = (

                "The course is complete, but the live "
                "competency gap remains significant. "
                "Review weak concepts and take a targeted "
                "reassessment."

            )


        steps.append({

            "step_number":
                step_number,

            "step_type":
                assessment_type,

            "status":
                assessment_status,

            "title":
                assessment_title,

            "subtitle":
                "Evidence checkpoint • Existing Nirdesha quiz engine",

            "skill_code":
                rec[
                    "driver_skill_code"
                ],

            "skill_name":
                rec[
                    "driver_skill_name"
                ],

            "course_code":
                None,

            "source_label":
                None,

            "difficulty":
                None,

            "progress_pct": (

                100.0

                if assessment_status
                in {
                    "completed",
                    "mastered",
                }

                else 0.0

            ),

            "estimated_hours":
                0.5,

            "reason":
                assessment_reason,

            "prerequisites": [

                course[
                    "course_code"
                ]

            ],

        })


        step_number += 1


    completed_steps = sum(

        1

        for step in steps

        if step["status"]
        in {
            "completed",
            "mastered",
        }

    )


    roadmap_progress = (

        round(

            100.0
            * completed_steps
            / len(steps),

            2,

        )

        if steps

        else 0.0

    )


    top_gap_item = next(

        (

            item

            for item
            in snapshot["skills"]

            if item[
                "gap_size"
            ] > 0

        ),

        None,

    )


    current_role = (
        snapshot[
            "current_role"
        ]
    )


    target_role = (

        snapshot[
            "target_role"
        ]

        or snapshot[
            "evaluated_against_role"
        ]

    )


    return {

        "employee_id":
            employee.id,

        "employee_name":
            employee.name,

        "current_role": (

            current_role.name

            if current_role
            is not None

            else None

        ),

        "target_role": (

            target_role.name

            if target_role
            is not None

            else None

        ),

        "readiness_pct":
            snapshot[
                "readiness_pct"
            ],

        "top_gap": (

            top_gap_item[
                "skill_name"
            ]

            if top_gap_item

            else None

        ),

        "total_steps":
            len(
                steps
            ),

        "completed_steps":
            completed_steps,

        "roadmap_progress_pct":
            roadmap_progress,

        "steps":
            steps,

    }