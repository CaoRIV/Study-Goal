"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  CircleDashed,
  FileUser,
  Github,
  Globe2,
  Linkedin,
  Loader2,
  MessageSquareText,
  Network,
  Plus,
  Save,
  Send,
  Trash2,
  Trophy,
  type LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { calculateCareerReadiness } from "@/lib/calculations/career";
import { createClient } from "@/lib/supabase/client";

type Readiness = {
  id: string;
  user_id: string;
  resume_status: string;
  linkedin_status: string;
  github_status: string;
  portfolio_status: string;
  interview_practice_count: number;
  networking_contacts_count: number;
  target_role: string | null;
  target_industry: string | null;
  next_review_date: string | null;
  notes: string | null;
};

type CareerTarget = {
  id: string;
  user_id: string;
  company: string;
  role: string;
  stage: string;
  job_url: string | null;
  deadline: string | null;
  notes: string | null;
};

type Copy = {
  score: {
    title: string;
    label: string;
    foundation: string;
    interviews: string;
    networking: string;
    pipeline: string;
    early: string;
    growing: string;
    strong: string;
  };
  profile: {
    title: string;
    description: string;
    resume: string;
    linkedin: string;
    github: string;
    portfolio: string;
    targetRole: string;
    targetRolePlaceholder: string;
    targetIndustry: string;
    targetIndustryPlaceholder: string;
    interviews: string;
    networking: string;
    nextReview: string;
    notes: string;
    notesPlaceholder: string;
    save: string;
    saved: string;
  };
  target: {
    title: string;
    company: string;
    companyPlaceholder: string;
    role: string;
    rolePlaceholder: string;
    stage: string;
    deadline: string;
    url: string;
    urlPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    submit: string;
  };
  pipeline: {
    title: string;
    empty: string;
    deadline: string;
    open: string;
    delete: string;
    confirmDelete: string;
  };
  statuses: Record<string, string>;
  stages: Record<string, string>;
};

const statusOptions = ["not_started", "in_progress", "ready"];
const stageOptions = ["interested", "preparing", "applied", "interviewing", "offer", "rejected", "withdrawn"];
const defaultReadiness = {
  resume_status: "not_started",
  linkedin_status: "not_started",
  github_status: "not_started",
  portfolio_status: "not_started",
  interview_practice_count: 0,
  networking_contacts_count: 0,
  target_role: "",
  target_industry: "",
  next_review_date: "",
  notes: ""
};

