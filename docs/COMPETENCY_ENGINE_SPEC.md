# Competency Engine Specification (Deterministic)

All formulas in this document are deterministic, auditable, and owned by application logic.

## Proficiency Scale (0-5)
- 0 = No evidence
- 1 = Beginner
- 2 = Basic
- 3 = Intermediate
- 4 = Advanced
- 5 = Expert

## Skill Gap Formula
For each required skill:

```text
gap = max(0, required_proficiency - current_proficiency)
```

## Gap Prioritization Formula

```text
priority_score = w1*gap_size + w2*role_criticality + w3*recency_penalty + w4*blocks_target_role
```

- `w1..w4` are admin-configurable weights.
- Higher score means higher urgency for recommendations and learning-path placement.

## Skill Confidence Score (0-100)

```text
confidence = 0.40*formal_assessment_avg
           + 0.25*quiz_avg
           + 0.15*course_completion_ratio
           + 0.10*recency_factor
           + 0.10*self_assessment
```

Rules:
- Clamp final value to `[0,100]`.
- Enforce minimum evidence count before displaying scores above 40.
- Confidence is authoritative for competency state tracking.

## Worked Example (Fictional Persona: Rahul Sharma)
Assume Rahul Sharma’s Python-domain evidence is:
- `formal_assessment_avg = 72`
- `quiz_avg = 64`
- `course_completion_ratio = 80`
- `recency_factor = 70`
- `self_assessment = 60`

Calculation:

```text
confidence = 0.40*72 + 0.25*64 + 0.15*80 + 0.10*70 + 0.10*60
           = 28.8 + 16 + 12 + 7 + 6
           = 69.8
```

Final confidence: **69.8/100** (no clamp adjustment needed).

Gap sample:
- Required proficiency for role: `4` (Advanced)
- Current proficiency: `2` (Basic)

```text
gap = max(0, 4 - 2) = 2
```

This gap then enters `priority_score` along with role criticality, recency penalty, and target-role blocking flag.
