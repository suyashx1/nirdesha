# Competitive Rating System Specification (Deterministic, Elo-Style)

This specification defines a **separate** gamified rating system used for motivation and leaderboard experiences.

## Core Model
- Rating is maintained per skill domain (example: `Python Rating = 1420`).
- Default starting rating for a new skill-domain profile: **1200**.
- Rating updates after each timed assessment attempt in that skill domain.

## Inputs for Rating Update
Each attempt provides:
1. `accuracy_pct` (percentage correct)
2. `time_used_seconds`
3. `total_time_budget_seconds` (fixed budget for the entire assessment, not per-question)

Derived:
- `time_efficiency = max(0, 1 - (time_used_seconds / total_time_budget_seconds))`

## Accuracy Floor (Speed Cannot Mask Wrong Answers)
- If `accuracy_pct < 40`, set performance multiplier to 0 and apply only non-positive/penalty outcomes.
- If `accuracy_pct >= 40`, speed can improve positive deltas, but bounded.
- Speed alone never creates a gain when accuracy is below floor.

## Deterministic Update Function (Simple)
Proposed deterministic update:

```text
accuracy_norm = accuracy_pct / 100
speed_bonus = 0.20 * time_efficiency
performance = accuracy_norm + speed_bonus

if accuracy_pct < 40:
  performance = min(performance, 0.40)

expected = 1 / (1 + 10^((opponent_anchor_rating - current_rating)/400))
K = 24
rating_delta = round(K * (performance - expected))
new_rating = current_rating + rating_delta
```

Implementation note:
- `opponent_anchor_rating` is a deterministic benchmark value for the assessment difficulty tier (for example 1200/1400/1600), not a live opponent.

## Rating Decay (No New Evidence)
Admin-configurable inactivity tiers (default proposal):
- 30+ days no attempt: `-5` every 7 days
- 60+ days no attempt: `-8` every 7 days
- 90+ days no attempt: `-12` every 7 days

Decay rules:
- Apply toward floor `rating_floor = 1000`.
- Never decay below the floor.
- Fully deterministic step function based on whole days since last attempt.

UI explanation requirement:
- Show clear reason text, e.g.:
  - “Your Python rating decayed by 5 points because it has been 45 days since your last Python assessment.”

## Separation from Competency Record (Critical)
- Competitive Rating is a **gamification/motivation** layer for profile cards and leaderboards.
- Skill Confidence Score is the authoritative, auditable competency record for gap analysis and recommendation logic.
- Do **not** feed rating into confidence (or confidence into rating) unless a future explicit design doc defines and approves a mapping.

## Leaderboard Privacy Requirement
Ratings can expose comparative skill ranking for government employees.
- Do not default to a fully public global leaderboard.
- Require product-controlled privacy settings such as opt-in/opt-out and/or department-scoped visibility.
