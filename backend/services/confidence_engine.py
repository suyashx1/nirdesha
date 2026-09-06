"""
Evidence-Based Skill Confidence Engine
======================================

This engine calculates a skill-confidence score based on the evidence available:

Assessment
Quiz
Course Completion
Self Assessment
Recency
        ↓
Deterministic Formula
        ↓
Skill Confidence
"""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timezone
from statistics import mean
from typing import Iterable

from ..models import SkillEvidence


# ---------------------------------------------------------------------------
# WEIGHTS
# ---------------------------------------------------------------------------

FORMAL_WEIGHT = 0.40
QUIZ_WEIGHT = 0.25
COURSE_WEIGHT = 0.15
RECENCY_WEIGHT = 0.10
SELF_WEIGHT = 0.10


# Avoid displaying a very high confidence score
# when almost no evidence exists.

MIN_EVIDENCE_FOR_UNCAPPED_SCORE = 2
MIN_EVIDENCE_CAP = 40.0


# ---------------------------------------------------------------------------
# BASIC UTILITIES
# ---------------------------------------------------------------------------

def clamp(
    value: float,
    low: float = 0.0,
    high: float = 100.0,
) -> float:

    return max(
        low,
        min(high, value),
    )


def to_utc(
    dt: datetime | None,
) -> datetime | None:

    if dt is None:
        return None

    if dt.tzinfo is None:
        return dt.replace(
            tzinfo=timezone.utc
        )

    return dt.astimezone(
        timezone.utc
    )


# ---------------------------------------------------------------------------
# RECENCY
# ---------------------------------------------------------------------------

def recency_factor(
    last_evidence_at: datetime | None,
    now: datetime | None = None,
) -> float:
    """
    Converts age of latest evidence into
    a 0-100 recency score.

    Recent evidence receives more trust.
    """

    last_evidence_at = to_utc(
        last_evidence_at
    )

    if last_evidence_at is None:
        return 0.0

    now = (
        to_utc(now)
        or datetime.now(timezone.utc)
    )

    days = max(
        0,
        (now - last_evidence_at).days,
    )

    if days <= 30:
        return 100.0

    if days <= 90:
        return 85.0

    if days <= 180:
        return 70.0

    if days <= 365:
        return 50.0

    return 25.0


# ---------------------------------------------------------------------------
# CONFIDENCE → PROFICIENCY
# ---------------------------------------------------------------------------

def proficiency_from_confidence(
    confidence: float,
) -> int:
    """
    Converts the 0-100 confidence score
    into Nirdesha's 0-5 proficiency scale.
    """

    confidence = clamp(
        confidence
    )

    if confidence <= 0:
        return 0

    if confidence < 40:
        return 1

    if confidence < 60:
        return 2

    if confidence < 75:
        return 3

    if confidence < 90:
        return 4

    return 5


# ---------------------------------------------------------------------------
# MAIN CONFIDENCE CALCULATION
# ---------------------------------------------------------------------------

def calculate_confidence(
    evidence: Iterable[SkillEvidence],
) -> dict:
    """
    Calculate an explainable skill-confidence score.

    Formula:

    40% Formal Assessment
    25% Quiz
    15% Course Completion
    10% Recency
    10% Self Assessment
    """

    items = list(evidence)

    grouped: dict[
        str,
        list[float],
    ] = defaultdict(list)

    for item in items:

        grouped[
            item.evidence_type
        ].append(
            clamp(
                float(item.score)
            )
        )

    # Trainer assessment is treated
    # as trusted formal evidence.

    formal_values = (
        grouped["formal_assessment"]
        + grouped["trainer_assessment"]
    )

    quiz_values = grouped[
        "quiz"
    ]

    course_values = grouped[
        "course_completion"
    ]

    self_values = grouped[
        "self_assessment"
    ]

    formal_avg = (
        mean(formal_values)
        if formal_values
        else 0.0
    )

    quiz_avg = (
        mean(quiz_values)
        if quiz_values
        else 0.0
    )

    course_avg = (
        mean(course_values)
        if course_values
        else 0.0
    )

    self_avg = (
        mean(self_values)
        if self_values
        else 0.0
    )

    # Self assessment alone should not make
    # a competency appear recently validated.

    substantive_evidence = [
        item
        for item in items
        if item.evidence_type
        != "self_assessment"
    ]

    recency_source = (
        substantive_evidence
        or items
    )

    latest = max(
        (
            to_utc(item.recorded_at)
            for item in recency_source
            if item.recorded_at
        ),
        default=None,
    )

    recency = recency_factor(
        latest
    )

    raw_confidence = (
        FORMAL_WEIGHT * formal_avg
        + QUIZ_WEIGHT * quiz_avg
        + COURSE_WEIGHT * course_avg
        + RECENCY_WEIGHT * recency
        + SELF_WEIGHT * self_avg
    )

    raw_confidence = clamp(
        raw_confidence
    )

    evidence_count = len(
        items
    )

    limited = (
        evidence_count
        < MIN_EVIDENCE_FOR_UNCAPPED_SCORE
        and raw_confidence
        > MIN_EVIDENCE_CAP
    )

    final_confidence = (
        min(
            raw_confidence,
            MIN_EVIDENCE_CAP,
        )
        if limited
        else raw_confidence
    )

    final_confidence = round(
        clamp(final_confidence),
        2,
    )

    return {

        "formal_assessment_avg":
            round(formal_avg, 2),

        "quiz_avg":
            round(quiz_avg, 2),

        "course_completion_ratio":
            round(course_avg, 2),

        "recency_factor":
            round(recency, 2),

        "self_assessment":
            round(self_avg, 2),

        "raw_confidence":
            round(raw_confidence, 2),

        "final_confidence":
            final_confidence,

        "evidence_count":
            evidence_count,

        "limited_by_minimum_evidence_rule":
            limited,

        "last_evidence_at":
            latest,

        "current_proficiency":
            proficiency_from_confidence(
                final_confidence
            ),
    }