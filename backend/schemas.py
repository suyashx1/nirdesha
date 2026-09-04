"""
Pydantic request and response models for Nirdesha.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    model_validator,
)


# ---------------------------------------------------------------------------
# VALID EVIDENCE TYPES
# ---------------------------------------------------------------------------

EvidenceType = Literal[
    "formal_assessment",
    "quiz",
    "course_completion",
    "self_assessment",
    "trainer_assessment",
]


# ---------------------------------------------------------------------------
# BASE ORM SCHEMA
# ---------------------------------------------------------------------------

class ORMModel(BaseModel):

    model_config = ConfigDict(
        from_attributes=True
    )


# ---------------------------------------------------------------------------
# BASIC DATABASE OUTPUT SCHEMAS
# ---------------------------------------------------------------------------

class DepartmentOut(ORMModel):

    id: int
    code: str
    name: str


class RoleOut(ORMModel):

    id: int
    code: str
    name: str
    description: str | None = None
    level: int


class SkillOut(ORMModel):

    id: int
    code: str
    name: str
    domain: str
    description: str | None = None
    active: bool


# ---------------------------------------------------------------------------
# EMPLOYEE PROFILE
# ---------------------------------------------------------------------------

class EmployeeProfileOut(ORMModel):

    id: int
    employee_code: str
    name: str
    email: str

    designation: str | None = None
    division: str | None = None
    cadre: str | None = None
    ministry: str | None = None
    station: str | None = None
    tenure: str | None = None
    status: str | None = None
    education: str | None = None

    experience_years: float
    preferred_language: str

    department: DepartmentOut | None = None
    current_role: RoleOut | None = None
    target_role: RoleOut | None = None

    created_at: datetime
    updated_at: datetime


class EmployeeProfileUpdate(BaseModel):

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=180,
    )

    email: str | None = Field(
        default=None,
        min_length=3,
        max_length=180,
    )

    designation: str | None = Field(
        default=None,
        max_length=180,
    )

    division: str | None = Field(
        default=None,
        max_length=180,
    )

    cadre: str | None = Field(
        default=None,
        max_length=180,
    )

    ministry: str | None = Field(
        default=None,
        max_length=180,
    )

    station: str | None = Field(
        default=None,
        max_length=180,
    )

    tenure: str | None = Field(
        default=None,
        max_length=180,
    )

    status: str | None = None

    education: str | None = Field(
        default=None,
        max_length=250,
    )

    experience_years: float | None = Field(
        default=None,
        ge=0,
        le=60,
    )

    preferred_language: str | None = Field(
        default=None,
        max_length=60,
    )

    current_role_code: str | None = None
    target_role_code: str | None = None


# ---------------------------------------------------------------------------
# SKILL EVIDENCE
# ---------------------------------------------------------------------------

class EvidenceCreate(BaseModel):

    employee_id: int = Field(gt=0)

    skill_id: int | None = Field(
        default=None,
        gt=0,
    )

    skill_code: str | None = None

    evidence_type: EvidenceType

    score: float = Field(
        ge=0,
        le=100,
    )

    source: str = Field(
        default="nirdesha",
        min_length=1,
        max_length=120,
    )

    source_ref: str | None = Field(
        default=None,
        max_length=180,
    )

    notes: str | None = None

    metadata: dict[str, Any] | None = None

    recorded_at: datetime | None = None

    @model_validator(mode="after")
    def validate_skill_reference(
        self
    ) -> "EvidenceCreate":

        if (
            self.skill_id is None
            and not self.skill_code
        ):
            raise ValueError(
                "Provide either skill_id or skill_code."
            )

        return self


class EvidenceOut(ORMModel):

    id: int
    employee_id: int
    skill_id: int

    evidence_type: str
    score: float

    source: str
    source_ref: str | None = None
    notes: str | None = None

    metadata_json: dict[str, Any] | None = None

    recorded_at: datetime


# ---------------------------------------------------------------------------
# ASSESSMENT RESULTS
# ---------------------------------------------------------------------------

class AssessmentSkillResult(BaseModel):

    skill_code: str = Field(
        min_length=1,
        max_length=80,
    )

    score: float = Field(
        ge=0,
        le=100,
    )

    correct: int | None = Field(
        default=None,
        ge=0,
    )

    total: int | None = Field(
        default=None,
        ge=1,
    )

    metadata: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_counts(
        self
    ) -> "AssessmentSkillResult":

        if (
            self.correct is not None
            and self.total is not None
            and self.correct > self.total
        ):
            raise ValueError(
                "correct cannot be greater than total."
            )

        return self


class AssessmentResultCreate(BaseModel):

    employee_id: int = Field(gt=0)

    assessment_title: str = Field(
        min_length=1,
        max_length=180,
    )

    assessment_type: Literal[
        "quiz",
        "formal_assessment",
    ] = "quiz"

    source_ref: str | None = Field(
        default=None,
        max_length=180,
    )

    results: list[
        AssessmentSkillResult
    ] = Field(
        min_length=1
    )


# ---------------------------------------------------------------------------
# COMPETENCY OUTPUT
# ---------------------------------------------------------------------------

class ConfidenceBreakdown(BaseModel):

    formal_assessment_avg: float
    quiz_avg: float
    course_completion_ratio: float
    recency_factor: float
    self_assessment: float

    raw_confidence: float
    final_confidence: float

    evidence_count: int

    limited_by_minimum_evidence_rule: bool


class CompetencySkillItem(BaseModel):

    skill_id: int
    skill_code: str
    skill_name: str
    domain: str

    current_proficiency: int
    required_proficiency: int

    confidence_score: float
    evidence_count: int

    gap_size: int
    gap_label: str

    priority_score: float
    priority_label: str

    criticality: int
    blocks_progression: bool

    last_evidence_at: datetime | None = None

    confidence_breakdown: ConfidenceBreakdown

    reason: str


class CompetencySummary(BaseModel):

    employee_id: int
    employee_name: str
    employee_code: str

    current_role: RoleOut | None
    target_role: RoleOut | None

    evaluated_against_role: RoleOut | None

    readiness_pct: float

    total_required_skills: int
    requirements_met: int
    high_priority_gaps: int

    skills: list[
        CompetencySkillItem
    ]


# ---------------------------------------------------------------------------
# API RESPONSE WRAPPERS
# ---------------------------------------------------------------------------

class EvidenceCreateResponse(BaseModel):

    evidence: EvidenceOut
    updated_skill: CompetencySkillItem | None


class AssessmentResultResponse(BaseModel):

    saved_evidence: list[
        EvidenceOut
    ]

    competency: CompetencySummary