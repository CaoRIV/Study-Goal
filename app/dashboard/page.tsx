import { redirect } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  GraduationCap,
  Target
} from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, university, major, start_year, current_year, target_gpa, career_goal, is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const displayName = profile.full_name || user.email || "Student";

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/12 bg-slate-950/64 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-indigo-400 to-emerald-300 text-slate-950 shadow-glow-blue">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold text-white">Study Goal</p>
              <p className="text-sm text-slate-400">Personal university OS</p>
            </div>
          </a>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/profile">
              Profile
            </a>
            <SignOutButton />
          </div>
        </header>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">Dashboard</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-white">
              Welcome back, {displayName}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Your profile is ready. The next step is connecting real semesters, courses, goals, and grades to this command center.
            </p>
          </div>

          <div className="glass rounded-[2rem] p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileStat label="University" value={profile.university || "Not set"} icon={GraduationCap} />
              <ProfileStat label="Major" value={profile.major || "Not set"} icon={BookOpenCheck} />
              <ProfileStat label="Current year" value={`Year ${profile.current_year || 1}`} icon={CalendarDays} />
              <ProfileStat label="Target GPA" value={String(profile.target_gpa || "Not set")} icon={BarChart3} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <NextModule
            icon={BookOpenCheck}
            title="Academic Planner"
            text="Create semesters, add courses, enter credits, and calculate GPA."
          />
          <NextModule
            icon={Target}
            title="Goal Management"
            text="Turn academic, skill, research, and career ambitions into measurable progress."
          />
          <NextModule
            icon={BrainCircuit}
            title="Skill Tree"
            text="Build your AI, CS, research, and career skill paths with evidence attached."
          />
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">Career goal</p>
          <p className="mt-4 text-lg leading-8 text-slate-200">
            {profile.career_goal || "No career goal yet."}
          </p>
        </section>
      </div>
    </main>
  );
}

function ProfileStat({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof GraduationCap;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/62 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-sky-200" aria-hidden="true" />
      </div>
      <div className="mt-3 font-display text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function NextModule({
  icon: Icon,
  title,
  text
}: {
  icon: typeof GraduationCap;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200 ring-1 ring-sky-200/16">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
