"""Pydantic schemas used by Nirdesha Phase 2."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from .schemas import CompetencySummary, EmployeeProfileOut


class ExtractedProfileField(BaseModel):

    value: str | float | None = None

    confidence: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
    )

    evidence: str | None = None


class ExtractedSkill(BaseModel):

    skill_code: str
    skill_name: str

    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )

    suggested_score: float = Field(
        ge=0.0,
        le=100.0,
    )

    evidence: str | None = None


class ResumeParseResponse(BaseModel):

    analysis_id: int
    employee_id: int
    filename: str
    parser_mode: str
    status: str

    profile: dict[
        str,
        ExtractedProfileField,
    ]

    skills: list[
        ExtractedSkill
    ]

    warnings: list[str] = Field(
        default_factory=list
    )

    preview: str


class ConfirmedSkill(BaseModel):

    skill_code: str

    score: float = Field(
        ge=0.0,
        le=100.0,
    )

    evidence: str | None = None


class ResumeConfirmRequest(BaseModel):

    profile: dict[
        str,
        Any,
    ] = Field(
        default_factory=dict
    )

    skills: list[
        ConfirmedSkill
    ] = Field(
        default_factory=list
    )


class ResumeConfirmResponse(BaseModel):

    analysis_id: int
    status: str

    profile: EmployeeProfileOut

    competency: CompetencySummary

    evidence_added: int


class MaterialOut(BaseModel):

    id: int
    employee_id: int
    filename: str
    title: str

    content_type: str | None = None

    word_count: int

    created_at: datetime

    preview: str


class QuizGenerateRequest(BaseModel):

    question_count: int = Field(
        default=5,
        ge=3,
        le=10,
    )

    difficulty: Literal[
        "Beginner",
        "Intermediate",
        "Advanced",
    ] = "Intermediate"

    skill_code: str | None = None

    question_time_seconds: int = Field(
        default=45,
        ge=20,
        le=120,
    )


class QuizQuestionOut(BaseModel):

    id: str
    prompt: str

    type: str = "mcq"

    options: list[str]

    correct: int = Field(
        ge=0,
        le=3,
    )

    explanation: str

    allocatedSeconds: int

    sourceQuote: str

    sourceChunk: int


class GeneratedQuizOut(BaseModel):

    id: str
    title: str
    topic: str
    mode: str
    format: str
    focus: str
    difficulty: str

    skillCode: str

    materialId: int

    sourceFile: str

    generatorMode: str

    timerMode: str

    questionTime: int

    totalExamMinutes: int

    isNew: bool

    createdAt: int

    questions: list[
        QuizQuestionOut
    ]