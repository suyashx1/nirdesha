"""Phase-2 persistence models for Nirdesha.

These tables intentionally sit beside the Phase-1 competency core so the
existing Employee/Role/Skill/Evidence schema remains stable.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class ResumeAnalysis(Base):
    """Stores one AI-assisted resume/service-record extraction for review."""

    __tablename__ = "resume_analyses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey(
            "employee_profiles.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    content_type: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    extracted_text: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    parsed_json: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
    )

    parser_mode: Mapped[str] = mapped_column(
        String(30),
        default="fallback",
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="pending_review",
        index=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )


class LearningMaterial(Base):
    """Extracted text from an uploaded learning resource."""

    __tablename__ = "learning_materials"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey(
            "employee_profiles.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    filename: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    content_type: Mapped[str | None] = mapped_column(
        String(120),
        nullable=True,
    )

    text_content: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    text_hash: Mapped[str] = mapped_column(
        String(64),
        index=True,
        nullable=False,
    )

    word_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )


class GeneratedQuiz(Base):
    """Stores a source-grounded quiz generated from a LearningMaterial."""

    __tablename__ = "generated_quizzes"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    quiz_uid: Mapped[str] = mapped_column(
        String(80),
        unique=True,
        index=True,
        nullable=False,
    )

    employee_id: Mapped[int] = mapped_column(
        ForeignKey(
            "employee_profiles.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    material_id: Mapped[int] = mapped_column(
        ForeignKey(
            "learning_materials.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    topic: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    skill_code: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    difficulty: Mapped[str] = mapped_column(
        String(30),
        default="Intermediate",
        nullable=False,
    )

    generator_mode: Mapped[str] = mapped_column(
        String(30),
        default="fallback",
        nullable=False,
    )

    questions_json: Mapped[list[dict[str, Any]]] = mapped_column(
        JSON,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )