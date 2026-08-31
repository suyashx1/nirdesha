# Nirdesha — AI Project Memory

> Read this file FIRST in every session. This is the single source of truth for what
> has been built, what is in progress, and what is next. Every AI/agent working in
> this repo must update this file after completing any task, however small.

## How to update this file
1. Add/check off items in the Checklist below ([ ] → [x] when done, [~] when partial).
2. Append one line per completed task to the Activity Log, newest at the bottom, in
   the format:
   `- [YYYY-MM-DD HH:MM UTC] [DONE] <description> — by <agent name>`
3. If you discover a new required task mid-work, add it to the Checklist before
   starting it, not after.
4. Never delete history from the Activity Log. If something is reverted, add a new
   line noting the reversal — do not erase the original entry.

## Current Phase
Phase 0 — Repository scaffolding (docs + memory system). No application code written yet.

## Checklist

### Phase 0 — Scaffolding
- [x] Create docs/PROJECT_CONTEXT.md
- [x] Create docs/ARCHITECTURE.md
- [x] Create docs/COMPETENCY_ENGINE_SPEC.md
- [x] Create docs/RATING_SYSTEM_SPEC.md
- [x] Create docs/FEATURE_SPECS.md
- [x] Create docs/DATABASE_SCHEMA.md
- [x] Create docs/DO_NOT_CLAIM.md
- [x] Create docs/MVP_SCOPE.md
- [x] Create .github/copilot-instructions.md
- [x] Create this AI_MEMORY.md file

### Phase 1 — Foundations (not started)
- [ ] Initialize backend project structure (FastAPI)
- [ ] Initialize frontend project structure (React)
- [ ] Set up PostgreSQL schema migrations from docs/DATABASE_SCHEMA.md
- [ ] Implement auth (JWT) + RBAC middleware

### Phase 2 — Core Competency Engine (not started)
- [ ] Implement Skill/Role/RoleSkillRequirement CRUD
- [ ] Implement skill-gap calculation
- [ ] Implement Skill Confidence Score formula
- [ ] Implement resume upload + parsing pipeline with human-review step

### Phase 3 — New Gamification Features (not started)
- [ ] Implement SkillRating table + Elo-style update formula
- [ ] Implement rating decay job
- [ ] Implement fixed-total-time assessment engine
- [ ] Implement GitHub-style contribution heatmap
- [ ] Implement leaderboard with department-scope/opt-out setting

### Phase 4 — AI Layer (not started)
- [ ] Implement MCQ/quiz generator with source-grounding checks
- [ ] Implement AI Mentor (context-injected chat)
- [ ] Implement AI Explanation Center (tiered explanations)
- [ ] Implement NotebookLM-style summary card generation

### Phase 5 — Visualization (not started)
- [ ] Implement 2D skill graph (baseline, required)
- [ ] Implement 3D skill graph (stretch goal, with 2D fallback toggle)

### Phase 6 — Integration Layer (not started)
- [ ] Build mock iGOT service (clearly labelled)
- [ ] Build mock NSSTA service (clearly labelled)
- [ ] Build recommendation engine

### Phase 7 — Demo Readiness (not started)
- [ ] Seed demo data (fictional "Rahul Sharma" persona)
- [ ] Rehearse and de-risk full demo flow
- [ ] Prepare fallback/cached responses for AI-dependent demo steps

## Activity Log
- [2026-08-31 09:49 UTC] [DONE] Repository scaffolded: all docs/, .github/copilot-instructions.md, and this AI_MEMORY.md file created. No application code yet. — by Copilot (jumpstart)

## Open Questions / Decisions Needed
- Final call on 3D vs 2D as the DEFAULT skill graph view for the SIH demo (2D is the
  safe fallback; see docs/ARCHITECTURE.md).
- Leaderboard visibility default (public / department-only / opt-in) — needs a product
  decision before Phase 3 implementation.
- Which LLM API to use — needs credentials/provider decision before Phase 4.
