"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Target, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Goal = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  target_date: string | null;
  progress: number;
  status: string;
  priority: string;
};

type GoalsManagerCopy = {
  summary: {
    tracked: string;
    completed: string;
    averageProgress: string;
  };
  form: {
    title: string;
    titleLabel: string;
    titlePlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    categoryLabel: string;
    priorityLabel: string;
    statusLabel: string;
    progressLabel: string;
    targetDateLabel: string;
    submit: string;
  };
  empty: {
    title: string;
    description: string;
  };
  card: {
    targetDate: string;
    progress: string;
    delete: string;
  };
  labels: {
    categories: Record<string, string>;
    priorities: Record<string, string>;
    statuses: Record<string, string>;
  };
};

const categoryOptions = ["academic", "career", "research", "skill", "club", "portfolio", "personal"];
const priorityOptions = ["low", "medium", "high"];
const statusOptions = ["planned", "in_progress", "completed", "paused"];

export function GoalsManager({
  userId,
  initialGoals,
  copy
}: {
  userId: string;
  initialGoals: Goal[];
  copy: GoalsManagerCopy;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("academic");
  const [targetDate, setTargetDate] = useState("");
  const [progress, setProgress] = useState("0");
  const [status, setStatus] = useState("planned");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const completedGoals = initialGoals.filter((goal) => goal.status === "completed").length;
  const averageProgress = initialGoals.length
    ? Math.round(initialGoals.reduce((total, goal) => total + Number(goal.progress), 0) / initialGoals.length)
    : 0;

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("goals").insert({
      user_id: userId,
      title,
      description: description || null,
      category,
      target_date: targetDate || null,
      progress: Number(progress),
      status,
      priority
    });

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    setTitle("");
    setDescription("");
    setProgress("0");
    setTargetDate("");
    setIsLoading(false);
    router.refresh();
  }

  async function deleteGoal(goalId: string) {
    setError("");
    const { error: deleteError } = await supabase.from("goals").delete().eq("id", goalId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
  }

  async function updateGoalProgress(goalId: string, nextProgress: number) {
    setError("");
    const nextStatus = nextProgress >= 100 ? "completed" : "in_progress";
    const { error: updateError } = await supabase
      .from("goals")
      .update({ progress: nextProgress, status: nextStatus })
      .eq("id", goalId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={copy.summary.tracked} value={String(initialGoals.length)} />
        <SummaryCard label={copy.summary.completed} value={String(completedGoals)} />
        <SummaryCard label={copy.summary.averageProgress} value={`${averageProgress}%`} />
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <form className="glass rounded-[2rem] p-5" onSubmit={createGoal}>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200 ring-1 ring-sky-200/16">
              <Target className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-xl font-semibold text-white">{copy.form.title}</h2>
          </div>
          <div className="space-y-3">
            <Input label={copy.form.titleLabel} value={title} onChange={setTitle} placeholder={copy.form.titlePlaceholder} />
            <label className="block">
              <span className="text-sm font-medium text-slate-200">{copy.form.descriptionLabel}</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
                placeholder={copy.form.descriptionPlaceholder}
              />
            </label>
            <Select label={copy.form.categoryLabel} value={category} onChange={setCategory} options={categoryOptions} labels={copy.labels.categories} />
            <Select label={copy.form.priorityLabel} value={priority} onChange={setPriority} options={priorityOptions} labels={copy.labels.priorities} />
            <Select label={copy.form.statusLabel} value={status} onChange={setStatus} options={statusOptions} labels={copy.labels.statuses} />
            <Input label={copy.form.progressLabel} type="number" value={progress} onChange={setProgress} placeholder="0" />
            <Input label={copy.form.targetDateLabel} type="date" value={targetDate} onChange={setTargetDate} placeholder="" required={false} />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {copy.form.submit}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {initialGoals.length === 0 ? (
            <div className="glass rounded-[2rem] p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-white">{copy.empty.title}</h2>
              <p className="mt-3 text-slate-400">{copy.empty.description}</p>
            </div>
          ) : null}

          {initialGoals.map((goal) => (
            <article key={goal.id} className="glass rounded-[2rem] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-100 ring-1 ring-sky-200/16">{copy.labels.categories[goal.category] || goal.category}</span>
                    <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-200/16">{copy.labels.priorities[goal.priority] || goal.priority}</span>
                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">{copy.labels.statuses[goal.status] || goal.status}</span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-white">{goal.title}</h2>
                  {goal.description ? <p className="mt-3 leading-7 text-slate-400">{goal.description}</p> : null}
                  {goal.target_date ? <p className="mt-3 text-sm text-slate-500">{copy.card.targetDate}: {goal.target_date}</p> : null}
                </div>
                <button type="button" onClick={() => deleteGoal(goal.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-300 transition-colors hover:bg-red-400/10 hover:text-red-100">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  {copy.card.delete}
                </button>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">{copy.card.progress}</span>
                  <span className="text-white">{goal.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(event) => updateGoalProgress(goal.id, Number(event.target.value))}
                  className="w-full cursor-pointer accent-emerald-300"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
        placeholder={placeholder}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <select className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none focus:border-sky-300/50" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{labels[option] || option}</option>
        ))}
      </select>
    </label>
  );
}
