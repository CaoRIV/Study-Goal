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
  academic_year_target: number | null;
  target_gpa: number | null;
  career_goal: string | null;
};

type OnboardingCopy = {
  badge: string;
  title: string;
  description: string;
  signedInAs: string;
  submit: string;
  fields: {
    fullName: string;
    university: string;
    major: string;
    startYear: string;
    currentYear: string;
    academicYearTarget: string;
    targetGpa: string;
    careerGoal: string;
  };
  placeholders: {
    fullName: string;
    university: string;
    major: string;
    startYear: string;
    currentYear: string;
    academicYearTarget: string;
    targetGpa: string;
    careerGoal: string;
  };
};

export function OnboardingForm({
  userId,
  email,
  profile,
  copy
}: {
  userId: string;
  email: string;
  profile: ProfileDraft | null;
  copy: OnboardingCopy;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [university, setUniversity] = useState(profile?.university || "");
  const [major, setMajor] = useState(profile?.major || "");
  const [startYear, setStartYear] = useState(String(profile?.start_year || new Date().getFullYear()));
  const [currentYear, setCurrentYear] = useState(String(profile?.current_year || 1));
  const [academicYearTarget, setAcademicYearTarget] = useState(String(profile?.academic_year_target || 4));
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
        academic_year_target: Number(academicYearTarget),
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
    <main id="main-content" className="neo-onboarding min-h-screen px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-neo-sm border-2 border-neo-ink bg-neo-yellow px-4 py-2 text-sm font-black text-neo-ink shadow-neo-xs">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {copy.badge}
          </div>
          <h1 className="font-display text-5xl font-black leading-[1.02] tracking-[-0.035em] text-neo-ink">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">
            {copy.description}
          </p>
          <p className="mt-6 text-sm text-ink-muted">{copy.signedInAs} {email}</p>
        </div>

        <form className="workspace-form grid gap-4 p-6 sm:grid-cols-2 sm:p-8" onSubmit={handleSubmit}>
          <Field label={copy.fields.fullName} value={fullName} onChange={setFullName} placeholder={copy.placeholders.fullName} />
          <Field label={copy.fields.university} value={university} onChange={setUniversity} placeholder={copy.placeholders.university} />
          <Field label={copy.fields.major} value={major} onChange={setMajor} placeholder={copy.placeholders.major} />
          <Field label={copy.fields.startYear} value={startYear} onChange={setStartYear} type="number" placeholder={copy.placeholders.startYear} />
          <Field label={copy.fields.currentYear} value={currentYear} onChange={setCurrentYear} type="number" placeholder={copy.placeholders.currentYear} />
          <Field label={copy.fields.academicYearTarget} value={academicYearTarget} onChange={setAcademicYearTarget} type="number" min="1" max="8" placeholder={copy.placeholders.academicYearTarget} />
          <Field label={copy.fields.targetGpa} value={targetGpa} onChange={setTargetGpa} type="number" step="0.01" placeholder={copy.placeholders.targetGpa} />

          <label className="block sm:col-span-2">
            <span className="text-sm font-medium text-ink">{copy.fields.careerGoal}</span>
            <textarea
              required
              value={careerGoal}
              onChange={(event) => setCareerGoal(event.target.value)}
              className="form-input mt-2 min-h-32 py-3"
              placeholder={copy.placeholders.careerGoal}
            />
          </label>

          {error ? (
            <div className="rounded-neo border-neo-strong border-neo-ink bg-neo-coral px-4 py-3 text-sm font-semibold text-neo-ink shadow-neo-sm sm:col-span-2">
              {error}
            </div>
          ) : null}

          <Button type="submit" size="lg" className="sm:col-span-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {copy.submit}
          </Button>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  min,
  max
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        required
        type={type}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input mt-2"
        placeholder={placeholder}
      />
    </label>
  );
}
