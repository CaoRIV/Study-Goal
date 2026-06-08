"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Archive,
  Award,
  BriefcaseBusiness,
  ExternalLink,
  FileText,
  Filter,
  FolderKanban,
  Link2,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Star,
  Trash2,
  Trophy,
  X,
  type LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type PortfolioItem = {
  id: string;
  user_id: string;
  title: string;
  type: string;
  description: string | null;
  url: string | null;
  status: string;
  evidence_date: string | null;
  related_course_id: string | null;
  related_goal_id: string | null;
  related_skill_id: string | null;
  related_club_id: string | null;
};

type RelationOption = {
  id: string;
  label: string;
};

type PortfolioDraft = {
  title: string;
  type: string;
  description: string;
  url: string;
  status: string;
  evidenceDate: string;
  relatedCourseId: string;
  relatedGoalId: string;
  relatedSkillId: string;
  relatedClubId: string;
};

type PortfolioManagerCopy = {
  summary: {
    tracked: string;
    ready: string;
    featured: string;
    linked: string;
  };
  form: {
    title: string;
    titleLabel: string;
    titlePlaceholder: string;
    typeLabel: string;
    statusLabel: string;
    evidenceDateLabel: string;
    urlLabel: string;
    urlPlaceholder: string;
    descriptionLabel: string;
    descriptionPlaceholder: string;
    relationsTitle: string;
    courseLabel: string;
    goalLabel: string;
    skillLabel: string;
    clubLabel: string;
    noRelation: string;
    submit: string;
  };
  filters: {
    title: string;
    search: string;
    allTypes: string;
    allStatuses: string;
    noMatches: string;
  };
  list: {
    title: string;
    empty: string;
    evidenceDate: string;
    links: string;
    open: string;
    noUrl: string;
    description: string;
  };
  actions: {
    edit: string;
    save: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
  };
  labels: {
    types: Record<string, string>;
    statuses: Record<string, string>;
  };
};

const typeOptions = [
  "project",
  "research",
  "certificate",
  "competition",
  "leadership",
  "internship",
  "publication",
  "club",
  "skill",
  "course"
];

const statusOptions = ["draft", "ready", "featured", "archived"];

const statusIcon: Record<string, LucideIcon> = {
  draft: FileText,
  ready: Award,
  featured: Star,
  archived: Archive
};

