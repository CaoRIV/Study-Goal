"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Loader2, Pencil, Plus, Save, Target, Trash2, X } from "lucide-react";

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
  filters: {
    title: string;
    allStatuses: string;
    allCategories: string;
    allPriorities: string;
    sortLabel: string;
    newest: string;
    priority: string;
    progress: string;
    deadline: string;
    noMatches: string;
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
  actions: {
    edit: string;
    save: string;
    cancel: string;
    confirmDelete: string;
  };
  labels: {
    categories: Record<string, string>;
    priorities: Record<string, string>;
    statuses: Record<string, string>;
  };
};

type GoalDraft = {
  title: string;
  description: string;
  category: string;
  targetDate: string;
  progress: string;
  status: string;
  priority: string;
};

const categoryOptions = ["academic", "career", "research", "skill", "club", "portfolio", "personal"];
const priorityOptions = ["low", "medium", "high"];
const statusOptions = ["planned", "in_progress", "completed", "paused"];
const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };

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
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [editingGoalId, setEditingGoalId] = useState("");
  const [goalDraft, setGoalDraft] = useState<GoalDraft>({
    title: "",
    description: "",
    category: "academic",
    targetDate: "",
    progress: "0",
    status: "planned",
    priority: "medium"
  });
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const completedGoals = initialGoals.filter((goal) => goal.status === "completed").length;
  const averageProgress = initialGoals.length
    ? Math.round(initialGoals.reduce((total, goal) => total + Number(goal.progress), 0) / initialGoals.length)
    : 0;
  const filteredGoals = initialGoals
    .filter((goal) => statusFilter === "all" || goal.status === statusFilter)
    .filter((goal) => categoryFilter === "all" || goal.category === categoryFilter)
    .filter((goal) => priorityFilter === "all" || goal.priority === priorityFilter)
    .sort((first, second) => {
      if (sortBy === "priority") {
        return (priorityWeight[second.priority] || 0) - (priorityWeight[first.priority] || 0);
      }

      if (sortBy === "progress") {
        return Number(second.progress || 0) - Number(first.progress || 0);
      }

      if (sortBy === "deadline") {
        return new Date(first.target_date || "9999-12-31").getTime() - new Date(second.target_date || "9999-12-31").getTime();
      }

      return 0;
    });
  const isBusy = Boolean(pendingAction);

  async function createGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("create-goal");
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
      setPendingAction("");
      return;
    }

    setTitle("");
    setDescription("");
    setProgress("0");
    setTargetDate("");
    setPendingAction("");
    router.refresh();
  }

  function startEditingGoal(goal: Goal) {
    setEditingGoalId(goal.id);
    setGoalDraft({
      title: goal.title,
      description: goal.description || "",
      category: goal.category,
      targetDate: goal.target_date || "",
      progress: String(goal.progress),
      status: goal.status,
      priority: goal.priority
    });
  }

  async function updateGoal(goalId: string) {
    setPendingAction(`goal-${goalId}`);
    setError("");

    const nextProgress = Number(goalDraft.progress);
    const { error: updateError } = await supabase
      .from("goals")
      .update({
        title: goalDraft.title,
        description: goalDraft.description || null,
        category: goalDraft.category,
        target_date: goalDraft.targetDate || null,
        progress: nextProgress,
        status: nextProgress >= 100 ? "completed" : goalDraft.status,
        priority: goalDraft.priority
      })
      .eq("id", goalId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    setEditingGoalId("");
    setPendingAction("");
    router.refresh();
  }

  async function deleteGoal(goalId: string) {
    if (!window.confirm(copy.actions.confirmDelete)) {
      return;
    }

    setPendingAction(`delete-goal-${goalId}`);
    setError("");
    const { error: deleteError } = await supabase.from("goals").delete().eq("id", goalId).eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      setPendingAction("");
      return;
    }

    setPendingAction("");
    router.refresh();
  }

  async function updateGoalProgress(goalId: string, nextProgress: number) {
    setError("");
    const nextStatus = nextProgress >= 100 ? "completed" : "in_progress";
    const { error: updateError } = await supabase
      .from("goals")
      .update({ progress: nextProgress, status: nextStatus })
      .eq("id", goalId)
      .eq("user_id", userId);

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
            <TextArea label={copy.form.descriptionLabel} value={description} onChange={setDescription} placeholder={copy.form.descriptionPlaceholder} />
            <Select label={copy.form.categoryLabel} value={category} onChange={setCategory} options={categoryOptions} labels={copy.labels.categories} />
            <Select label={copy.form.priorityLabel} value={priority} onChange={setPriority} options={priorityOptions} labels={copy.labels.priorities} />
            <Select label={copy.form.statusLabel} value={status} onChange={setStatus} options={statusOptions} labels={copy.labels.statuses} />
            <Input label={copy.form.progressLabel} type="number" min="0" max="100" value={progress} onChange={setProgress} placeholder="0" />
            <Input label={copy.form.targetDateLabel} type="date" value={targetDate} onChange={setTargetDate} placeholder="" required={false} />
            <Button type="submit" className="w-full" disabled={isBusy}>
              {pendingAction === "create-goal" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {copy.form.submit}
            </Button>
          </div>
        </form>

        <div className="space-y-4">
          {initialGoals.length > 0 ? (
            <div className="glass rounded-[2rem] p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-emerald-200 ring-1 ring-white/10">
                  <Filter className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl font-semibold text-white">{copy.filters.title}</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <Select label={copy.form.statusLabel} value={statusFilter} onChange={setStatusFilter} options={["all", ...statusOptions]} labels={{ all: copy.filters.allStatuses, ...copy.labels.statuses }} />
                <Select label={copy.form.categoryLabel} value={categoryFilter} onChange={setCategoryFilter} options={["all", ...categoryOptions]} labels={{ all: copy.filters.allCategories, ...copy.labels.categories }} />
                <Select label={copy.form.priorityLabel} value={priorityFilter} onChange={setPriorityFilter} options={["all", ...priorityOptions]} labels={{ all: copy.filters.allPriorities, ...copy.labels.priorities }} />
                <Select label={copy.filters.sortLabel} value={sortBy} onChange={setSortBy} options={["newest", "priority", "progress", "deadline"]} labels={{ newest: copy.filters.newest, priority: copy.filters.priority, progress: copy.filters.progress, deadline: copy.filters.deadline }} />
              </div>
            </div>
          ) : null}

          {initialGoals.length === 0 ? (
            <div className="glass rounded-[2rem] p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-white">{copy.empty.title}</h2>
              <p className="mt-3 text-slate-400">{copy.empty.description}</p>
            </div>
          ) : null}

          {initialGoals.length > 0 && filteredGoals.length === 0 ? (
            <div className="glass rounded-[2rem] p-8 text-center text-slate-400">{copy.filters.noMatches}</div>
          ) : null}

          {filteredGoals.map((goal) => {
            const isEditingGoal = editingGoalId === goal.id;

            return (
              <article key={goal.id} className="glass rounded-[2rem] p-5">
                {isEditingGoal ? (
                  <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input label={copy.form.titleLabel} value={goalDraft.title} onChange={(value) => setGoalDraft((draft) => ({ ...draft, title: value }))} placeholder={copy.form.titlePlaceholder} />
                      <Input label={copy.form.targetDateLabel} type="date" value={goalDraft.targetDate} onChange={(value) => setGoalDraft((draft) => ({ ...draft, targetDate: value }))} placeholder="" required={false} />
                      <Select label={copy.form.categoryLabel} value={goalDraft.category} onChange={(value) => setGoalDraft((draft) => ({ ...draft, category: value }))} options={categoryOptions} labels={copy.labels.categories} />
                      <Select label={copy.form.priorityLabel} value={goalDraft.priority} onChange={(value) => setGoalDraft((draft) => ({ ...draft, priority: value }))} options={priorityOptions} labels={copy.labels.priorities} />
                      <Select label={copy.form.statusLabel} value={goalDraft.status} onChange={(value) => setGoalDraft((draft) => ({ ...draft, status: value }))} options={statusOptions} labels={copy.labels.statuses} />
                      <Input label={copy.form.progressLabel} type="number" min="0" max="100" value={goalDraft.progress} onChange={(value) => setGoalDraft((draft) => ({ ...draft, progress: value }))} placeholder="0" />
                    </div>
                    <TextArea label={copy.form.descriptionLabel} value={goalDraft.description} onChange={(value) => setGoalDraft((draft) => ({ ...draft, description: value }))} placeholder={copy.form.descriptionPlaceholder} />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setEditingGoalId("")} disabled={isBusy}>
                        <X className="h-4 w-4" aria-hidden="true" />
                        {copy.actions.cancel}
                      </Button>
                      <Button type="button" onClick={() => updateGoal(goal.id)} disabled={isBusy}>
                        <Save className="h-4 w-4" aria-hidden="true" />
                        {copy.actions.save}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
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
                      <div className="flex gap-2">
                        <IconButton label={copy.actions.edit} disabled={isBusy} onClick={() => startEditingGoal(goal)} icon={Pencil} />
                        <IconButton label={copy.card.delete} disabled={isBusy} onClick={() => deleteGoal(goal.id)} icon={Trash2} danger />
                      </div>
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
                  </>
                )}
              </article>
            );
          })}
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
  min,
  max,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  min?: string;
  max?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <input
        required={required}
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
        placeholder={placeholder}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
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
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <select className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-sky-300/50" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{labels[option] || option}</option>
        ))}
      </select>
    </label>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  danger = false
}: {
  label: string;
  icon: typeof Pencil;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50 ${
        danger ? "text-slate-500 hover:bg-red-400/10 hover:text-red-100" : "text-slate-400 hover:bg-white/8 hover:text-white"
      }`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
