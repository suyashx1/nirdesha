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

### Phase 2 — Core Competency Engine (in progress)
- [ ] Implement Skill/Role/RoleSkillRequirement CRUD
- [ ] Implement skill-gap calculation
- [ ] Implement Skill Confidence Score formula
- [x] Implement resume upload + parsing pipeline with human-review step

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
- [2026-09-02 11:18 UTC] [DONE] Created modern, responsive landing page boilerplate in main.html with dark/light mode, mobile drawer, pricing toggle, and FAQ accordion. — by Antigravity
- [2026-09-02 11:23 UTC] [DONE] Refactored landing page into Indian Government (MoSPI/GIGW) portal style with white canvas, black footer, and separated HTML, CSS (css/style.css), and JS (js/script.js). — by Antigravity
- [2026-09-02 11:27 UTC] [DONE] Implemented Indian regional languages analysis, auto-translation engine, language selection modal, search filter, and first-visit prompt. — by Antigravity
- [2026-09-02 11:30 UTC] [DONE] Fixed language selection options by adding class="notranslate" and translate="no" to keep all language names in their authentic native scripts regardless of active page language. — by Antigravity
- [2026-09-02 11:33 UTC] [DONE] Implemented cyclical rotating notification carousel with in/out transition, pause-on-hover, prev/next controls, and manually updateable OFFICIAL_NOTIFICATIONS registry in js/script.js. — by Antigravity
- [2026-09-02 12:11 UTC] [DONE] Recreated Framer-Motion / Tailwind style dropdown navigation with sliding hover pill (layoutId="hover-bg"), rotating chevrons, and rounded-16px multi-column mega menus across all portal sections. — by Antigravity
- [2026-09-02 12:18 UTC] [DONE] Enhanced Quick Access Services section with larger 16px rounded cards, pill badges, and custom hover animations (oscillating compass needle, jiggling people cadre, folding/opening book, and dancing graph bars). — by Antigravity
- [2026-09-02 12:29 UTC] [DONE] Refactored Quick Access cards with sharp zero-radius geometry, high-contrast black/navy/orange palette, and line-drawing SVG animations: stroke-drawn compass, drawing person with emerging second person, architectural book, and analytical coordinate graph. — by Antigravity
- [2026-09-02 12:33 UTC] [DONE] Fixed Role Mapping and Learning Pathways logos using canonical Lucide Users and BookOpen geometries with normalized pathLength=1 stroke drawing and smooth emerging-person animation. — by Antigravity
- [2026-09-02 12:35 UTC] [DONE] Removed end-animation orange accent dots from Role Mapping, Learning Pathways, and Capacity Analysis logos per design specification. — by Antigravity
- [2026-09-02 12:45 UTC] [DONE] Implemented Theme Mode (Dark, Bright, System default) with hover-activated menu and OS sync. Added dual-phase stopwatch counter animation on load/refresh starting from 1 to targets (18,500+, 450+, 95%, 36). — by Antigravity
- [2026-09-02 12:48 UTC] [DONE] Configured dual-phase stopwatch counter with IntersectionObserver so numbers initialize at 1 and only animate when scrolled into the user's viewport perspective, running once until page reload. — by Antigravity
- [2026-09-02 12:54 UTC] [DONE] Fixed Digital India flag to never shrink (flex-shrink: 0, removed on tight screens leaving text cleanly). Designed and created login.html with Officer Sign In (Parichay SSO, OTP/Password modes, Captcha) and New Officer Registration. — by Antigravity
- [2026-09-02 12:57 UTC] [DONE] Replaced login page footer with full solid black container footer (.footer-gov) including copyright, NIC hosting, GIGW 3.0 policies, and MoSPI ministry details matching main portal. — by Antigravity
- [2026-09-02 13:01 UTC] [DONE] Made Officer Login and Sign Up navbar buttons strictly square (border-radius: 0px) and prominently visible with saffron/navy contrast and sharp shadows. Initialized admin.html blank page and configured admin credentials (admin@gov / admin) routing. — by Antigravity
- [2026-09-02 13:06 UTC] [DONE] Built full administrative dashboard in admin.html with left sticky sidebar (Dashboard, Courses, AI Mentor, Skill Diagnostics, Directory, Profile, Settings, Sign Out), interactive AI Mentor chat copilot, and NSSTA course catalog. — by Antigravity
- [2026-09-02 13:12 UTC] [DONE] Implemented public/public case-insensitive login without captcha requirement routing to public.html. Built officer trainee learning dashboard with GitHub-style 12-week heatmap, competitive per-domain Elo skill ratings, 2D skill radar, NotebookLM revision cards, 5-minute timed assessment quiz modal, and Nirdesha verified certificate preview. — by Antigravity
- [2026-09-02 19:15 UTC] [DONE] Refactored all Officer terminology to User across admin and public portals. Implemented interactive editable profiles with avatar upload persistence, Admin Inspect & Access Control modal, topbar dynamic search, clickable table header sorting, and PDF Document Drop AI Extraction pipeline with shimmering loading state. — by Antigravity

## Open Questions / Decisions Needed
- Final call on 3D vs 2D as the DEFAULT skill graph view for the SIH demo (2D is the
  safe fallback; see docs/ARCHITECTURE.md).
- Leaderboard visibility default (public / department-only / opt-in) — needs a product
  decision before Phase 3 implementation.
- Which LLM API to use — needs credentials/provider decision before Phase 4.
