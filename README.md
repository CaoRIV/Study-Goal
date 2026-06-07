# Study Goal

Study Goal is a premium university operating system for ambitious students. It helps students plan semesters, track GPA, manage goals, build skills, and visualize their university journey as a long-term master plan.

## Current Features

- Premium SaaS landing page with English/Vietnamese language switching.
- Supabase Auth with email/password and Google OAuth.
- Protected app routes with onboarding and profile setup.
- Dashboard connected to real user data.
- Academic planner for semesters, courses, credits, and grades.
- Goal management with status board and milestones.
- Dynamic roadmap that supports custom study duration from 1 to 8 years.
- Skill Tree for AI/CS and portfolio-ready skill tracking.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn-style UI primitives
- Framer Motion
- Lucide React
- Supabase Auth
- Supabase PostgreSQL with Row Level Security

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Supabase Migrations

Run these SQL files in the Supabase SQL Editor in order:

```txt
supabase/migrations/001_create_profiles.sql
supabase/migrations/002_create_academic_core.sql
supabase/migrations/004_create_goal_milestones.sql
supabase/migrations/005_add_academic_year_target.sql
supabase/migrations/006_create_skills.sql
```

The migrations create user-owned tables and enable Row Level Security so users can only access their own records.

## Important Routes

- `/` - Landing page
- `/login` - Sign in
- `/register` - Create account
- `/onboarding` - First profile setup
- `/dashboard` - Main command center
- `/profile` - Profile and study preferences
- `/grades` - Academic planner
- `/goals` - Goal management
- `/roadmap` - Dynamic academic roadmap
- `/skills` - Skill Tree

## Production Build

```bash
npm run build
npm run start
```

## Current Product Phase

The project is currently moving through Phase 4: Study OS Experience.

Completed foundations:

- Auth foundation
- Academic database core
- Academic planner
- Goal management
- Goal milestones
- Dynamic roadmap
- Skill Tree

Next recommended modules:

- Research workspace
- Club tracker
- Portfolio item system
- Career readiness calculation
- Analytics and AI recommendations

## Notes

- Do not commit `.env.local`, `.next`, or server log files.
- Keep user-owned data scoped by `user_id`.
- Run Supabase migrations before testing new database-backed pages.
- Update `plan.md` when a phase changes so future coding sessions keep the right context.
