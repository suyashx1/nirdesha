# Feature Specifications

## 1) Competitive Rating System
**Concept**
- Per-skill-domain Elo-style competitive rating (gamified) based on assessment performance.

**Why it fits Nirdesha**
- Adds motivation and visible progress while preserving deterministic, auditable computation.

**MVP scope**
- Implement rating per skill domain with update + basic decay.
- Add profile-card display and leaderboard-ready data model.
- Cross-reference: `docs/RATING_SYSTEM_SPEC.md`.

**Future scope**
- Difficulty-adaptive anchors and anti-gaming enhancements.

**Open design questions**
- Final K-factor, decay values, and anchor calibration per assessment difficulty.

## 2) NotebookLM-style Cards & Audio/Video Overviews
**Concept**
- AI-generated summary cards from uploaded/assigned material, plus optional short audio/video overviews.

**Why it fits Nirdesha**
- Helps officials quickly revise key points in low-time contexts.

**MVP scope**
- Text-only summary cards (short, swipeable key-point units).

**Future scope**
- TTS-generated audio overview.
- Video overview generation (explicitly post-MVP due to cost/complexity).

**Open design questions**
- Source-grounding and hallucination-control rubric for generated summaries.

## 3) GitHub-style Contribution/Progress Graph
**Concept**
- Calendar heatmap showing daily learning activity similar to GitHub contribution graphs.

**Why it fits Nirdesha**
- Offers intuitive behavior nudges and makes consistency visible.

**MVP scope**
- Visualization over existing `Progress`, `AssessmentAttempt`, and `Enrollment` records.
- Backend uses date-grouped aggregation only; no new behavioral scoring model.

**Future scope**
- Drill-down overlays by skill domain.

**Open design questions**
- Snapshot vs on-demand aggregation default for large departments.

## 4) Fixed-Total-Time Self-Evaluation Assessments
**Concept**
- Timed assessments where total test duration is fixed, but per-question pacing is user-controlled.

**Why it fits Nirdesha**
- Evaluates both correctness and practical execution speed under realistic constraints.

**MVP scope**
- Fixed total timer, auto-submit on time expiry, post-submit scoring.
- Compute `accuracy` and `time-efficiency` (time used vs budget, weighted by attempted questions).
- Feed outputs into:
  - Skill Confidence Score (`formal_assessment_avg` input)
  - Competitive Rating update (see rating spec)
- Trigger AI Mentor plain-language “skill vs target gap” summary post-assessment.

**Future scope**
- Rich per-question pacing analytics and personalized pacing coaching.

**Open design questions**
- Weighting function details for time efficiency under partial completion.

## 5) 3D Skill Visualization
**Concept**
- Three-dimensional skill relationship map for higher-impact presentations.

**Why it fits Nirdesha**
- Improves visual storytelling in demo and stakeholder walkthroughs.

**MVP scope**
- Ship safe baseline with 2D/list mode available as guaranteed fallback.

**Future scope**
- Promote 3D as default only after performance/usability validation.

**Open design questions**
- Exact fallback behavior under low-performance devices and time pressure.

## 6) AI Mentor / “Gemini-like” Explanation While Studying
**Concept**
- Existing AI Mentor + Explanation Center with fast, inline, multi-turn explanations grounded in learner profile and study context.

**Why it fits Nirdesha**
- Improves comprehension and targeted remediation during learning flow.

**MVP scope**
- Context-injected AI mentor with tiered explanations by proficiency.

**Future scope**
- Advanced on-screen context hooks and richer multimodal response options.

**Open design questions**
- Session memory boundaries, citation UX, and review controls for mentor outputs.

Clarification:
- “Gemini-like” means target UX quality/interaction polish only. It does **not** imply dependency on, affiliation with, or partnership with Google Gemini.
