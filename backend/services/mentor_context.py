"""
Build authoritative, compact context for the Nirdesha Phase-4 AI Mentor.

Security / reliability principle:

The mentor does NOT receive:
- raw resume text
- arbitrary uploaded document instructions
- browser-only fake values

It receives structured, confirmed records from:
- employee profile
- competency engine
- assessment evidence
- Phase-3 learning progress
- recommendations
- roadmap
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
    Skill,
    SkillEvidence,
)

from ..phase3_models import (
    CourseSkillMap,
    LearningCourse,
    LearningProgress,
)

from .competency_engine import (
    get_competency_snapshot,
)

from .recommendation_engine import (
    get_recommendations,
)

from .roadmap_engine import (
    build_roadmap,
)


# =====================================================================
# BASIC HELPERS
# =====================================================================


def _now() -> datetime:
    """Timezone-aware current timestamp."""

    return datetime.now(
        timezone.utc
    )


def _role_name(
    value,
) -> str | None:
    """
    Convert a SQLAlchemy Role object
    into a simple role name.
    """

    if value is None:
        return None

    return (
        getattr(
            value,
            "name",
            None,
        )
        or str(value)
    )


def _explanation_level(
    proficiency: int,
) -> str:
    """
    Automatically determine the default
    mentor explanation depth.

    0-1 -> Beginner
    2-3 -> Intermediate
    4-5 -> Expert
    """

    if proficiency <= 1:
        return "Beginner"

    if proficiency <= 3:
        return "Intermediate"

    return "Expert"


def _safe_metadata(
    evidence: SkillEvidence,
) -> dict:
    """Always return evidence metadata as a dict."""

    value = (
        evidence.metadata_json
    )

    return (
        value
        if isinstance(
            value,
            dict,
        )
        else {}
    )


# =====================================================================
# RECENT ASSESSMENTS
# =====================================================================


def _recent_assessments(
    db: Session,
    employee_id: int,
    limit: int,
) -> list[dict]:
    """
    Get recent assessment evidence.

    Course completions and resume evidence are deliberately
    excluded because this section represents actual assessments.
    """

    rows = db.execute(

        select(
            SkillEvidence,
            Skill,
        )

        .join(
            Skill,
            Skill.id
            == SkillEvidence.skill_id,
        )

        .where(

            SkillEvidence.employee_id
            == employee_id,

            SkillEvidence.evidence_type.in_((
                "quiz",
                "formal_assessment",
                "trainer_assessment",
            )),

        )

        .order_by(

            SkillEvidence
            .recorded_at
            .desc(),

            SkillEvidence
            .id
            .desc(),

        )

        .limit(
            limit
        )

    ).all()


    output: list[
        dict
    ] = []


    for (
        evidence,
        skill,
    ) in rows:

        metadata = (
            _safe_metadata(
                evidence
            )
        )


        title_value = (
            metadata.get(
                "assessment_title"
            )
        )


        if title_value:

            title = str(
                title_value
            ).strip()

        else:

            readable_type = (

                evidence
                .evidence_type
                .replace(
                    "_",
                    " ",
                )
                .title()

            )


            title = (

                f"{skill.name} "
                f"— {readable_type}"

            )


        topic = str(

            metadata.get(
                "topic"
            )

            or skill.name

        ).strip()


        correct = (
            metadata.get(
                "correct"
            )
        )


        total = (
            metadata.get(
                "total"
            )
        )


        try:

            correct = (

                int(correct)

                if correct
                is not None

                else None

            )

        except (
            TypeError,
            ValueError,
        ):

            correct = None


        try:

            total = (

                int(total)

                if total
                is not None

                else None

            )

        except (
            TypeError,
            ValueError,
        ):

            total = None


        output.append({

            "evidence_id":
                evidence.id,

            "assessment_type":
                evidence
                .evidence_type,

            "title":
                title,

            "topic":
                topic,

            "skill_code":
                skill.code,

            "skill_name":
                skill.name,

            "score":
                round(
                    float(
                        evidence.score
                    ),
                    2,
                ),

            "correct":
                correct,

            "total":
                total,

            "recorded_at":
                evidence
                .recorded_at,

        })


    return output


# =====================================================================
# CURRENT COURSE
# =====================================================================


def _active_course(
    db: Session,
    employee_id: int,
) -> dict | None:
    """
    Return the employee's most recently active
    Phase-3 learning module.
    """

    row = db.execute(

        select(
            LearningProgress,
            LearningCourse,
        )

        .join(

            LearningCourse,

            LearningCourse.id
            == LearningProgress.course_id,

        )

        .where(

            LearningProgress.employee_id
            == employee_id,

            LearningProgress.status
            == "in_progress",

        )

        .order_by(

            LearningProgress
            .last_activity_at
            .desc(),

            LearningProgress
            .updated_at
            .desc(),

        )

        .limit(1)

    ).first()


    if row is None:
        return None


    progress, course = (
        row
    )


    skill_codes = db.execute(

        select(
            Skill.code
        )

        .join(

            CourseSkillMap,

            CourseSkillMap.skill_id
            == Skill.id,

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

    ).scalars().all()


    return {

        "course_code":
            course.course_code,

        "title":
            course.title,

        "source_label":
            course.source_label,

        "status":
            progress.status,

        "progress_pct":
            round(

                float(
                    progress
                    .progress_pct
                ),

                2,

            ),

        "skill_codes":
            list(
                skill_codes
            ),

    }


# =====================================================================
# RECOMMENDATION CONTEXT
# =====================================================================


def _top_recommendations(
    db: Session,
    employee_id: int,
    limit: int = 3,
) -> list[dict]:

    try:

        response = (
            get_recommendations(

                db,
                employee_id,

                limit=limit,

            )
        )

    except Exception:

        # Mentor context should still work
        # if recommendation generation has
        # a temporary issue.

        return []


    output: list[
        dict
    ] = []


    for item in (

        response.get(
            "recommendations",
            [],
        )[:limit]

    ):

        course = (
            item.get(
                "course"
            )
            or {}
        )


        output.append({

            "rank":
                int(

                    item.get(
                        "rank"
                    )

                    or (
                        len(output)
                        + 1
                    )

                ),

            "course_code":
                str(

                    course.get(
                        "course_code"
                    )

                    or ""

                ),

            "title":
                str(

                    course.get(
                        "title"
                    )

                    or
                    "Learning Resource"

                ),

            "source_label":
                str(

                    course.get(
                        "source_label"
                    )

                    or
                    "Prototype Catalogue"

                ),

            "driver_skill_code":
                str(

                    item.get(
                        "driver_skill_code"
                    )

                    or ""

                ),

            "driver_skill_name":
                str(

                    item.get(
                        "driver_skill_name"
                    )

                    or ""

                ),

            "match_score":
                round(

                    float(

                        item.get(
                            "score"
                        )

                        or 0.0

                    ),

                    2,

                ),

            "locked":
                bool(
                    item.get(
                        "locked"
                    )
                ),

            "summary_reason":
                str(

                    item.get(
                        "summary_reason"
                    )

                    or ""

                ),

        })


    return output


# =====================================================================
# ROADMAP CONTEXT
# =====================================================================


def _roadmap_steps(
    db: Session,
    employee_id: int,
    limit: int = 6,
) -> list[dict]:

    try:

        roadmap = (
            build_roadmap(

                db,
                employee_id,

            )
        )

    except Exception:

        return []


    output: list[
        dict
    ] = []


    for step in (

        roadmap.get(
            "steps",
            [],
        )[:limit]

    ):

        output.append({

            "step_number":
                int(

                    step.get(
                        "step_number"
                    )

                    or (
                        len(output)
                        + 1
                    )

                ),

            "step_type":
                str(

                    step.get(
                        "step_type"
                    )

                    or "learn"

                ),

            "status":
                str(

                    step.get(
                        "status"
                    )

                    or "upcoming"

                ),

            "title":
                str(

                    step.get(
                        "title"
                    )

                    or "Learning Step"

                ),

            "skill_code":
                str(

                    step.get(
                        "skill_code"
                    )

                    or ""

                ),

            "skill_name":
                str(

                    step.get(
                        "skill_name"
                    )

                    or ""

                ),

            "course_code":
                step.get(
                    "course_code"
                ),

            "reason":
                str(

                    step.get(
                        "reason"
                    )

                    or ""

                ),

        })


    return output


# =====================================================================
# COMPLETE PHASE-4 CONTEXT
# =====================================================================


def build_mentor_context(
    db: Session,
    employee_id: int,
    *,
    recent_limit: int = 5,
) -> dict:
    """
    Return the authoritative mentor context.

    This is the only employee-context object
    that should be injected into the LLM.
    """

    employee = db.scalar(

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


    if employee is None:

        raise ValueError(
            "Employee profile not found."
        )


    # -------------------------------------------------------------
    # LIVE COMPETENCY
    # -------------------------------------------------------------

    snapshot = (
        get_competency_snapshot(

            db,
            employee_id,

        )
    )


    # Rank only actual gaps.

    ranked_gaps = sorted(

        (

            item

            for item
            in snapshot.get(
                "skills",
                [],
            )

            if int(
                item.get(
                    "gap_size"
                )
                or 0
            ) > 0

        ),

        key=lambda item: (

            -float(
                item.get(
                    "priority_score"
                )
                or 0.0
            ),

            -int(
                item.get(
                    "criticality"
                )
                or 0
            ),

            -int(
                item.get(
                    "gap_size"
                )
                or 0
            ),

            float(
                item.get(
                    "confidence_score"
                )
                or 0.0
            ),

        ),

    )


    top_gaps: list[
        dict
    ] = []


    for item in ranked_gaps[:3]:

        current = int(

            item.get(
                "current_proficiency"
            )

            or 0

        )


        top_gaps.append({

            "skill_code":
                str(
                    item.get(
                        "skill_code"
                    )
                    or ""
                ),

            "skill_name":
                str(
                    item.get(
                        "skill_name"
                    )
                    or ""
                ),

            "domain":
                str(
                    item.get(
                        "domain"
                    )
                    or ""
                ),

            "current_proficiency":
                current,

            "required_proficiency":
                int(
                    item.get(
                        "required_proficiency"
                    )
                    or 0
                ),

            "confidence_score":
                round(

                    float(
                        item.get(
                            "confidence_score"
                        )
                        or 0.0
                    ),

                    2,

                ),

            "gap_size":
                int(
                    item.get(
                        "gap_size"
                    )
                    or 0
                ),

            "priority_label":
                str(
                    item.get(
                        "priority_label"
                    )
                    or ""
                ),

            "criticality":
                int(
                    item.get(
                        "criticality"
                    )
                    or 0
                ),

            "reason":
                str(
                    item.get(
                        "reason"
                    )
                    or ""
                ),

            "explanation_level":
                _explanation_level(
                    current
                ),

        })


    # -------------------------------------------------------------
    # OTHER CONTEXT STREAMS
    # -------------------------------------------------------------

    assessments = (
        _recent_assessments(

            db,
            employee_id,

            max(
                1,
                min(
                    int(
                        recent_limit
                    ),
                    10,
                ),
            ),

        )
    )


    active_course = (
        _active_course(

            db,
            employee_id,

        )
    )


    recommendations = (
        _top_recommendations(

            db,
            employee_id,

            limit=3,

        )
    )


    roadmap_steps = (
        _roadmap_steps(

            db,
            employee_id,

            limit=6,

        )
    )


    current_role = (
        _role_name(

            snapshot.get(
                "current_role"
            )

        )
    )


    target_role = (
        _role_name(

            snapshot.get(
                "target_role"
            )

            or snapshot.get(
                "evaluated_against_role"
            )

        )
    )


    department_name = (

        employee.department.name

        if employee.department
        is not None

        else None

    )


    # -------------------------------------------------------------
    # DYNAMIC QUICK QUESTIONS
    # -------------------------------------------------------------

    suggested_prompts: list[
        str
    ] = []


    if top_gaps:

        top = top_gaps[0]


        suggested_prompts.extend([

            (
                f"Why is "
                f"{top['skill_name']} "
                "my highest-priority gap, "
                "and what should I revise first?"
            ),

            (
                f"Explain "
                f"{top['skill_name']} "
                f"at my current "
                f"{top['explanation_level']} "
                "level with an Official Statistics example."
            ),

        ])


    if active_course:

        suggested_prompts.append(

            (
                "How does my current course "
                f"'{active_course['title']}' "
                "help me close my competency gaps?"
            )

        )


    if assessments:

        latest = (
            assessments[0]
        )


        suggested_prompts.append(

            (
                f"I scored "
                f"{latest['score']:.0f}% "
                f"in "
                f"{latest['skill_name']}. "
                "What should I improve next?"
            )

        )


    if target_role:

        suggested_prompts.append(

            (
                "What should I focus on next "
                "for my target role: "
                f"{target_role}?"
            )

        )


    # Remove duplicates while preserving order.

    suggested_prompts = list(

        dict.fromkeys(
            suggested_prompts
        )

    )[:4]


    # -------------------------------------------------------------
    # FINAL CONTEXT
    # -------------------------------------------------------------

    return {

        "context_version":
            4,

        "context_mode":
            "database_injected",

        "generated_at":
            _now(),

        "employee_id":
            employee.id,

        "employee_code":
            employee.employee_code,

        "employee_name":
            employee.name,

        "designation":
            employee.designation,

        "department":
            department_name,

        "division":
            employee.division,

        "current_role":
            current_role,

        "target_role":
            target_role,

        "career_goal":
            target_role,

        "preferred_language":
            (
                employee
                .preferred_language

                or "English"
            ),

        "readiness_pct":
            round(

                float(
                    snapshot.get(
                        "readiness_pct"
                    )
                    or 0.0
                ),

                2,

            ),

        "total_required_skills":
            int(
                snapshot.get(
                    "total_required_skills"
                )
                or 0
            ),

        "requirements_met":
            int(
                snapshot.get(
                    "requirements_met"
                )
                or 0
            ),

        "high_priority_gaps":
            int(
                snapshot.get(
                    "high_priority_gaps"
                )
                or 0
            ),

        "top_gaps":
            top_gaps,

        "recent_assessments":
            assessments,

        "active_course":
            active_course,

        "top_recommendations":
            recommendations,

        "roadmap_steps":
            roadmap_steps,

        "suggested_prompts":
            suggested_prompts,

        "limitations": [

            (
                "Course catalogue entries labelled "
                "Prototype iGOT/NSSTA are demo integration "
                "data, not a live authenticated official API feed."
            ),

            (
                "Course completion is learning evidence, "
                "not proof of skill mastery; assessment evidence "
                "carries stronger weight."
            ),

            (
                "Role readiness is competency guidance only "
                "and does not predict or guarantee promotion, "
                "posting, vacancy, examination result or HR decision."
            ),

            (
                "The mentor must not invent personal work history "
                "or assessment details that are absent from this "
                "structured context."
            ),

        ],

    }