<p align="center">
  <img src="./public/study-goal-logo.png" alt="Study Goal logo" width="144" />
</p>

<h1 align="center">Study Goal</h1>

<p align="center">
  <strong>A focused operating system for the university journey.</strong>
</p>

<p align="center">
  <a href="./package.json"><img src="https://img.shields.io/badge/version-0.1.0-0e7490?style=flat-square" alt="Version 0.1.0" /></a>
  <a href="./package.json"><img src="https://img.shields.io/badge/Next.js-15.5.19-1f2937?style=flat-square&amp;logo=nextdotjs&amp;logoColor=white" alt="Next.js 15.5.19" /></a>
  <a href="./package.json"><img src="https://img.shields.io/badge/React-19.2.7-087ea4?style=flat-square&amp;logo=react&amp;logoColor=white" alt="React 19.2.7" /></a>
  <a href="./package-lock.json"><img src="https://img.shields.io/badge/TypeScript-5.9.3-3178c6?style=flat-square&amp;logo=typescript&amp;logoColor=white" alt="TypeScript 5.9.3" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Web-0e7490?style=flat-square" alt="Platform: Web" />
  <a href="#production-build"><img src="https://img.shields.io/badge/build-verified-2ea44f?style=flat-square" alt="Build verified" /></a>
  <img src="https://img.shields.io/badge/tests-not_configured-6e7781?style=flat-square" alt="Tests not configured" />
  <img src="https://img.shields.io/badge/license-not_specified-6e7781?style=flat-square" alt="License not specified" />
</p>

<br />

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
- Club participation and leadership tracking.
- Achievement portfolio with linked academic evidence.
- Career readiness score and internship/job opportunity pipeline.
- Smart Insights page with rule-based recommendations.
- Local Ollama weekly AI review through a protected Next.js API route.

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
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

### Optional: Local Ollama AI

Install and run Ollama locally, then pull a model:

```bash
ollama serve
ollama pull qwen2.5:3b
```

The `/insights` page works without Ollama because the rule-based recommendations run inside the app. The Ollama button only powers the generated weekly review.

## Supabase Migrations

Run these SQL files in the Supabase SQL Editor in order:

```txt
supabase/migrations/001_create_profiles.sql
supabase/migrations/002_create_academic_core.sql
supabase/migrations/003_add_graduation_credit_target.sql
supabase/migrations/004_create_goal_milestones.sql
supabase/migrations/005_add_academic_year_target.sql
supabase/migrations/006_create_skills.sql
supabase/migrations/007_create_clubs.sql
supabase/migrations/008_create_portfolio_items.sql
supabase/migrations/009_create_career_readiness.sql
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
- `/clubs` - Club and leadership tracker
- `/portfolio` - Achievement portfolio
- `/career` - Career readiness and opportunity pipeline
- `/insights` - Smart recommendations and local Ollama weekly review

## Production Build

```bash
npm run build
npm run start
```

## Current Product Phase

The core Study OS experience is complete and ready for production deployment.

Completed foundations:

- Auth foundation
- Academic database core
- Academic planner
- Goal management
- Goal milestones
- Dynamic roadmap
- Skill Tree
- Club tracker
- Portfolio item system
- Career readiness and opportunity pipeline
- Smart Insights with local Ollama support

Next recommended modules:

- Research workspace
- Deeper analytics charts
- Optional notification system for deadlines

## Vercel Deployment

Add these environment variables to the Vercel project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Only set `OLLAMA_BASE_URL` on Vercel if you have a reachable hosted Ollama endpoint. A normal Vercel deployment cannot call `localhost` on your laptop.

In Supabase Authentication URL Configuration, add the Vercel production URL as the Site URL and allow:

```txt
https://your-domain.vercel.app/auth/callback
```

Run all migrations through `009_create_career_readiness.sql` before testing the production app.

## Notes

- Do not commit `.env.local`, `.next`, or server log files.
- Keep user-owned data scoped by `user_id`.
- Run Supabase migrations before testing new database-backed pages.
- Update `plan.md` when a phase changes so future coding sessions keep the right context.
