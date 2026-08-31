# Database Schema

## Core Entities
- User
- Department
- Role
- Skill
- RoleSkillRequirement
- EmployeeProfile
- EmployeeSkill
- SkillEvidence
- Course
- CourseSkillTag
- LearningPath
- LearningPathStep
- Enrollment
- Quiz
- Question
- AssessmentAttempt
- Progress
- Certificate
- Notification
- AIInteraction
- SkillHistory
- CareerGoal
- AuditLog

## New/Extended Entities for Added Features

### SkillRating
- `id` (PK)
- `user_id` (FK -> User)
- `skill_id` (FK -> Skill)
- `current_rating`
- `last_updated`
- `last_decay_applied_at`

### RatingHistory
- `id` (PK)
- `user_id` (FK -> User)
- `skill_id` (FK -> Skill)
- `rating_at_time`
- `change_reason`
- `recorded_at`

### AssessmentAttempt (Extended Fields)
Add:
- `total_time_budget_seconds`
- `time_used_seconds`
- `accuracy_pct`
- `per_question_time_json` (optional, analytics)

### LearningCard
- `id` (PK)
- `source_document_ref`
- `skill_id` (FK -> Skill)
- `card_text`
- `card_order`
- `audio_overview_ref` (nullable)
- `video_overview_ref` (nullable)

### DailyActivitySnapshot
- `id` (PK)
- `user_id` (FK -> User)
- `date`
- `quizzes_taken`
- `modules_completed`
- `assessments_taken`

Purpose:
- Powers the GitHub-style contribution graph without expensive live aggregation on every page load.
