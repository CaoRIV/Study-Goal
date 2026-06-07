"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  CheckCircle2,
  ExternalLink,
  Filter,
  GitBranch,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
  type LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type Skill = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  level: number;
  target_level: number;
  evidence_url: string | null;
  notes: string | null;
  status: string;
};

type SkillDraft = {
  name: string;
  category: string;
  level: string;
  targetLevel: string;
  evidenceUrl: string;
  notes: string;
  status: string;
};

type SkillsManagerCopy = {
  summary: {
    tracked: string;
    mastered: string;
    averageProgress: string;
    evidence: string;
  };
  form: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    categoryLabel: string;
    levelLabel: string;
    targetLevelLabel: string;
    statusLabel: string;
    evidenceLabel: string;
    evidencePlaceholder: string;
    notesLabel: string;
    notesPlaceholder: string;
    submit: string;
  };
  filters: {
    title: string;
    search: string;
    allCategories: string;
    allStatuses: string;
    noMatches: string;
  };
  tree: {
    title: string;
    description: string;
    empty: string;
    progress: string;
    evidence: string;
    noEvidence: string;
  };
  actions: {
    edit: string;
    save: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
  };
  labels: {
    categories: Record<string, string>;
    statuses: Record<string, string>;
  };
};

const categoryOptions = [
  "programming",
  "machine_learning",
  "deep_learning",
  "nlp",
  "computer_vision",
  "research",
  "github_portfolio",
  "kaggle_projects",
  "career",
  "communication"
];

const statusOptions = ["planned", "learning", "practicing", "mastered"];

const categoryAccent: Record<string, string> = {
  programming: "from-sky-300 to-blue-500",
  machine_learning: "from-indigo-300 to-violet-500",
  deep_learning: "from-fuchsia-300 to-purple-500",
  nlp: "from-cyan-300 to-sky-500",
  computer_vision: "from-emerald-300 to-teal-500",
  research: "from-amber-200 to-orange-400",
  github_portfolio: "from-slate-200 to-slate-500",
  kaggle_projects: "from-blue-200 to-cyan-500",
  career: "from-lime-200 to-emerald-500",
  communication: "from-rose-200 to-pink-500"
};

