# Nirdesha Copilot Instructions

Before making any code changes in this repository, every AI agent must follow these rules:

1. Read `AI_MEMORY.md` **FIRST** to understand what is done, in progress, and next.
2. Read `docs/ARCHITECTURE.md` and `docs/DO_NOT_CLAIM.md` before touching anything related to iGOT, NSSTA, certificates, AI-driven scoring, or the rating system.
3. **Never** implement a real authenticated call to an “iGOT API” or “NSSTA API”. No public third-party API exists for either (see `docs/PROJECT_CONTEXT.md`). All iGOT/NSSTA data access must go through `services/mock_igot_service` and `services/mock_nssta_service`, clearly labeled as **MOCK/PROTOTYPE** in code comments, logs, and UI badges.
4. **Never** claim or implement a feature that issues an “iGOT certificate.” Only issue a platform-branded **Nirdesha Achievement Certificate**.
5. Keep **Skill Confidence Score** (evidence-weighted, 0-100; defined in `docs/COMPETENCY_ENGINE_SPEC.md`) and **Competitive Rating** (Elo-style; defined in `docs/RATING_SYSTEM_SPEC.md`) as two separate fields/tables. Do not merge formulas or allow one to silently override the other.
6. After completing **any** task, append one entry to `AI_MEMORY.md` under `## Activity Log` using this exact format before ending the session:
   `- [YYYY-MM-DD HH:MM UTC] [DONE] <short description of what was completed> — by <AI/agent name>`
   Then update the corresponding `## Checklist` item from `[ ]` to `[x]`. If partial, use `[~]` and include a one-line remainder note.
7. Never mark a checklist item done unless it is genuinely functional and, where applicable, has at least a basic test.
8. If implementing a new feature not already listed in `AI_MEMORY.md`, add it as a new checklist item first, then implement, then check it off.
