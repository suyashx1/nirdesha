"""
Core SQLAlchemy models for Nirdesha:

Employee
    ↓
Role
    ↓
Required Skills
    ↓
Evidence
    ↓
Skill Confidence
    ↓
Skill Gaps
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
    relationship,
)

from .database import Base


# ---------------------------------------------------------------------------
# TIME UTILITY
# ---------------------------------------------------------------------------

def utc_now() -> datetime:
    """Return the current UTC timestamp."""

    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# DEPARTMENT
# ---------------------------------------------------------------------------

class Department(Base):

    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    employees: Mapped[list["EmployeeProfile"]] = relationship(
        back_populates="department"
    )


# ---------------------------------------------------------------------------
# ROLE
# ---------------------------------------------------------------------------

class Role(Base):

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    level: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    requirements: Mapped[list["RoleSkillRequirement"]] = relationship(
        back_populates="role",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# SKILL
# ---------------------------------------------------------------------------

class Skill(Base):

    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    code: Mapped[str] = mapped_column(
        String(80),
        unique=True,
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    domain: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    role_requirements: Mapped[
        list["RoleSkillRequirement"]
    ] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# ROLE → SKILL REQUIREMENT
# ---------------------------------------------------------------------------

class RoleSkillRequirement(Base):

    __tablename__ = "role_skill_requirements"

    __table_args__ = (
        UniqueConstraint(
            "role_id",
            "skill_id",
            name="uq_role_skill_requirement",
        ),
    )

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    role_id: Mapped[int] = mapped_column(
        ForeignKey(
            "roles.id",
            ondelete="CASCADE",
        ),
        index=True,
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey(
            "skills.id",
            ondelete="CASCADE",
        ),
        index=True,
    )

    # Nirdesha proficiency scale:
    #
    # 0 = No evidence
    # 1 = Beginner
    # 2 = Basic
    # 3 = Intermediate
    # 4 = Advanced
    # 5 = Expert

    required_proficiency: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    # Importance of this skill to the role.
    # Range = 1 to 5.

    criticality: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False,
    )

    # Whether this competency is important for
    # target-role progression.

    blocks_progression: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    role: Mapped["Role"] = relationship(
        back_populates="requirements"
    )

    skill: Mapped["Skill"] = relationship(
        back_populates="role_requirements"
    )


# ---------------------------------------------------------------------------
# EMPLOYEE PROFILE
# ---------------------------------------------------------------------------

class EmployeeProfile(Base):

    __tablename__ = "employee_profiles"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    employee_code: Mapped[str] = mapped_column(
        String(80),
        unique=True,
        index=True,
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(180),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(180),
        unique=True,
        index=True,
        nullable=False,
    )

    department_id: Mapped[int | None] = mapped_column(
        ForeignKey("departments.id"),
        nullable=True,
    )

    current_role_id: Mapped[int | None] = mapped_column(
        ForeignKey("roles.id"),
        nullable=True,
    )

    target_role_id: Mapped[int | None] = mapped_column(
        ForeignKey("roles.id"),
        nullable=True,
    )

    designation: Mapped[str | None] = mapped_column(
        String(180),
        nullable=True,
    )

    division: Mapped[str | None] = mapped_column(
        String(180),
        nullable=True,
    )

    cadre: Mapped[str | None] = mapped_column(
        String(180),
        nullable=True,
    )

    ministry: Mapped[str | None] = mapped_column(
        String(180),
        nullable=True,
    )

    station: Mapped[str | None] = mapped_column(
        String(180),
        nullable=True,
    )

    tenure: Mapped[str | None] = mapped_column(
        String(180),
        nullable=True,
    )

    status: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    education: Mapped[str | None] = mapped_column(
        String(250),
        nullable=True,
    )

    experience_years: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    preferred_language: Mapped[str] = mapped_column(
        String(60),
        default="English",
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    department: Mapped["Department | None"] = relationship(
        back_populates="employees"
    )

    current_role: Mapped["Role | None"] = relationship(
        foreign_keys=[current_role_id]
    )

    target_role: Mapped["Role | None"] = relationship(
        foreign_keys=[target_role_id]
    )

    skill_states: Mapped[
        list["EmployeeSkill"]
    ] = relationship(
        back_populates="employee",
        cascade="all, delete-orphan",
    )

    evidence: Mapped[
        list["SkillEvidence"]
    ] = relationship(
        back_populates="employee",
        cascade="all, delete-orphan",
    )


# ---------------------------------------------------------------------------
# CALCULATED EMPLOYEE SKILL STATE
# ---------------------------------------------------------------------------

class EmployeeSkill(Base):

    __tablename__ = "employee_skills"

    __table_args__ = (
        UniqueConstraint(
            "employee_id",
            "skill_id",
            name="uq_employee_skill",
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
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey(
            "skills.id",
            ondelete="CASCADE",
        ),
        index=True,
    )

    current_proficiency: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    confidence_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )

    evidence_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    last_evidence_at: Mapped[
        datetime | None
    ] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    employee: Mapped[
        "EmployeeProfile"
    ] = relationship(
        back_populates="skill_states"
    )

    skill: Mapped["Skill"] = relationship()


# ---------------------------------------------------------------------------
# SKILL EVIDENCE
# ---------------------------------------------------------------------------

class SkillEvidence(Base):

    __tablename__ = "skill_evidence"

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
    )

    skill_id: Mapped[int] = mapped_column(
        ForeignKey(
            "skills.id",
            ondelete="CASCADE",
        ),
        index=True,
    )

    # Accepted values:
    #
    # formal_assessment
    # quiz
    # course_completion
    # self_assessment
    # trainer_assessment

    evidence_type: Mapped[str] = mapped_column(
        String(50),
        index=True,
        nullable=False,
    )

    # Every score is normalized to 0-100.

    score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    source: Mapped[str] = mapped_column(
        String(120),
        default="nirdesha",
        nullable=False,
    )

    source_ref: Mapped[str | None] = mapped_column(
        String(180),
        index=True,
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    metadata_json: Mapped[
        dict[str, Any] | None
    ] = mapped_column(
        JSON,
        nullable=True,
    )

    recorded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        index=True,
        nullable=False,
    )

    employee: Mapped[
        "EmployeeProfile"
    ] = relationship(
        back_populates="evidence"
    )

    skill: Mapped["Skill"] = relationship()