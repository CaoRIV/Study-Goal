# Study Goal Product & Engineering Plan

## 1. Product Direction

Study Goal is a personal operating system for ambitious university students. The app helps users plan, track, and optimize their full university journey across academics, goals, skills, research, clubs, portfolio building, internship preparation, and graduate school readiness.

The product should feel like a premium SaaS platform, not generic student management software. The core promise is:

> Turn Your University Journey Into a Master Plan.

Primary users:

- University students who want strong academic outcomes.
- AI, Computer Science, Data Science, and research-oriented students.
- Students preparing for internships, graduate school, scholarships, or competitive portfolios.

Core user outcomes:

- Track academic progress.
- Plan semesters and credits.
- Manage personal and academic goals.
- Track GPA and grade performance.
- Build skills with visible progress.
- Manage research projects.
- Track club participation and leadership.
- Prepare for internships and graduate school.
- Build a strong university portfolio.

## 2. Current Project State

The project currently has:

- Next.js app using the App Router.
- TypeScript.
- Tailwind CSS.
- shadcn-style button primitive.
- Framer Motion animations.
- Lucide icons.
- Premium SaaS landing page.
- English/Vietnamese language switcher.
- Local language persistence using `localStorage`.
- Supabase client/server utilities.
- Auth middleware for protected routes.
- Login, register, forgot password pages.
- Google OAuth callback route.
- Protected dashboard shell.
- Protected profile page with editable profile form.
- Onboarding page for profile setup.
- `profiles` SQL migration with RLS policies.
- Landing page navigation links to login and registration.

Important existing files:

- `app/page.tsx`
- `app/layout.tsx`
- `app/globals.css`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/forgot-password/page.tsx`
- `app/auth/callback/route.ts`
- `app/onboarding/page.tsx`
- `app/dashboard/page.tsx`
- `app/profile/page.tsx`
- `components/ui/button.tsx`
- `components/auth/auth-form.tsx`
- `components/onboarding/onboarding-form.tsx`
- `components/dashboard/sign-out-button.tsx`
- `components/profile/profile-form.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/env.ts`
- `middleware.ts`
- `supabase/migrations/001_create_profiles.sql`
- `tailwind.config.ts`
- `package.json`

## 3. Recommended Stack

Use this stack unless there is a strong reason to change:

- Frontend: Next.js + TypeScript
- Styling: Tailwind CSS + shadcn/ui style components
- Animation: Framer Motion
- Icons: Lucide React
- Auth: Supabase Auth
- Database: Supabase PostgreSQL
- Authorization: PostgreSQL Row Level Security
- Deployment target: Vercel

## 4. Auth Plan

Use Supabase Auth instead of manually implementing JWT.

Reasoning:

- Supabase Auth supports email/password login.
- Supabase Auth supports Google OAuth.
- Supabase Auth uses JWT-based sessions.
- The access token is automatically attached when using the Supabase client.
- Supabase Auth integrates cleanly with PostgreSQL Row Level Security.
- This reduces security risk and speeds up MVP development.

Required auth routes:

- `/login`
- `/register`
- `/forgot-password`
- `/onboarding`
- `/dashboard`

Auth methods:

- Email/password sign up.
- Email/password sign in.
- Google OAuth sign in.
- Password reset.
- Sign out.

Post-login behavior:

- If user has no profile: redirect to `/onboarding`.
- If user has completed onboarding: redirect to `/dashboard`.

Protected routes:

- `/dashboard`
- `/roadmap`
- `/grades`
- `/goals`
- `/skills`
- `/research`
- `/clubs`
- `/portfolio`
- `/settings`

Implementation notes:

- Use Supabase server/client helpers appropriate for Next.js App Router.
- Keep auth state server-aware where possible.
- Use middleware or server-side checks to protect private routes.
- Do not expose service role keys to the client.
- Keep all user-owned data scoped by `user_id`.

## 5. Database Choice

Use Supabase PostgreSQL.

Why PostgreSQL fits Study Goal:

- The app has relational data: users, semesters, courses, grades, goals, skills, research, clubs, portfolio items.
- GPA, credit completion, analytics, and progress tracking require structured queries.
- Row Level Security can protect user-owned records.
- PostgreSQL is better than document databases for this type of academic planning data.
- Supabase can later support storage, realtime updates, edge functions, and AI features such as `pgvector`.

Do not use MongoDB for the MVP unless product requirements change significantly.

## 6. Database Schema Draft

All user-owned tables should include:

- `id`
- `user_id`
- `created_at`
- `updated_at`

Use UUIDs for primary keys.

### profiles

Stores app-specific user profile data.

Fields:

- `id`
- `user_id`
- `full_name`
- `avatar_url`
- `university`
- `major`
- `start_year`
- `current_year`
- `target_gpa`
- `career_goal`
- `is_onboarded`
- `created_at`
- `updated_at`

### semesters

Stores the student's academic timeline.

Fields:

- `id`
- `user_id`
- `name`
- `year_index`
- `term`
- `start_date`
- `end_date`
- `created_at`
- `updated_at`

Example terms:

- Fall
- Spring
- Summer

### courses

Stores courses and grades.

Fields:

- `id`
- `user_id`
- `semester_id`
- `code`
- `name`
- `credits`
- `target_grade`
- `final_grade`
- `status`
- `created_at`
- `updated_at`

Example statuses:

- planned
- in_progress
- completed
- dropped

### goals

Stores academic, career, skill, and personal goals.

Fields:

- `id`
- `user_id`
- `title`
- `description`
- `category`
- `target_date`
- `progress`
- `status`
- `priority`
- `created_at`
- `updated_at`

Example categories:

- academic
- career
- research
- skill
- club
- portfolio
- personal

Example statuses:

- planned
- in_progress
- completed
- paused

### skills

Stores skill tree data.

Fields:

- `id`
- `user_id`
- `name`
- `category`
- `level`
- `target_level`
- `evidence_url`
- `notes`
- `created_at`
- `updated_at`

Example categories:

- programming
- machine_learning
- deep_learning
- nlp
- computer_vision
- research
- career
- communication

### research_projects

Stores research activity.

Fields:

- `id`
- `user_id`
- `title`
- `advisor`
- `stage`
- `progress`
- `deadline`
- `notes`
- `created_at`
- `updated_at`

Example stages:

- idea
- literature_review
- dataset
- experiment
- writing
- submitted
- published

### clubs

Stores club participation and leadership.

Fields:

- `id`
- `user_id`
- `name`
- `role`
- `start_date`
- `end_date`
- `impact_notes`
- `created_at`
- `updated_at`

### career_preparation

Stores career readiness data.

Fields:

- `id`
- `user_id`
- `resume_status`
- `interview_practice_count`
- `internship_targets`
- `readiness_score`
- `created_at`
- `updated_at`

### portfolio_items

Stores evidence for the student's portfolio.

Fields:

- `id`
- `user_id`
- `title`
- `type`
- `description`
- `url`
- `related_course_id`
- `related_goal_id`
- `related_skill_id`
- `created_at`
- `updated_at`

Example types:

- project
- research
- certificate
- competition
- leadership
- internship
- publication

## 7. Row Level Security Rules

Every user-owned table should enable RLS.

Core policy:

- A user can select only rows where `user_id = auth.uid()`.
- A user can insert only rows where `user_id = auth.uid()`.
- A user can update only rows where `user_id = auth.uid()`.
- A user can delete only rows where `user_id = auth.uid()`.

Important:

- Never rely only on frontend filtering.
- Always enforce ownership in the database.
- Keep service role usage server-only.

## 8. Product Modules

### 8.1 Onboarding

Purpose:

Create the user's first master plan.

User inputs:

- Full name
- University
- Major
- Start year
- Current academic year
- Current GPA
- Target GPA
- Career goal
- Main track: General, AI/CS, Research, Internship, Graduate School

Expected output:

- Create profile.
- Mark onboarding as complete.
- Generate default four-year roadmap.
- Generate initial goals and skills based on selected track.
- Redirect to dashboard.

### 8.2 Dashboard

Purpose:

Give the user a command center for their university journey.

Dashboard should show:

- GPA summary.
- Credit completion.
- Current semester.
- Goal progress.
- Career readiness score.
- Upcoming deadlines.
- Active research projects.
- Skill progress.
- Portfolio strength.

Design direction:

- Dense but elegant SaaS dashboard.
- Avoid generic education UI.
- Prioritize clarity, scanability, and premium visual quality.

### 8.3 Academic Planner

Purpose:

Let users customize semesters, courses, credits, and grades.

Features:

- Create semesters.
- Add/edit/delete courses.
- Move courses between semesters.
- Set target grade.
- Enter final grade.
- Calculate semester GPA.
- Calculate cumulative GPA.
- Track total credits.
- Show graduation progress.

UI components:

- Semester cards.
- Course table.
- GPA simulator.
- Credit progress bar.
- Grade input controls.

### 8.4 Goal Management

Purpose:

Help users turn long-term ambitions into measurable progress.

Features:

- Create goals.
- Categorize goals.
- Set priority.
- Set deadline.
- Update progress.
- Mark as complete.
- Break goals into milestones in a later phase.

UI components:

- Goal cards.
- Status filters.
- Progress bars.
- Priority indicators.
- Optional Kanban board: Planned / In Progress / Completed.

### 8.5 Skill Tree

Purpose:

Visualize student growth like a modern RPG-style skill tree.

Features:

- Create custom skills.
- Select track templates.
- Update skill level.
- Set target level.
- Attach evidence URL.
- Show AI/CS skill tree.

Suggested tracks:

- Programming
- Machine Learning
- Deep Learning
- NLP
- Computer Vision
- Research
- GitHub Portfolio
- Kaggle Projects

### 8.6 Research Workspace

Purpose:

Help research-oriented students manage projects.

Features:

- Create research projects.
- Track advisor.
- Track stage.
- Track progress.
- Track deadline.
- Store notes.
- Link research to portfolio items.

### 8.7 Club Tracker

Purpose:

Help users turn participation and leadership into portfolio evidence.

Features:

- Add clubs.
- Track role.
- Track participation period.
- Record impact notes.
- Link club work to portfolio.

### 8.8 Portfolio

Purpose:

Turn scattered student work into a strong story.

Features:

- Add portfolio items.
- Link to courses, skills, goals, research, clubs.
- Store URLs.
- Categorize achievements.
- Later: generate public portfolio page.

### 8.9 Analytics

Purpose:

Show progress and risks clearly.

Analytics should include:

- GPA growth.
- Credit completion.
- Goal progress.
- Research activity.
- Skill development.
- Career readiness.
- Portfolio strength.

Later AI ideas:

- GPA prediction.
- Weekly recommendations.
- Next best action.
- Graduate school readiness.
- Internship readiness.

## 9. Implementation Phases

### Phase 1: Auth Foundation

Goal:

Turn the landing page into an authenticated SaaS shell.

Tasks:

- Install and configure Supabase.
- Add environment variables.
- Create Supabase client utilities.
- Build `/login`.
- Build `/register`.
- Add Google OAuth.
- Add sign out.
- Protect dashboard routes.
- Create `profiles` table.
- Create onboarding flow.

Exit criteria:

- User can register with email/password.
- User can log in with Google.
- User can log out.
- Unauthenticated users cannot access protected pages.
- New users are sent to onboarding.

### Phase 2: Database Core

Goal:

Add the core academic planning database.

Tasks:

- Create migrations or SQL for core tables.
- Enable RLS.
- Add policies.
- Build CRUD for semesters.
- Build CRUD for courses.
- Build CRUD for goals.
- Connect dashboard to real user data.

Exit criteria:

- User can create and update academic data.
- User can create and update goals.
- User can only access their own records.
- Dashboard no longer relies only on mock data.

### Phase 3: Personalization

Goal:

Allow users to customize their learning path.

Tasks:

- Academic planner UI.
- GPA calculator.
- Credit progress tracking.
- Goal management board.
- User settings page.
- Profile editing.

Exit criteria:

- User can customize semesters, courses, grades, goals, and profile.
- Dashboard reflects user changes.

### Phase 4: Study OS Experience

Goal:

Build the core differentiated experience.

Tasks:

- Four-year roadmap from real data.
- Skill tree from real data.
- Research tracker.
- Club tracker.
- Portfolio item system.
- Career readiness calculation.

Exit criteria:

- User can see an integrated university master plan.
- Academic, skill, research, club, and career data are connected.

### Phase 5: Analytics & AI

Goal:

Make Study Goal feel intelligent and proactive.

Tasks:

- GPA trend analytics.
- Goal progress analytics.
- Career readiness score.
- Portfolio strength score.
- Weekly review.
- AI-generated study plan.
- AI next-best-action recommendations.

Exit criteria:

- User receives actionable insights.
- The system helps users plan instead of only storing data.

## 10. UI/UX Standards

Design style:

- Premium SaaS.
- Deep space background.
- Indigo, blue, purple, and emerald accents.
- Glassmorphism.
- Soft gradients.
- Subtle glow.
- Large typography for marketing pages.
- Dense, focused layout for dashboard pages.

Do:

- Use Lucide icons.
- Use shadcn-style components.
- Keep hover states smooth.
- Keep focus states visible.
- Make mobile layouts usable.
- Keep dashboard interfaces scanable.
- Use real product UI as the main visual.

Avoid:

- Generic student management aesthetics.
- Emoji icons as UI icons.
- Oversized marketing sections inside the app dashboard.
- Decorative cards nested inside decorative cards.
- Unclear CTA labels.
- Data tables without filters or empty states.

## 11. Code Guidelines

General:

- Keep implementation aligned with this file.
- Prefer small, focused components.
- Keep reusable UI in `components/ui`.
- Keep feature components grouped by domain when the app grows.
- Keep user-owned data scoped by `user_id`.
- Validate server-side operations.
- Do not expose secrets to the client.

Recommended future structure:

```txt
app/
  (marketing)/
  (auth)/
    login/
    register/
    forgot-password/
  (app)/
    dashboard/
    onboarding/
    profile/
    roadmap/
    grades/
    goals/
    skills/
    research/
    clubs/
    portfolio/
    settings/
components/
  ui/
  marketing/
  dashboard/
  auth/
  roadmap/
  goals/
  grades/
lib/
  supabase/
  auth/
  db/
  calculations/
```

## 12. Immediate Next Step

The auth foundation code has been added. The next implementation milestone should be:

1. Run `supabase/migrations/001_create_profiles.sql` inside the Supabase SQL Editor.
2. Confirm Google OAuth redirect URL points to `/auth/callback`.
3. Test email/password registration.
4. Test Google login.
5. Complete onboarding with a real user.
6. Confirm `/dashboard` loads after onboarding.
7. Start Phase 2: semesters, courses, goals, and GPA data.