export function SkillsManager({
  userId,
  initialSkills,
  copy
}: {
  userId: string;
  initialSkills: Skill[];
  copy: SkillsManagerCopy;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("programming");
  const [level, setLevel] = useState("1");
  const [targetLevel, setTargetLevel] = useState("5");
  const [status, setStatus] = useState("learning");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editingSkillId, setEditingSkillId] = useState("");
  const [draft, setDraft] = useState<SkillDraft>({
    name: "",
    category: "programming",
    level: "1",
    targetLevel: "5",
    evidenceUrl: "",
    notes: "",
    status: "learning"
  });
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const normalizedSkills = initialSkills.map((skill) => ({
    ...skill,
    level: Number(skill.level || 0),
    target_level: Number(skill.target_level || 1)
  }));
  const masteredCount = normalizedSkills.filter((skill) => skill.status === "mastered" || skill.level === skill.target_level).length;
  const skillsWithEvidence = normalizedSkills.filter((skill) => Boolean(skill.evidence_url)).length;
  const averageProgress = normalizedSkills.length
    ? Math.round(
        normalizedSkills.reduce((total, skill) => total + getSkillProgress(skill), 0) / normalizedSkills.length
      )
    : 0;
  const filteredSkills = normalizedSkills
    .filter((skill) => categoryFilter === "all" || skill.category === categoryFilter)
    .filter((skill) => statusFilter === "all" || skill.status === statusFilter)
    .filter((skill) => {
      const searchText = `${skill.name} ${skill.notes || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
  const skillsByCategory = categoryOptions
    .map((option) => ({
      category: option,
      skills: filteredSkills.filter((skill) => skill.category === option)
    }))
    .filter((group) => group.skills.length > 0);
  const isBusy = Boolean(pendingAction);

  async function createSkill(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("create");
    setError("");
    const numericLevel = Number(level);
    const numericTargetLevel = Math.max(Number(targetLevel), numericLevel);

    const { error: insertError } = await supabase.from("skills").insert({
      user_id: userId,
      name,
      category,
      level: numericLevel,
      target_level: numericTargetLevel,
      evidence_url: evidenceUrl || null,
      notes: notes || null,
      status
    });

    if (insertError) {
      setError(insertError.message);
      setPendingAction("");
      return;
    }

    setName("");
    setCategory("programming");
    setLevel("1");
    setTargetLevel("5");
    setStatus("learning");
    setEvidenceUrl("");
    setNotes("");
    setPendingAction("");
    router.refresh();
  }

  function startEditing(skill: Skill) {
    setEditingSkillId(skill.id);
    setDraft({
      name: skill.name,
      category: skill.category,
      level: String(skill.level),
      targetLevel: String(skill.target_level),
      evidenceUrl: skill.evidence_url || "",
      notes: skill.notes || "",
      status: skill.status
    });
  }

  async function updateSkill(skillId: string) {
    setPendingAction(`update-${skillId}`);
    setError("");
    const numericLevel = Number(draft.level);
    const numericTargetLevel = Math.max(Number(draft.targetLevel), numericLevel);

    const { error: updateError } = await supabase
      .from("skills")
      .update({
        name: draft.name,
        category: draft.category,
        level: numericLevel,
        target_level: numericTargetLevel,
        evidence_url: draft.evidenceUrl || null,
        notes: draft.notes || null,
        status: draft.status
      })
      .eq("id", skillId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    setEditingSkillId("");
    setPendingAction("");
    router.refresh();
  }

  async function deleteSkill(skillId: string) {
    if (!window.confirm(copy.actions.confirmDelete)) {
      return;
    }

    setPendingAction(`delete-${skillId}`);
    setError("");

    const { error: deleteError } = await supabase
      .from("skills")
      .delete()
      .eq("id", skillId)
      .eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      setPendingAction("");
      return;
    }

    setPendingAction("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label={copy.summary.tracked} value={String(normalizedSkills.length)} icon={BrainCircuit} />
        <SummaryCard label={copy.summary.mastered} value={String(masteredCount)} icon={CheckCircle2} />
        <SummaryCard label={copy.summary.averageProgress} value={`${averageProgress}%`} icon={Target} />
        <SummaryCard label={copy.summary.evidence} value={String(skillsWithEvidence)} icon={ExternalLink} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <form className="glass h-fit rounded-[2rem] p-6" onSubmit={createSkill}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/24 bg-sky-300/12 text-sky-100 shadow-glow-blue">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-white">{copy.form.title}</h2>
          </div>

          <div className="space-y-4">
            <Field label={copy.form.nameLabel}>
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="form-input"
                placeholder={copy.form.namePlaceholder}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={copy.form.categoryLabel}>
                <select value={category} onChange={(event) => setCategory(event.target.value)} className="form-input">
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{copy.labels.categories[option]}</option>
                  ))}
                </select>
              </Field>
              <Field label={copy.form.statusLabel}>
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-input">
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>{copy.labels.statuses[option]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={copy.form.levelLabel}>
                <input required min="0" max="10" type="number" value={level} onChange={(event) => setLevel(event.target.value)} className="form-input" />
              </Field>
              <Field label={copy.form.targetLevelLabel}>
                <input required min="1" max="10" type="number" value={targetLevel} onChange={(event) => setTargetLevel(event.target.value)} className="form-input" />
              </Field>
            </div>
            <Field label={copy.form.evidenceLabel}>
              <input value={evidenceUrl} onChange={(event) => setEvidenceUrl(event.target.value)} className="form-input" placeholder={copy.form.evidencePlaceholder} />
            </Field>
            <Field label={copy.form.notesLabel}>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="form-input min-h-28 resize-y py-3"
                placeholder={copy.form.notesPlaceholder}
              />
            </Field>

            {error ? (
              <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isBusy}>
              {pendingAction === "create" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              {copy.form.submit}
            </Button>
          </div>
        </form>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/56 p-5 backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                <Filter className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-semibold text-white">{copy.filters.title}</h2>
            </div>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_200px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="form-input pl-11"
                  placeholder={copy.filters.search}
                />
              </label>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="form-input">
                <option value="all">{copy.filters.allCategories}</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{copy.labels.categories[option]}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="form-input">
                <option value="all">{copy.filters.allStatuses}</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{copy.labels.statuses[option]}</option>
                ))}
              </select>
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-purple-100">
                  <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.tree.title}
                </div>
                <p className="max-w-2xl text-sm leading-6 text-slate-400">{copy.tree.description}</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-emerald-100">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                {averageProgress}%
              </div>
            </div>

            {skillsByCategory.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/14 bg-white/[0.035] p-8 text-center text-slate-400">
                {query || categoryFilter !== "all" || statusFilter !== "all" ? copy.filters.noMatches : copy.tree.empty}
              </div>
            ) : (
              <div className="space-y-5">
                {skillsByCategory.map((group) => (
                  <div key={group.category} className="relative rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <span className={cn("h-3 w-3 rounded-full bg-gradient-to-br", categoryAccent[group.category])} />
                      <h3 className="font-display text-lg font-semibold text-white">{copy.labels.categories[group.category]}</h3>
                      <span className="rounded-full bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-slate-300">{group.skills.length}</span>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                      {group.skills.map((skill) => (
                        <SkillNode
                          key={skill.id}
                          skill={skill}
                          copy={copy}
                          isEditing={editingSkillId === skill.id}
                          draft={draft}
                          setDraft={setDraft}
                          onEdit={() => startEditing(skill)}
                          onCancel={() => setEditingSkillId("")}
                          onSave={() => updateSkill(skill.id)}
                          onDelete={() => deleteSkill(skill.id)}
                          isBusy={pendingAction.endsWith(skill.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/60 p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-300/18 bg-sky-300/10 text-sky-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SkillNode({
  skill,
  copy,
  isEditing,
  draft,
  setDraft,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  isBusy
}: {
  skill: Skill;
  copy: SkillsManagerCopy;
  isEditing: boolean;
  draft: SkillDraft;
  setDraft: (draft: SkillDraft) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  isBusy: boolean;
}) {
  const progress = getSkillProgress(skill);

  if (isEditing) {
    return (
      <div className="rounded-[1.35rem] border border-sky-300/22 bg-slate-950/76 p-4">
        <div className="space-y-3">
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="form-input" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="form-input">
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{copy.labels.categories[option]}</option>
              ))}
            </select>
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className="form-input">
              {statusOptions.map((option) => (
                <option key={option} value={option}>{copy.labels.statuses[option]}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input min="0" max="10" type="number" value={draft.level} onChange={(event) => setDraft({ ...draft, level: event.target.value })} className="form-input" />
            <input min="1" max="10" type="number" value={draft.targetLevel} onChange={(event) => setDraft({ ...draft, targetLevel: event.target.value })} className="form-input" />
          </div>
          <input value={draft.evidenceUrl} onChange={(event) => setDraft({ ...draft, evidenceUrl: event.target.value })} className="form-input" />
          <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="form-input min-h-24 py-3" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onSave} disabled={isBusy} className="h-10 px-4">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
              {copy.actions.save}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} className="h-10 px-4">
              <X className="h-4 w-4" aria-hidden="true" />
              {copy.actions.cancel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950/64 p-4 transition-colors duration-200 hover:border-sky-300/24 hover:bg-slate-900/72">
      <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r", categoryAccent[skill.category])} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{copy.labels.statuses[skill.status]}</p>
          <h4 className="mt-2 break-words font-display text-xl font-semibold leading-tight text-white">{skill.name}</h4>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={onEdit} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/10 hover:text-white" aria-label={copy.actions.edit}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={onDelete} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-400/12 hover:text-red-100" aria-label={copy.actions.delete}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-400">{skill.notes || copy.tree.noEvidence}</p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-400">{copy.tree.progress}</span>
          <span className="font-semibold text-emerald-100">{skill.level}/{skill.target_level}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800">
          <div className={cn("h-full rounded-full bg-gradient-to-r", categoryAccent[skill.category])} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300">
          {progress}%
        </span>
        {skill.evidence_url ? (
          <a href={skill.evidence_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-sky-100 transition-colors hover:bg-sky-300/10">
            {copy.tree.evidence}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-xs text-slate-500">{copy.tree.noEvidence}</span>
        )}
      </div>
    </article>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function getSkillProgress(skill: Pick<Skill, "level" | "target_level">) {
  return Math.min(100, Math.round((Number(skill.level || 0) / Math.max(1, Number(skill.target_level || 1))) * 100));
}
