"""Phase-3 persistence models for personalized learning.

These models add a structured prototype learning catalogue, course-to-skill
mapping, prerequisite relationships, and per-employee learning progress.

They intentionally do not modify the Phase-1 competency tables.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
)

from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class LearningCourse(Base):
    """One prototype iGOT/NSSTA learning resource."""

    __tablename__ = "learning_courses"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    course_code: Mapped[str] = mapped_column(
        String(80),
        unique=True,
        index=True,
        nullable=False,
    )

    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    # Phase-3 values:
    # igot
    # nssta

    source_type: Mapped[str] = mapped_column(
        String(30),
        index=True,
        nullable=False,
    )

    source_label: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    # Makes it explicit that this is NOT
    # a live authenticated official catalogue.

    catalog_status: Mapped[str] = mapped_column(
        String(60),
        default="prototype_catalogue",
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    difficulty: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    duration_hours: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    language: Mapped[str] = mapped_column(
        String(60),
        default="English",
        nullable=False,
    )

    delivery_mode: Mapped[str] = mapped_column(
        String(60),
        default="Self-paced",
        nullable=False,
    )

    learning_outcomes: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    tags: Mapped[list[str]] = mapped_column(
        JSON,
        default=list,
        nullable=False,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )


class CourseSkillMap(Base):
    """Maps a course to one or more competency skills."""

    __tablename__ = "course_skill_map"

    __table_args__ = (
        UniqueConstraint(
            "course_id",
            "skill_id",
            name="uq_course_skill_map",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey(
            "learning_courses.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey(
            "skills.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    relevance_weight: Mapped[float] = mapped_column(
        Float,
        default=1.0,
        nullable=False,
    )

    is_primary: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # The course is most suitable when the employee's
    # current level lies roughly in this range.

    target_proficiency_min: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    target_proficiency_max: Mapped[int] = mapped_column(
        Integer,
        default=5,
        nullable=False,
    )


class CoursePrerequisite(Base):
    """Course-to-course prerequisite edge."""

    __tablename__ = "course_prerequisites"

    __table_args__ = (
        UniqueConstraint(
            "course_id",
            "prerequisite_course_id",
            name="uq_course_prerequisite",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    course_id: Mapped[int] = mapped_column(
        ForeignKey(
            "learning_courses.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    prerequisite_course_id: Mapped[int] = mapped_column(
        ForeignKey(
            "learning_courses.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )


class LearningProgress(Base):
    """Backend learning progress for one employee/course."""

    __tablename__ = "learning_progress"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "course_id",
            name="uq_employee_course_progress",
        ),
    )

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

    course_id: Mapped[int] = mapped_column(
        ForeignKey(
            "learning_courses.id",
            ondelete="CASCADE",
        ),
        index=True,
        nullable=False,
    )

    # Stored statuses:
    #
    # not_started
    # in_progress
    # completed
    #
    # Mastery is NOT manually stored here.
    # It is determined by competency evidence.

    status: Mapped[str] = mapped_column(
        String(30),
        default="not_started",
        nullable=False,
    )

    progress_pct: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    last_activity_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(
        JSON,
        nullable=True,
    )