"""Pydantic schemas for Nirdesha Phase 3 personalized learning."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from .schemas import CompetencySummary


class ORMModel(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )


class CourseSkillOut(BaseModel):

    skill_code: str
    skill_name: str
    domain: str

    relevance_weight: float
    is_primary: bool

    target_proficiency_min: int
    target_proficiency_max: int


class CourseOut(BaseModel):

    id: int

    course_code: str
    title: str

    source_type: str
    source_label: str
    catalog_status: str

    description: str
    difficulty: str

    duration_hours: float

    language: str
    delivery_mode: str

    learning_outcomes: list[str]
    tags: list[str]

    skills: list[CourseSkillOut]

    prerequisites: list[str]


class RecommendationOut(BaseModel):

    rank: int
    score: float

    locked: bool

    course: CourseOut

    driver_skill_code: str
    driver_skill_name: str

    current_proficiency: int
    required_proficiency: int

    confidence_score: float

    gap_size: int
    priority_label: str
    criticality: int

    missing_prerequisites: list[str]

    reasons: list[str]

    summary_reason: str


class RecommendationResponse(BaseModel):

    employee_id: int
    employee_name: str

    target_role: str | None

    generated_from_live_competency: bool = True

    recommendations: list[
        RecommendationOut
    ]


class LearningProgressOut(BaseModel):

    course_code: str
    course_title: str

    status: str
    progress_pct: float

    started_at: datetime | None = None
    last_activity_at: datetime | None = None
    completed_at: datetime | None = None


class ProgressUpdateRequest(BaseModel):

    progress_pct: float = Field(
        ge=0.0,
        le=100.0,
    )


class ProgressActionResponse(BaseModel):

    progress: LearningProgressOut

    competency: CompetencySummary

    course_completion_evidence_added: int = 0


RoadmapStepType = Literal[
    "learn",
    "practice",
    "assessment",
    "reinforcement",
]


RoadmapStepStatus = Literal[
    "completed",
    "current",
    "upcoming",
    "locked",
    "mastered",
]


class RoadmapStepOut(BaseModel):

    step_number: int

    step_type: RoadmapStepType

    status: RoadmapStepStatus

    title: str
    subtitle: str

    skill_code: str
    skill_name: str

    course_code: str | None = None

    source_label: str | None = None

    difficulty: str | None = None

    progress_pct: float = 0.0

    estimated_hours: float = 0.0

    reason: str

    prerequisites: list[str] = Field(
        default_factory=list
    )


class RoadmapOut(BaseModel):

    employee_id: int
    employee_name: str

    current_role: str | None
    target_role: str | None

    readiness_pct: float

    top_gap: str | None

    total_steps: int
    completed_steps: int

    roadmap_progress_pct: float

    steps: list[
        RoadmapStepOut
    ]