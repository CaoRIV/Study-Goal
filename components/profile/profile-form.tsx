"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string | null;
  university: string | null;
  major: string | null;
  start_year: number | null;
  current_year: number | null;
  target_gpa: number | null;
  graduation_credit_target: number | null;
  career_goal: string | null;
};

type ProfileFormCopy = {
  active: string;
  fallbackName: string;
  fields: {
    fullName: string;
    university: string;
    major: string;
    startYear: string;
    currentYear: string;
    targetGpa: string;
    graduationCreditTarget: string;
    careerGoal: string;
  };
  placeholders: {
    fullName: string;
    university: string;
    major: string;
    startYear: string;
    currentYear: string;
    targetGpa: string;
    graduationCreditTarget: string;
    careerGoal: string;
  };
  saved: string;
  back: string;
  save: string;
};

export function ProfileForm({
  userId,
  email,
  profile,
  copy
}: {
  userId: string;
  email: string;
  profile: Profile | null;
  copy: ProfileFormCopy;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [university, setUniversity] = useState(profile?.university || "");
  const [major, setMajor] = useState(profile?.major || "");
  const [startYear, setStartYear] = useState(String(profile?.start_year || new Date().getFullYear()));
  const [currentYear, setCurrentYear] = useState(String(profile?.current_year || 1));
  const [targetGpa, setTargetGpa] = useState(String(profile?.target_gpa || "3.80"));
  const [graduationCreditTarget, setGraduationCreditTarget] = useState(String(profile?.graduation_credit_target || 128));
  const [careerGoal, setCareerGoal] = useState(profile?.career_goal || "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    const { error: updateError } = await supabase.from("profiles").upsert(
      {
        user_id: userId,
        full_name: fullName,
        university,
        major,
        start_year: Number(startYear),
        current_year: Number(currentYear),
        target_gpa: Number(targetGpa),
        graduation_credit_target: Number(graduationCreditTarget),
        career_goal: careerGoal,
        is_onboarded: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

    if (updateError) {
      setError(updateError.message);
      setIsLoading(false);
      return;
    }

    setMessage(copy.saved);
    setIsLoading(false);
    router.refresh();
  }

  return (
    <form className="glass rounded-[2rem] p-6 sm:p-8" onSubmit={handleSubmit}>
      <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 via-indigo-400 to-emerald-300 text-slate-950 shadow-glow-blue">
            <UserRound className="h-7 w-7" aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-2xl font-semibold text-white">{fullName || copy.fallbackName}</p>
            <p className="mt-1 text-sm text-slate-400">{email}</p>
          </div>
        </div>
        <div className="rounded-full border border-emerald-300/18 bg-emerald-300/8 px-4 py-2 text-sm font-medium text-emerald-100">
          {copy.active}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.fields.fullName} value={fullName} onChange={setFullName} placeholder={copy.placeholders.fullName} />
        <Field label={copy.fields.university} value={university} onChange={setUniversity} placeholder={copy.placeholders.university} />
        <Field label={copy.fields.major} value={major} onChange={setMajor} placeholder={copy.placeholders.major} />
        <Field label={copy.fields.startYear} value={startYear} onChange={setStartYear} type="number" placeholder={copy.placeholders.startYear} />
        <Field label={copy.fields.currentYear} value={currentYear} onChange={setCurrentYear} type="number" placeholder={copy.placeholders.currentYear} />
        <Field label={copy.fields.targetGpa} value={targetGpa} onChange={setTargetGpa} type="number" step="0.01" placeholder={copy.placeholders.targetGpa} />
        <Field label={copy.fields.graduationCreditTarget} value={graduationCreditTarget} onChange={setGraduationCreditTarget} type="number" placeholder={copy.placeholders.graduationCreditTarget} />

        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-slate-200">{copy.fields.careerGoal}</span>
          <textarea
            required
            value={careerGoal}
            onChange={(event) => setCareerGoal(event.target.value)}
            className="mt-2 min-h-32 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
            placeholder={copy.placeholders.careerGoal}
          />
        </label>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-5 flex gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {message}
        </div>
      ) : null}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="secondary">
          <a href="/dashboard">{copy.back}</a>
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {copy.save}
        </Button>
      </div>
    </form>
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
