"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ProfileDraft = {
  full_name: string | null;
  university: string | null;
  major: string | null;
  start_year: number | null;
  current_year: number | null;
  target_gpa: number | null;
  career_goal: string | null;
};

export function OnboardingForm({
  userId,
  email,
  profile
}: {
  userId: string;
  email: string;
  profile: ProfileDraft | null;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [university, setUniversity] = useState(profile?.university || "");
  const [major, setMajor] = useState(profile?.major || "");
  const [startYear, setStartYear] = useState(String(profile?.start_year || new Date().getFullYear()));
  const [currentYear, setCurrentYear] = useState(String(profile?.current_year || 1));
  const [targetGpa, setTargetGpa] = useState(String(profile?.target_gpa || "3.80"));
  const [careerGoal, setCareerGoal] = useState(profile?.career_goal || "");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const supabase = createClient();
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        full_name: fullName,
        university,
        major,
        start_year: Number(startYear),
        current_year: Number(currentYear),
        target_gpa: Number(targetGpa),
        career_goal: careerGoal,
        is_onboarded: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      setError(upsertError.message);
      setIsLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/8 px-4 py-2 text-sm font-medium text-emerald-100 shadow-glow-emerald">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Your first master plan
          </div>
          <h1 className="font-display text-5xl font-semibold leading-tight text-white">
            Set up your university operating system.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
            This creates your profile so Study Goal can personalize your dashboard, GPA targets, and roadmap.
          </p>
          <p className="mt-6 text-sm text-slate-500">Signed in as {email}</p>
        </div>

        <form className="glass grid gap-4 rounded-[2rem] p-6 sm:grid-cols-2 sm:p-8" onSubmit={handleSubmit}>
          <Field label="Full name" value={fullName} onChange={setFullName} placeholder="Maya Tran" />
          <Field label="University" value={university} onChange={setUniversity} placeholder="National University" />
          <Field label="Major" value={major} onChange={setMajor} placeholder="Computer Science" />
          <Field label="Start year" value={startYear} onChange={setStartYear} type="number" placeholder="2026" />
          <Field label="Current year" value={currentYear} onChange={setCurrentYear} type="number" placeholder="1" />
          <Field label="Target GPA" value={targetGpa} onChange={setTargetGpa} type="number" step="0.01" placeholder="3.80" />

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-slate-200">Career goal</span>
            <textarea
              required
              value={careerGoal}
              onChange={(event) => setCareerGoal(event.target.value)}
              className="mt-2 min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
              placeholder="Become an AI engineer, publish research, and land a strong internship."
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100 sm:col-span-2">
              {error}
            </div>
          ) : null}

          <Button type="submit" size="lg" className="sm:col-span-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Continue to dashboard
          </Button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        required
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
        placeholder={placeholder}
      />
    </label>
  );
}
