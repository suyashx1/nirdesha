"""Pydantic schemas for the Phase-4 context-aware AI Mentor."""

from __future__ import annotations

from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
)


class MentorGapContext(BaseModel):
    """One live competency gap supplied to the AI Mentor."""

    skill_code: str
    skill_name: str
    domain: str

    current_proficiency: int
    required_proficiency: int

    confidence_score: float

    gap_size: int

    priority_label: str
    criticality: int

    reason: str

    # Beginner / Intermediate / Expert
    explanation_level: str


class MentorAssessmentContext(BaseModel):
    """Recent assessment evidence available to the mentor."""

    evidence_id: int

    assessment_type: str

    title: str
    topic: str

    skill_code: str
    skill_name: str

    score: float

    correct: int | None = None
    total: int | None = None

    recorded_at: datetime


class MentorCourseContext(BaseModel):
    """Currently active Phase-3 learning module."""

    course_code: str

    title: str
    source_label: str

    status: str

    progress_pct: float

    skill_codes: list[str] = Field(
        default_factory=list
    )


class MentorRecommendationContext(BaseModel):
    """Compact recommendation record for mentor reasoning."""

    rank: int

    course_code: str
    title: str

    source_label: str

    driver_skill_code: str
    driver_skill_name: str

    match_score: float

    locked: bool

    summary_reason: str


class MentorRoadmapStepContext(BaseModel):
    """Relevant personalized roadmap step."""

    step_number: int

    step_type: str
    status: str

    title: str

    skill_code: str
    skill_name: str

    course_code: str | None = None

    reason: str


class MentorContextOut(BaseModel):
    """Complete authoritative Phase-4 mentor context."""

    context_version: int = 4

    context_mode: str = (
        "database_injected"
    )

    generated_at: datetime

    employee_id: int
    employee_code: str
    employee_name: str

    designation: str | None = None

    department: str | None = None
    division: str | None = None

    current_role: str | None = None
    target_role: str | None = None

    career_goal: str | None = None

    preferred_language: str

    readiness_pct: float

    total_required_skills: int
    requirements_met: int

    high_priority_gaps: int

    top_gaps: list[
        MentorGapContext
    ] = Field(
        default_factory=list
    )

    recent_assessments: list[
        MentorAssessmentContext
    ] = Field(
        default_factory=list
    )

    active_course: (
        MentorCourseContext
        | None
    ) = None

    top_recommendations: list[
        MentorRecommendationContext
    ] = Field(
        default_factory=list
    )

    roadmap_steps: list[
        MentorRoadmapStepContext
    ] = Field(
        default_factory=list
    )

    suggested_prompts: list[str] = Field(
        default_factory=list
    )

    limitations: list[str] = Field(
        default_factory=list
    )


class MentorContextSummaryOut(BaseModel):
    """
    Lightweight context used by the frontend
    status panel.
    """

    context_version: int = 4

    generated_at: datetime

    employee_id: int
    employee_name: str

    current_role: str | None = None
    target_role: str | None = None

    readiness_pct: float

    top_gap: (
        MentorGapContext
        | None
    ) = None

    active_course: (
        MentorCourseContext
        | None
    ) = None

    recent_assessment: (
        MentorAssessmentContext
        | None
    ) = None

    suggested_prompts: list[str] = Field(
        default_factory=list
    )