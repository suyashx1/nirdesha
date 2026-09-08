"""Shared Phase-3 catalogue/progress query helpers."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Skill

from ..phase3_models import (
    LearningCourse,
    CourseSkillMap,
    CoursePrerequisite,
    LearningProgress,
)


def get_course_by_code(
    db: Session,
    course_code: str,
) -> LearningCourse | None:

    return db.scalar(

        select(
            LearningCourse
        )

        .where(

            LearningCourse.course_code
            == course_code
            .strip()
            .upper(),

            LearningCourse.active.is_(
                True
            ),

        )

    )


def get_progress_map(
    db: Session,
    employee_id: int,
) -> dict[int, LearningProgress]:

    return {

        row.course_id:
            row

        for row
        in db.scalars(

            select(
                LearningProgress
            )

            .where(

                LearningProgress.employee_id
                == employee_id

            )

        ).all()

    }


def get_completed_course_codes(
    db: Session,
    employee_id: int,
) -> set[str]:

    rows = db.execute(

        select(
            LearningCourse.course_code
        )

        .join(

            LearningProgress,

            LearningProgress.course_id
            == LearningCourse.id,

        )

        .where(

            LearningProgress.employee_id
            == employee_id,

            LearningProgress.status
            == "completed",

        )

    ).scalars().all()


    return set(
        rows
    )


def course_to_dict(
    db: Session,
    course: LearningCourse,
) -> dict:

    mappings = db.execute(

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


    prerequisite_codes = db.execute(

        select(
            LearningCourse.course_code
        )

        .join(

            CoursePrerequisite,

            CoursePrerequisite
            .prerequisite_course_id
            == LearningCourse.id,

        )

        .where(

            CoursePrerequisite.course_id
            == course.id

        )

        .order_by(
            LearningCourse.course_code
        )

    ).scalars().all()


    return {

        "id":
            course.id,

        "course_code":
            course.course_code,

        "title":
            course.title,

        "source_type":
            course.source_type,

        "source_label":
            course.source_label,

        "catalog_status":
            course.catalog_status,

        "description":
            course.description,

        "difficulty":
            course.difficulty,

        "duration_hours":
            course.duration_hours,

        "language":
            course.language,

        "delivery_mode":
            course.delivery_mode,

        "learning_outcomes":
            list(
                course.learning_outcomes
                or []
            ),

        "tags":
            list(
                course.tags
                or []
            ),

        "skills": [

            {

                "skill_code":
                    skill.code,

                "skill_name":
                    skill.name,

                "domain":
                    skill.domain,

                "relevance_weight":
                    mapping
                    .relevance_weight,

                "is_primary":
                    mapping
                    .is_primary,

                "target_proficiency_min":
                    mapping
                    .target_proficiency_min,

                "target_proficiency_max":
                    mapping
                    .target_proficiency_max,

            }

            for (
                mapping,
                skill,
            )
            in mappings

        ],

        "prerequisites":
            list(
                prerequisite_codes
            ),

    }