export function CareerReadinessManager({
  userId,
  initialReadiness,
  initialTargets,
  copy
}: {
  userId: string;
  initialReadiness: Readiness | null;
  initialTargets: CareerTarget[];
  copy: Copy;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState({
    ...defaultReadiness,
    ...(initialReadiness || {}),
    interview_practice_count: Number(initialReadiness?.interview_practice_count || 0),
    networking_contacts_count: Number(initialReadiness?.networking_contacts_count || 0),
    target_role: initialReadiness?.target_role || "",
    target_industry: initialReadiness?.target_industry || "",
    next_review_date: initialReadiness?.next_review_date || "",
    notes: initialReadiness?.notes || ""
  });
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState("interested");
  const [deadline, setDeadline] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [targetNotes, setTargetNotes] = useState("");
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const score = calculateCareerReadiness(profile, initialTargets);
  const profileReadyCount = [
    profile.resume_status,
    profile.linkedin_status,
    profile.github_status,
    profile.portfolio_status
  ].filter((value) => value === "ready").length;
  const activeApplications = initialTargets.filter((target) =>
    ["applied", "interviewing", "offer"].includes(target.stage)
  ).length;
  const scoreMessage = score >= 75 ? copy.score.strong : score >= 40 ? copy.score.growing : copy.score.early;

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("profile");
    setError("");
    setSuccess("");

    const { error: upsertError } = await supabase.from("career_readiness").upsert(
      {
        user_id: userId,
        resume_status: profile.resume_status,
        linkedin_status: profile.linkedin_status,
        github_status: profile.github_status,
        portfolio_status: profile.portfolio_status,
        interview_practice_count: Math.max(0, Number(profile.interview_practice_count || 0)),
        networking_contacts_count: Math.max(0, Number(profile.networking_contacts_count || 0)),
        target_role: profile.target_role || null,
        target_industry: profile.target_industry || null,
        next_review_date: profile.next_review_date || null,
        notes: profile.notes || null
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      setError(upsertError.message);
    } else {
      setSuccess(copy.profile.saved);
      router.refresh();
    }
    setPending("");
  }

  async function createTarget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("target");
    setError("");
    setSuccess("");

    const { error: insertError } = await supabase.from("career_targets").insert({
      user_id: userId,
      company,
      role,
      stage,
      deadline: deadline || null,
      job_url: jobUrl || null,
      notes: targetNotes || null
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setCompany("");
      setRole("");
      setStage("interested");
      setDeadline("");
      setJobUrl("");
      setTargetNotes("");
      router.refresh();
    }
    setPending("");
  }

  async function updateStage(targetId: string, nextStage: string) {
    setPending(`stage-${targetId}`);
    setError("");
    const { error: updateError } = await supabase
      .from("career_targets")
      .update({ stage: nextStage })
      .eq("id", targetId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
    } else {
      router.refresh();
    }
    setPending("");
  }

  async function deleteTarget(targetId: string) {
    if (!window.confirm(copy.pipeline.confirmDelete)) {
      return;
    }
    setPending(`delete-${targetId}`);
    setError("");
    const { error: deleteError } = await supabase
      .from("career_targets")
      .delete()
      .eq("id", targetId)
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      router.refresh();
    }
    setPending("");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="rounded-[2rem] border border-emerald-300/18 bg-slate-950/68 p-6 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">{copy.score.label}</p>
              <p className="mt-3 font-display text-6xl font-semibold text-white">{score}</p>
              <p className="mt-2 text-sm font-semibold text-emerald-100">{scoreMessage}</p>
            </div>
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/24 bg-emerald-300/10 text-emerald-100">
              <Trophy className="h-7 w-7" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 via-emerald-300 to-amber-200 transition-[width] duration-300" style={{ width: `${score}%` }} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ScoreSignal icon={FileUser} label={copy.score.foundation} value={`${profileReadyCount}/4`} />
          <ScoreSignal icon={MessageSquareText} label={copy.score.interviews} value={`${profile.interview_practice_count}/5`} />
          <ScoreSignal icon={Network} label={copy.score.networking} value={`${profile.networking_contacts_count}/10`} />
          <ScoreSignal icon={Send} label={copy.score.pipeline} value={`${activeApplications}/3`} />
        </div>
      </section>

      {error ? <div role="alert" className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
      {success ? <div role="status" className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">{success}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={saveProfile} className="glass rounded-[2rem] p-6">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-semibold text-white">{copy.profile.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{copy.profile.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatusField icon={FileUser} label={copy.profile.resume} value={profile.resume_status} onChange={(value) => setProfile({ ...profile, resume_status: value })} copy={copy.statuses} />
            <StatusField icon={Linkedin} label={copy.profile.linkedin} value={profile.linkedin_status} onChange={(value) => setProfile({ ...profile, linkedin_status: value })} copy={copy.statuses} />
            <StatusField icon={Github} label={copy.profile.github} value={profile.github_status} onChange={(value) => setProfile({ ...profile, github_status: value })} copy={copy.statuses} />
            <StatusField icon={Globe2} label={copy.profile.portfolio} value={profile.portfolio_status} onChange={(value) => setProfile({ ...profile, portfolio_status: value })} copy={copy.statuses} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={copy.profile.targetRole}>
              <input className="form-input" value={profile.target_role} onChange={(event) => setProfile({ ...profile, target_role: event.target.value })} placeholder={copy.profile.targetRolePlaceholder} />
            </Field>
            <Field label={copy.profile.targetIndustry}>
              <input className="form-input" value={profile.target_industry} onChange={(event) => setProfile({ ...profile, target_industry: event.target.value })} placeholder={copy.profile.targetIndustryPlaceholder} />
            </Field>
            <Field label={copy.profile.interviews}>
              <input className="form-input" min="0" max="10000" type="number" value={profile.interview_practice_count} onChange={(event) => setProfile({ ...profile, interview_practice_count: Number(event.target.value) })} />
            </Field>
            <Field label={copy.profile.networking}>
              <input className="form-input" min="0" max="10000" type="number" value={profile.networking_contacts_count} onChange={(event) => setProfile({ ...profile, networking_contacts_count: Number(event.target.value) })} />
            </Field>
            <Field label={copy.profile.nextReview}>
              <input className="form-input" type="date" value={profile.next_review_date} onChange={(event) => setProfile({ ...profile, next_review_date: event.target.value })} />
            </Field>
          </div>
          <Field label={copy.profile.notes} className="mt-4">
            <textarea className="form-input min-h-28 resize-y py-3" value={profile.notes} onChange={(event) => setProfile({ ...profile, notes: event.target.value })} placeholder={copy.profile.notesPlaceholder} />
          </Field>
          <Button type="submit" className="mt-5 w-full sm:w-auto" disabled={Boolean(pending)}>
            {pending === "profile" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {copy.profile.save}
          </Button>
        </form>

        <form onSubmit={createTarget} className="rounded-[2rem] border border-white/10 bg-slate-950/58 p-6 backdrop-blur-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-100">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-white">{copy.target.title}</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={copy.target.company}>
              <input required className="form-input" value={company} onChange={(event) => setCompany(event.target.value)} placeholder={copy.target.companyPlaceholder} />
            </Field>
            <Field label={copy.target.role}>
              <input required className="form-input" value={role} onChange={(event) => setRole(event.target.value)} placeholder={copy.target.rolePlaceholder} />
            </Field>
            <Field label={copy.target.stage}>
              <select className="form-input" value={stage} onChange={(event) => setStage(event.target.value)}>
                {stageOptions.map((option) => <option key={option} value={option}>{copy.stages[option]}</option>)}
              </select>
            </Field>
            <Field label={copy.target.deadline}>
              <input className="form-input" type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
            </Field>
          </div>
          <Field label={copy.target.url} className="mt-4">
            <input className="form-input" type="url" value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder={copy.target.urlPlaceholder} />
          </Field>
          <Field label={copy.target.notes} className="mt-4">
            <textarea className="form-input min-h-28 resize-y py-3" value={targetNotes} onChange={(event) => setTargetNotes(event.target.value)} placeholder={copy.target.notesPlaceholder} />
          </Field>
          <Button type="submit" className="mt-5 w-full" disabled={Boolean(pending)}>
            {pending === "target" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {copy.target.submit}
          </Button>
        </form>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/54 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <BriefcaseBusiness className="h-5 w-5 text-emerald-200" aria-hidden="true" />
          <h2 className="font-display text-2xl font-semibold text-white">{copy.pipeline.title}</h2>
        </div>
        {initialTargets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/14 bg-white/[0.03] p-8 text-center text-slate-400">{copy.pipeline.empty}</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {initialTargets.map((target) => (
              <article key={target.id} className="rounded-2xl border border-white/10 bg-slate-950/66 p-5 transition-colors hover:border-sky-300/24">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm text-slate-400">
                      <Building2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">{target.company}</span>
                    </p>
                    <h3 className="mt-2 break-words font-display text-xl font-semibold text-white">{target.role}</h3>
                  </div>
                  <button type="button" onClick={() => deleteTarget(target.id)} aria-label={copy.pipeline.delete} className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-400/10 hover:text-red-100">
                    {pending === `delete-${target.id}` ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
                <select
                  className="form-input mt-5"
                  value={target.stage}
                  disabled={pending === `stage-${target.id}`}
                  onChange={(event) => updateStage(target.id, event.target.value)}
                  aria-label={copy.target.stage}
                >
                  {stageOptions.map((option) => <option key={option} value={option}>{copy.stages[option]}</option>)}
                </select>
                <p className="mt-4 text-sm text-slate-400">{copy.pipeline.deadline}: <span className="text-slate-200">{target.deadline || "-"}</span></p>
                {target.notes ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">{target.notes}</p> : null}
                {target.job_url ? (
                  <a href={target.job_url} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-100">
                    {copy.pipeline.open}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ScoreSignal({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <Icon className="h-5 w-5 text-sky-200" aria-hidden="true" />
      <p className="mt-5 text-sm leading-5 text-slate-400">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusField({
  icon: Icon,
  label,
  value,
  onChange,
  copy
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  copy: Record<string, string>;
}) {
  const StatusIcon = value === "ready" ? CheckCircle2 : CircleDashed;
  return (
    <label className="rounded-2xl border border-white/10 bg-slate-950/52 p-4">
      <span className="mb-3 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Icon className="h-4 w-4 text-sky-200" aria-hidden="true" />
          {label}
        </span>
        <StatusIcon className={`h-4 w-4 ${value === "ready" ? "text-emerald-200" : "text-slate-500"}`} aria-hidden="true" />
      </span>
      <select className="form-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {statusOptions.map((option) => <option key={option} value={option}>{copy[option]}</option>)}
      </select>
    </label>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}
