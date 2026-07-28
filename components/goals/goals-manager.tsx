"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Filter,
  Flag,
  Loader2,
  Pencil,
  Plus,
  Save,
  Target,
  Trash2,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
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

type Milestone = {
  id: string;
  user_id: string;
  goal_id: string;
  title: string;
  notes: string | null;
  due_date: string | null;
  status: string;
  sort_order: number;
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
  board: {
    title: string;
    emptyColumn: string;
    moveTo: string;
  };
  milestones: {
    title: string;
    add: string;
    placeholder: string;
    empty: string;
    next: string;
    dueDate: string;
    todo: string;
    inProgress: string;
    completed: string;
    confirmDelete: string;
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
const milestoneStatusOptions = ["todo", "in_progress", "completed"];
const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };

export function GoalsManager({
  userId,
  initialGoals,
  initialMilestones,
  copy
}: {
  userId: string;
  initialGoals: Goal[];
  initialMilestones: Milestone[];
  copy: GoalsManagerCopy;
}) {
  const confirmDelete = useConfirmDialog();
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
  const [milestoneTitles, setMilestoneTitles] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const milestonesByGoal = useMemo(() => {
    return initialMilestones.reduce<Record<string, Milestone[]>>((groups, milestone) => {
      const current = groups[milestone.goal_id] || [];
      groups[milestone.goal_id] = [...current, milestone].sort((first, second) => {
        if (first.status === second.status) {
          return first.sort_order - second.sort_order;
        }

        return milestoneStatusOptions.indexOf(first.status) - milestoneStatusOptions.indexOf(second.status);
      });
      return groups;
    }, {});
  }, [initialMilestones]);

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

  async function moveGoal(goalId: string, nextStatus: string) {
    setPendingAction(`move-goal-${goalId}`);
    setError("");

    const payload =
      nextStatus === "completed"
        ? { status: nextStatus, progress: 100 }
        : { status: nextStatus };

    const { error: updateError } = await supabase
      .from("goals")
      .update(payload)
      .eq("id", goalId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    setPendingAction("");
    router.refresh();
  }

  async function deleteGoal(goalId: string) {
    if (!(await confirmDelete({ description: copy.actions.confirmDelete }))) {
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

  async function createMilestone(goalId: string) {
    const milestoneTitle = (milestoneTitles[goalId] || "").trim();

    if (!milestoneTitle) {
      return;
    }

    setPendingAction(`create-milestone-${goalId}`);
    setError("");

    const { error: insertError } = await supabase.from("goal_milestones").insert({
      user_id: userId,
      goal_id: goalId,
      title: milestoneTitle,
      status: "todo",
      sort_order: (milestonesByGoal[goalId]?.length || 0) + 1
    });

    if (insertError) {
      setError(insertError.message);
      setPendingAction("");
      return;
    }

    setMilestoneTitles((current) => ({ ...current, [goalId]: "" }));
    setPendingAction("");
    router.refresh();
  }

  async function updateMilestoneStatus(goalId: string, milestoneId: string, nextStatus: string) {
    setPendingAction(`milestone-${milestoneId}`);
    setError("");

    const { error: updateError } = await supabase
      .from("goal_milestones")
      .update({ status: nextStatus })
      .eq("id", milestoneId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    await syncGoalProgress(goalId, milestoneId, nextStatus);
    setPendingAction("");
    router.refresh();
  }

  async function deleteMilestone(goalId: string, milestoneId: string) {
    if (!(await confirmDelete({ description: copy.milestones.confirmDelete }))) {
      return;
    }

    setPendingAction(`delete-milestone-${milestoneId}`);
    setError("");

    const { error: deleteError } = await supabase
      .from("goal_milestones")
      .delete()
      .eq("id", milestoneId)
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      setPendingAction("");
      return;
    }

    await syncGoalProgress(goalId, milestoneId, "deleted");
    setPendingAction("");
    router.refresh();
  }

  async function syncGoalProgress(goalId: string, milestoneId: string, nextStatus: string) {
    const currentMilestones = milestonesByGoal[goalId] || [];
    const nextMilestones = currentMilestones
      .map((milestone) => milestone.id === milestoneId ? { ...milestone, status: nextStatus } : milestone)
      .filter((milestone) => milestone.status !== "deleted");

    if (nextMilestones.length === 0) {
      return;
    }

    const completedCount = nextMilestones.filter((milestone) => milestone.status === "completed").length;
    const nextProgress = Math.round((completedCount / nextMilestones.length) * 100);
    const nextGoalStatus = nextProgress >= 100 ? "completed" : nextProgress > 0 ? "in_progress" : "planned";

    await supabase
      .from("goals")
      .update({ progress: nextProgress, status: nextGoalStatus })
      .eq("id", goalId)
      .eq("user_id", userId);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={copy.summary.tracked} value={String(initialGoals.length)} />
        <SummaryCard label={copy.summary.completed} value={String(completedGoals)} />
        <SummaryCard label={copy.summary.averageProgress} value={`${averageProgress}%`} />
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-signal-red">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <form className="workspace-form p-5" onSubmit={createGoal}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700/8 text-signal-cyan ring-1 ring-cyan-700/12">
                <Target className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-ink">{copy.form.title}</h2>
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

          {initialGoals.length > 0 ? (
            <div className="workspace-panel p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-700/8 text-signal-cyan ring-1 ring-cyan-700/12">
                  <Filter className="h-4 w-4" aria-hidden="true" />
                </div>
                <h2 className="font-display text-xl font-semibold text-ink">{copy.filters.title}</h2>
              </div>
              <div className="space-y-3">
                <Select label={copy.form.statusLabel} value={statusFilter} onChange={setStatusFilter} options={["all", ...statusOptions]} labels={{ all: copy.filters.allStatuses, ...copy.labels.statuses }} />
                <Select label={copy.form.categoryLabel} value={categoryFilter} onChange={setCategoryFilter} options={["all", ...categoryOptions]} labels={{ all: copy.filters.allCategories, ...copy.labels.categories }} />
                <Select label={copy.form.priorityLabel} value={priorityFilter} onChange={setPriorityFilter} options={["all", ...priorityOptions]} labels={{ all: copy.filters.allPriorities, ...copy.labels.priorities }} />
                <Select label={copy.filters.sortLabel} value={sortBy} onChange={setSortBy} options={["newest", "priority", "progress", "deadline"]} labels={{ newest: copy.filters.newest, priority: copy.filters.priority, progress: copy.filters.progress, deadline: copy.filters.deadline }} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-700/8 text-signal-cyan ring-1 ring-cyan-700/12">
              <Flag className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-ink">{copy.board.title}</h2>
          </div>

          {initialGoals.length === 0 ? (
            <div className="workspace-empty p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-ink">{copy.empty.title}</h2>
              <p className="mt-3 text-ink-muted">{copy.empty.description}</p>
            </div>
          ) : null}

          {initialGoals.length > 0 && filteredGoals.length === 0 ? (
            <div className="workspace-empty p-8 text-center text-ink-muted">{copy.filters.noMatches}</div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
            {statusOptions.map((columnStatus) => {
              const goals = filteredGoals.filter((goal) => goal.status === columnStatus);

              return (
                <section key={columnStatus} className="min-h-[280px] rounded-2xl border border-outline bg-slate-50/80 p-4 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <h3 className="text-base font-semibold text-ink">{copy.labels.statuses[columnStatus]}</h3>
                    <span className="rounded-full bg-surface-panel/90 px-2.5 py-1 text-xs font-semibold text-ink-muted ring-1 ring-outline">{goals.length}</span>
                  </div>
                  <div className="space-y-3">
                    {goals.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-outline bg-surface-panel/90 p-4 text-sm text-ink-muted">{copy.board.emptyColumn}</p>
                    ) : null}
                    {goals.map((goal) => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        milestones={milestonesByGoal[goal.id] || []}
                        milestoneTitle={milestoneTitles[goal.id] || ""}
                        setMilestoneTitle={(value) => setMilestoneTitles((current) => ({ ...current, [goal.id]: value }))}
                        copy={copy}
                        isBusy={isBusy}
                        isEditing={editingGoalId === goal.id}
                        draft={goalDraft}
                        setDraft={setGoalDraft}
                        onEdit={() => startEditingGoal(goal)}
                        onSave={() => updateGoal(goal.id)}
                        onCancel={() => setEditingGoalId("")}
                        onDelete={() => deleteGoal(goal.id)}
                        onProgressChange={(value) => updateGoalProgress(goal.id, value)}
                        onMove={(nextStatus) => moveGoal(goal.id, nextStatus)}
                        onCreateMilestone={() => createMilestone(goal.id)}
                        onMilestoneStatus={(milestoneId, nextStatus) => updateMilestoneStatus(goal.id, milestoneId, nextStatus)}
                        onDeleteMilestone={(milestoneId) => deleteMilestone(goal.id, milestoneId)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function GoalCard({
  goal,
  milestones,
  milestoneTitle,
  setMilestoneTitle,
  copy,
  isBusy,
  isEditing,
  draft,
  setDraft,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onProgressChange,
  onMove,
  onCreateMilestone,
  onMilestoneStatus,
  onDeleteMilestone
}: {
  goal: Goal;
  milestones: Milestone[];
  milestoneTitle: string;
  setMilestoneTitle: (value: string) => void;
  copy: GoalsManagerCopy;
  isBusy: boolean;
  isEditing: boolean;
  draft: GoalDraft;
  setDraft: (updater: (draft: GoalDraft) => GoalDraft) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onProgressChange: (value: number) => void;
  onMove: (status: string) => void;
  onCreateMilestone: () => void;
  onMilestoneStatus: (milestoneId: string, status: string) => void;
  onDeleteMilestone: (milestoneId: string) => void;
}) {
  const nextMilestone = milestones.find((milestone) => milestone.status !== "completed");

  return (
                  <article className="workspace-card p-4">
      {isEditing ? (
        <div className="space-y-3">
          <Input label={copy.form.titleLabel} value={draft.title} onChange={(value) => setDraft((current) => ({ ...current, title: value }))} placeholder={copy.form.titlePlaceholder} />
          <Input label={copy.form.targetDateLabel} type="date" value={draft.targetDate} onChange={(value) => setDraft((current) => ({ ...current, targetDate: value }))} placeholder="" required={false} />
          <Select label={copy.form.categoryLabel} value={draft.category} onChange={(value) => setDraft((current) => ({ ...current, category: value }))} options={categoryOptions} labels={copy.labels.categories} />
          <Select label={copy.form.priorityLabel} value={draft.priority} onChange={(value) => setDraft((current) => ({ ...current, priority: value }))} options={priorityOptions} labels={copy.labels.priorities} />
          <Select label={copy.form.statusLabel} value={draft.status} onChange={(value) => setDraft((current) => ({ ...current, status: value }))} options={statusOptions} labels={copy.labels.statuses} />
          <Input label={copy.form.progressLabel} type="number" min="0" max="100" value={draft.progress} onChange={(value) => setDraft((current) => ({ ...current, progress: value }))} placeholder="0" />
          <TextArea label={copy.form.descriptionLabel} value={draft.description} onChange={(value) => setDraft((current) => ({ ...current, description: value }))} placeholder={copy.form.descriptionPlaceholder} />
          <div className="flex gap-2">
            <IconButton label={copy.actions.save} disabled={isBusy} onClick={onSave} icon={Save} />
            <IconButton label={copy.actions.cancel} disabled={isBusy} onClick={onCancel} icon={X} />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold leading-6 text-ink">{goal.title}</h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-cyan-700/8 px-2.5 py-1 text-[11px] font-semibold text-signal-cyan ring-1 ring-cyan-700/12">{copy.labels.categories[goal.category] || goal.category}</span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-ink-muted ring-1 ring-outline">{copy.labels.priorities[goal.priority] || goal.priority}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <IconButton label={copy.actions.edit} disabled={isBusy} onClick={onEdit} icon={Pencil} />
              <IconButton label={copy.card.delete} disabled={isBusy} onClick={onDelete} icon={Trash2} danger />
            </div>
          </div>

          {goal.description ? <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-muted">{goal.description}</p> : null}
          {goal.target_date ? <p className="mt-3 text-xs text-ink-muted">{copy.card.targetDate}: {goal.target_date}</p> : null}

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_150px] sm:items-end">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-ink-muted">{copy.card.progress}</span>
                <span className="text-ink">{goal.progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={goal.progress}
                onChange={(event) => onProgressChange(Number(event.target.value))}
                className="neo-range w-full cursor-pointer"
              />
            </div>

            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">{copy.board.moveTo}</span>
              <select className="mt-2 h-10 w-full rounded-xl border border-outline bg-surface-panel/90 px-3 text-sm text-ink outline-none focus:border-cyan-500/50" value={goal.status} onChange={(event) => onMove(event.target.value)} disabled={isBusy}>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{copy.labels.statuses[status]}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 workspace-card-muted p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-ink">{copy.milestones.title}</h4>
              <span className="text-xs text-ink-muted">{milestones.filter((milestone) => milestone.status === "completed").length}/{milestones.length}</span>
            </div>
            {nextMilestone ? (
              <p className="mb-3 rounded-xl bg-cyan-700/8 px-3 py-2 text-xs leading-5 text-signal-cyan ring-1 ring-cyan-700/12">
                {copy.milestones.next}: {nextMilestone.title}
              </p>
            ) : null}
            <div className="space-y-2">
              {milestones.length === 0 ? <p className="text-sm text-ink-muted">{copy.milestones.empty}</p> : null}
              {milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-start gap-2 rounded-xl border border-outline bg-surface-panel/90 p-3">
                  <Button
                    type="button"
                    variant={milestone.status === "completed" ? "success" : "outline"}
                    size="icon-sm"
                    className="mt-0.5"
                    onClick={() => onMilestoneStatus(milestone.id, milestone.status === "completed" ? "todo" : "completed")}
                    disabled={isBusy}
                    aria-label={copy.milestones.completed}
                  >
                    {milestone.status === "completed" ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  </Button>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${milestone.status === "completed" ? "text-ink-muted line-through" : "text-ink"}`}>{milestone.title}</p>
                    <select className="mt-2 h-8 rounded-xl border border-outline bg-surface-panel/90 px-2 text-xs text-ink-muted outline-none focus:border-cyan-500/50" value={milestone.status} onChange={(event) => onMilestoneStatus(milestone.id, event.target.value)} disabled={isBusy}>
                      <option value="todo">{copy.milestones.todo}</option>
                      <option value="in_progress">{copy.milestones.inProgress}</option>
                      <option value="completed">{copy.milestones.completed}</option>
                    </select>
                  </div>
                  <IconButton label={copy.card.delete} disabled={isBusy} onClick={() => onDeleteMilestone(milestone.id)} icon={Trash2} danger />
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={milestoneTitle}
                onChange={(event) => setMilestoneTitle(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-xl border border-outline bg-surface-panel/90 px-3 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-cyan-500/50"
                placeholder={copy.milestones.placeholder}
              />
              <Button type="button" size="icon-sm" onClick={onCreateMilestone} disabled={isBusy || !milestoneTitle.trim()} className="h-10 w-10" aria-label={copy.milestones.add} title={copy.milestones.add}>
                <Plus className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="workspace-card p-5">
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-ink">{value}</p>
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
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</span>
      <input
        required={required}
        type={type}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-outline bg-surface-panel/90 px-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand-coral/50"
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
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 min-h-24 w-full rounded-xl border border-outline bg-surface-panel/90 px-4 py-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-brand-coral/50"
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
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">{label}</span>
      <select className="mt-2 h-11 w-full rounded-xl border border-outline bg-surface-panel/90 px-4 text-sm text-ink outline-none focus:border-brand-coral/50" value={value} onChange={(event) => onChange(event.target.value)}>
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
    <Button
      type="button"
      onClick={onClick}
      disabled={disabled}
      variant={danger ? "destructive" : "outline"}
      size="icon-sm"
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
}
