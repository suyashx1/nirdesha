# Architecture

Nirdesha follows a layered architecture that keeps AI assistive and all core competency/rating logic deterministic and auditable.

## 1) AI/LLM Layer (Probabilistic, Assistive)
Responsibilities:
- Resume parsing
- MCQ/quiz generation
- Conversational mentor support
- Concept explanations
- Content summarization for cards and audio/video overviews

Constraint:
- This layer never directly writes authoritative competency/rating records.

## 2) Deterministic Engine Layer (Owned Application Logic)
Responsibilities:
- Skill taxonomy
- Role-skill requirements
- Gap calculation
- Skill Confidence Score calculation
- Competitive Rating updates and decay
- Recommendation ranking
- Learning-path sequencing
- GitHub-style contribution/progress tracking
- Notifications
- RBAC
- Audit logs

## 3) Integration Layer
Responsibilities:
- `mock_igot_service` adapter
- `mock_nssta_service` adapter
- Swappable interfaces so real clients can be introduced later behind the same contracts

## Request/Response Flow (ASCII)

```text
User / Admin / Mentor UI
          |
          v
+------------------------------+
|  AI/LLM Layer (Assistive)    |
|  - parse/explain/generate    |
+------------------------------+
          |
          v
+------------------------------+
| Deterministic Engine Layer   |
| - gaps, confidence, rating,  |
|   ranking, paths, audit      |
+------------------------------+
          |
          v
+------------------------------+
| Integration Layer            |
| - mock_igot_service          |
| - mock_nssta_service         |
+------------------------------+
          |
          v
External Systems (future, optional)
```

## Skill Graph Decision Log: 3D vs 2D
- Original scope: 2D skill graph (React Flow) for build speed, clarity, and lower implementation risk.
- Product decision override: prioritize a 3D skill visualization for stronger demo visual impact.
- Risk statement: 3D is higher engineering/time risk and may reduce delivery certainty in hackathon timelines.
- Recommendation: implement with Three.js and keep a documented 2D fallback path.
- Delivery guardrail: require a user-visible toggle for both **“3D mode”** and **“simple 2D/list mode”** so the feature degrades gracefully if 3D is incomplete or too slow to stabilize.