export function PortfolioManager({
  userId,
  initialItems,
  courses,
  goals,
  skills,
  clubs,
  copy
}: {
  userId: string;
  initialItems: PortfolioItem[];
  courses: RelationOption[];
  goals: RelationOption[];
  skills: RelationOption[];
  clubs: RelationOption[];
  copy: PortfolioManagerCopy;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("project");
  const [status, setStatus] = useState("draft");
  const [evidenceDate, setEvidenceDate] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [relatedCourseId, setRelatedCourseId] = useState("");
  const [relatedGoalId, setRelatedGoalId] = useState("");
  const [relatedSkillId, setRelatedSkillId] = useState("");
  const [relatedClubId, setRelatedClubId] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingItemId, setEditingItemId] = useState("");
  const [draft, setDraft] = useState<PortfolioDraft>({
    title: "",
    type: "project",
    description: "",
    url: "",
    status: "draft",
    evidenceDate: "",
    relatedCourseId: "",
    relatedGoalId: "",
    relatedSkillId: "",
    relatedClubId: ""
  });
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const readyCount = initialItems.filter((item) => item.status === "ready" || item.status === "featured").length;
  const featuredCount = initialItems.filter((item) => item.status === "featured").length;
  const linkedCount = initialItems.filter((item) => hasRelation(item)).length;
  const filteredItems = initialItems
    .filter((item) => typeFilter === "all" || item.type === typeFilter)
    .filter((item) => statusFilter === "all" || item.status === statusFilter)
    .filter((item) => {
      const searchText = `${item.title} ${item.description || ""} ${item.url || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
  const isBusy = Boolean(pendingAction);

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("create");
    setError("");

    const { error: insertError } = await supabase.from("portfolio_items").insert({
      user_id: userId,
      title,
      type,
      description: description || null,
      url: url || null,
      status,
      evidence_date: evidenceDate || null,
      related_course_id: relatedCourseId || null,
      related_goal_id: relatedGoalId || null,
      related_skill_id: relatedSkillId || null,
      related_club_id: relatedClubId || null
    });

    if (insertError) {
      setError(insertError.message);
      setPendingAction("");
      return;
    }

    setTitle("");
    setType("project");
    setStatus("draft");
    setEvidenceDate("");
    setUrl("");
    setDescription("");
    setRelatedCourseId("");
    setRelatedGoalId("");
    setRelatedSkillId("");
    setRelatedClubId("");
    setPendingAction("");
    router.refresh();
  }

  function startEditing(item: PortfolioItem) {
    setEditingItemId(item.id);
    setDraft({
      title: item.title,
      type: item.type,
      description: item.description || "",
      url: item.url || "",
      status: item.status,
      evidenceDate: item.evidence_date || "",
      relatedCourseId: item.related_course_id || "",
      relatedGoalId: item.related_goal_id || "",
      relatedSkillId: item.related_skill_id || "",
      relatedClubId: item.related_club_id || ""
    });
  }

  async function updateItem(itemId: string) {
    setPendingAction(`update-${itemId}`);
    setError("");

    const { error: updateError } = await supabase
      .from("portfolio_items")
      .update({
        title: draft.title,
        type: draft.type,
        description: draft.description || null,
        url: draft.url || null,
        status: draft.status,
        evidence_date: draft.evidenceDate || null,
        related_course_id: draft.relatedCourseId || null,
        related_goal_id: draft.relatedGoalId || null,
        related_skill_id: draft.relatedSkillId || null,
        related_club_id: draft.relatedClubId || null
      })
      .eq("id", itemId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    setEditingItemId("");
    setPendingAction("");
    router.refresh();
  }

  async function deleteItem(itemId: string) {
    if (!window.confirm(copy.actions.confirmDelete)) {
      return;
    }

    setPendingAction(`delete-${itemId}`);
    setError("");

    const { error: deleteError } = await supabase
      .from("portfolio_items")
      .delete()
      .eq("id", itemId)
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
        <SummaryCard label={copy.summary.tracked} value={String(initialItems.length)} icon={FolderKanban} />
        <SummaryCard label={copy.summary.ready} value={String(readyCount)} icon={Award} />
        <SummaryCard label={copy.summary.featured} value={String(featuredCount)} icon={Star} />
        <SummaryCard label={copy.summary.linked} value={String(linkedCount)} icon={Link2} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <form className="glass h-fit rounded-[2rem] p-6" onSubmit={createItem}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/24 bg-amber-300/12 text-amber-100 shadow-glow-emerald">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-white">{copy.form.title}</h2>
          </div>

          <div className="space-y-4">
            <Field label={copy.form.titleLabel}>
              <input required value={title} onChange={(event) => setTitle(event.target.value)} className="form-input" placeholder={copy.form.titlePlaceholder} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={copy.form.typeLabel}>
                <select value={type} onChange={(event) => setType(event.target.value)} className="form-input">
                  {typeOptions.map((option) => (
                    <option key={option} value={option}>{copy.labels.types[option]}</option>
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
            <Field label={copy.form.evidenceDateLabel}>
              <input type="date" value={evidenceDate} onChange={(event) => setEvidenceDate(event.target.value)} className="form-input" />
            </Field>
            <Field label={copy.form.urlLabel}>
              <input value={url} onChange={(event) => setUrl(event.target.value)} className="form-input" placeholder={copy.form.urlPlaceholder} />
            </Field>
            <Field label={copy.form.descriptionLabel}>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="form-input min-h-28 resize-y py-3" placeholder={copy.form.descriptionPlaceholder} />
            </Field>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{copy.form.relationsTitle}</p>
              <div className="grid gap-3">
                <RelationSelect label={copy.form.courseLabel} value={relatedCourseId} onChange={setRelatedCourseId} options={courses} empty={copy.form.noRelation} />
                <RelationSelect label={copy.form.goalLabel} value={relatedGoalId} onChange={setRelatedGoalId} options={goals} empty={copy.form.noRelation} />
                <RelationSelect label={copy.form.skillLabel} value={relatedSkillId} onChange={setRelatedSkillId} options={skills} empty={copy.form.noRelation} />
                <RelationSelect label={copy.form.clubLabel} value={relatedClubId} onChange={setRelatedClubId} options={clubs} empty={copy.form.noRelation} />
              </div>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div>
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
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-100">
                <Filter className="h-4 w-4" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-semibold text-white">{copy.filters.title}</h2>
            </div>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_200px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input pl-11" placeholder={copy.filters.search} />
              </label>
              <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="form-input">
                <option value="all">{copy.filters.allTypes}</option>
                {typeOptions.map((option) => (
                  <option key={option} value={option}>{copy.labels.types[option]}</option>
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
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-100">
                <Trophy className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-2xl font-semibold text-white">{copy.list.title}</h2>
            </div>

            {filteredItems.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/14 bg-white/[0.035] p-8 text-center text-slate-400">
                {query || typeFilter !== "all" || statusFilter !== "all" ? copy.filters.noMatches : copy.list.empty}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredItems.map((item) => (
                  <PortfolioCard
                    key={item.id}
                    item={item}
                    copy={copy}
                    courses={courses}
                    goals={goals}
                    skills={skills}
                    clubs={clubs}
                    isEditing={editingItemId === item.id}
                    draft={draft}
                    setDraft={setDraft}
                    onEdit={() => startEditing(item)}
                    onCancel={() => setEditingItemId("")}
                    onSave={() => updateItem(item.id)}
                    onDelete={() => deleteItem(item.id)}
                    isBusy={pendingAction.endsWith(item.id)}
                  />
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
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-300/10 text-amber-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function PortfolioCard({
  item,
  copy,
  courses,
  goals,
  skills,
  clubs,
  isEditing,
  draft,
  setDraft,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  isBusy
}: {
  item: PortfolioItem;
  copy: PortfolioManagerCopy;
  courses: RelationOption[];
  goals: RelationOption[];
  skills: RelationOption[];
  clubs: RelationOption[];
  isEditing: boolean;
  draft: PortfolioDraft;
  setDraft: (draft: PortfolioDraft) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  isBusy: boolean;
}) {
  const StatusIcon = statusIcon[item.status] || FileText;

  if (isEditing) {
    return (
      <article className="rounded-[1.5rem] border border-sky-300/22 bg-slate-950/76 p-4">
        <div className="space-y-3">
          <input required value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="form-input" />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value })} className="form-input">
              {typeOptions.map((option) => (
                <option key={option} value={option}>{copy.labels.types[option]}</option>
              ))}
            </select>
            <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className="form-input">
              {statusOptions.map((option) => (
                <option key={option} value={option}>{copy.labels.statuses[option]}</option>
              ))}
            </select>
          </div>
          <input type="date" value={draft.evidenceDate} onChange={(event) => setDraft({ ...draft, evidenceDate: event.target.value })} className="form-input" />
          <input value={draft.url} onChange={(event) => setDraft({ ...draft, url: event.target.value })} className="form-input" />
          <textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} className="form-input min-h-24 py-3" />
          <RelationSelect label={copy.form.courseLabel} value={draft.relatedCourseId} onChange={(value) => setDraft({ ...draft, relatedCourseId: value })} options={courses} empty={copy.form.noRelation} />
          <RelationSelect label={copy.form.goalLabel} value={draft.relatedGoalId} onChange={(value) => setDraft({ ...draft, relatedGoalId: value })} options={goals} empty={copy.form.noRelation} />
          <RelationSelect label={copy.form.skillLabel} value={draft.relatedSkillId} onChange={(value) => setDraft({ ...draft, relatedSkillId: value })} options={skills} empty={copy.form.noRelation} />
          <RelationSelect label={copy.form.clubLabel} value={draft.relatedClubId} onChange={(value) => setDraft({ ...draft, relatedClubId: value })} options={clubs} empty={copy.form.noRelation} />
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
      </article>
    );
  }

  return (
    <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/64 p-5 transition-colors duration-200 hover:border-amber-300/24 hover:bg-slate-900/72">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-200/16">
              <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.labels.statuses[item.status]}
            </span>
            <span className="rounded-full bg-sky-300/10 px-3 py-1 text-xs font-semibold text-sky-100 ring-1 ring-sky-200/16">
              {copy.labels.types[item.type]}
            </span>
          </div>
          <h3 className="break-words font-display text-2xl font-semibold leading-tight text-white">{item.title}</h3>
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

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.list.description}</p>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{item.description || "-"}</p>
      </div>

      <div className="mt-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-slate-300">
        <p><span className="text-slate-500">{copy.list.evidenceDate}:</span> {item.evidence_date || "-"}</p>
        <p><span className="text-slate-500">{copy.list.links}:</span> {getRelationLabels(item, courses, goals, skills, clubs).join(" / ") || "-"}</p>
      </div>

      <div className="mt-4 flex justify-end">
        {item.url ? (
          <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-100">
            {copy.list.open}
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        ) : (
          <span className="text-sm text-slate-500">{copy.list.noUrl}</span>
        )}
      </div>
    </article>
  );
}

function RelationSelect({
  label,
  value,
  onChange,
  options,
  empty
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: RelationOption[];
  empty: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="form-input">
        <option value="">{empty}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
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

function hasRelation(item: PortfolioItem) {
  return Boolean(item.related_course_id || item.related_goal_id || item.related_skill_id || item.related_club_id);
}

function getRelationLabels(
  item: PortfolioItem,
  courses: RelationOption[],
  goals: RelationOption[],
  skills: RelationOption[],
  clubs: RelationOption[]
) {
  return [
    findLabel(courses, item.related_course_id),
    findLabel(goals, item.related_goal_id),
    findLabel(skills, item.related_skill_id),
    findLabel(clubs, item.related_club_id)
  ].filter(Boolean) as string[];
}

function findLabel(options: RelationOption[], id: string | null) {
  if (!id) {
    return "";
  }

  return options.find((option) => option.id === id)?.label || "";
}
