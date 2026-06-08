"use client";

import { FormEvent, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  CalendarDays,
  Crown,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  UsersRound,
  X,
  type LucideIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Club = {
  id: string;
  user_id: string;
  name: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
  is_leadership: boolean;
  impact_notes: string | null;
  achievements: string | null;
};

type ClubDraft = {
  name: string;
  role: string;
  startDate: string;
  endDate: string;
  status: string;
  isLeadership: boolean;
  impactNotes: string;
  achievements: string;
};

type ClubsManagerCopy = {
  summary: {
    tracked: string;
    active: string;
    leadership: string;
    achievements: string;
  };
  form: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    roleLabel: string;
    rolePlaceholder: string;
    startDateLabel: string;
    endDateLabel: string;
    statusLabel: string;
    leadershipLabel: string;
    impactLabel: string;
    impactPlaceholder: string;
    achievementsLabel: string;
    achievementsPlaceholder: string;
    submit: string;
  };
  filters: {
    title: string;
    search: string;
    allStatuses: string;
    leadershipOnly: string;
    noMatches: string;
  };
  list: {
    title: string;
    empty: string;
    period: string;
    present: string;
    leadership: string;
    impact: string;
    achievements: string;
  };
  actions: {
    edit: string;
    save: string;
    cancel: string;
    delete: string;
    confirmDelete: string;
  };
  labels: {
    statuses: Record<string, string>;
  };
};

const statusOptions = ["planned", "active", "completed", "paused"];

export function ClubsManager({
  userId,
  initialClubs,
  copy
}: {
  userId: string;
  initialClubs: Club[];
  copy: ClubsManagerCopy;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [isLeadership, setIsLeadership] = useState(false);
  const [impactNotes, setImpactNotes] = useState("");
  const [achievements, setAchievements] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [leadershipOnly, setLeadershipOnly] = useState(false);
  const [editingClubId, setEditingClubId] = useState("");
  const [draft, setDraft] = useState<ClubDraft>({
    name: "",
    role: "",
    startDate: "",
    endDate: "",
    status: "active",
    isLeadership: false,
    impactNotes: "",
    achievements: ""
  });
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const activeCount = initialClubs.filter((club) => club.status === "active").length;
  const leadershipCount = initialClubs.filter((club) => club.is_leadership).length;
  const achievementCount = initialClubs.filter((club) => Boolean(club.achievements)).length;
  const filteredClubs = initialClubs
    .filter((club) => statusFilter === "all" || club.status === statusFilter)
    .filter((club) => !leadershipOnly || club.is_leadership)
    .filter((club) => {
      const searchText = `${club.name} ${club.role} ${club.impact_notes || ""} ${club.achievements || ""}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });
  const isBusy = Boolean(pendingAction);

  async function createClub(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("create");
    setError("");

    const { error: insertError } = await supabase.from("clubs").insert({
      user_id: userId,
      name,
      role,
      start_date: startDate || null,
      end_date: endDate || null,
      status,
      is_leadership: isLeadership,
      impact_notes: impactNotes || null,
      achievements: achievements || null
    });

    if (insertError) {
      setError(insertError.message);
      setPendingAction("");
      return;
    }

    setName("");
    setRole("");
    setStartDate("");
    setEndDate("");
    setStatus("active");
    setIsLeadership(false);
    setImpactNotes("");
    setAchievements("");
    setPendingAction("");
    router.refresh();
  }

  function startEditing(club: Club) {
    setEditingClubId(club.id);
    setDraft({
      name: club.name,
      role: club.role,
      startDate: club.start_date || "",
      endDate: club.end_date || "",
      status: club.status,
      isLeadership: club.is_leadership,
      impactNotes: club.impact_notes || "",
      achievements: club.achievements || ""
    });
  }

  async function updateClub(clubId: string) {
    setPendingAction(`update-${clubId}`);
    setError("");

    const { error: updateError } = await supabase
      .from("clubs")
      .update({
        name: draft.name,
        role: draft.role,
        start_date: draft.startDate || null,
        end_date: draft.endDate || null,
        status: draft.status,
        is_leadership: draft.isLeadership,
        impact_notes: draft.impactNotes || null,
        achievements: draft.achievements || null
      })
      .eq("id", clubId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    setEditingClubId("");
    setPendingAction("");
    router.refresh();
  }

  async function deleteClub(clubId: string) {
    if (!window.confirm(copy.actions.confirmDelete)) {
      return;
    }

    setPendingAction(`delete-${clubId}`);
    setError("");

    const { error: deleteError } = await supabase
      .from("clubs")
      .delete()
      .eq("id", clubId)
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
        <SummaryCard label={copy.summary.tracked} value={String(initialClubs.length)} icon={UsersRound} />
        <SummaryCard label={copy.summary.active} value={String(activeCount)} icon={CalendarDays} />
        <SummaryCard label={copy.summary.leadership} value={String(leadershipCount)} icon={Crown} />
        <SummaryCard label={copy.summary.achievements} value={String(achievementCount)} icon={Award} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <form className="glass h-fit rounded-[2rem] p-6" onSubmit={createClub}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-300/24 bg-emerald-300/12 text-emerald-100 shadow-glow-emerald">
              <Plus className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="font-display text-2xl font-semibold text-white">{copy.form.title}</h2>
          </div>

          <div className="space-y-4">
            <Field label={copy.form.nameLabel}>
              <input required value={name} onChange={(event) => setName(event.target.value)} className="form-input" placeholder={copy.form.namePlaceholder} />
            </Field>
            <Field label={copy.form.roleLabel}>
              <input required value={role} onChange={(event) => setRole(event.target.value)} className="form-input" placeholder={copy.form.rolePlaceholder} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={copy.form.startDateLabel}>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="form-input" />
              </Field>
              <Field label={copy.form.endDateLabel}>
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="form-input" />
              </Field>
            </div>
            <Field label={copy.form.statusLabel}>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="form-input">
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{copy.labels.statuses[option]}</option>
                ))}
              </select>
            </Field>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-200">
              <input type="checkbox" checked={isLeadership} onChange={(event) => setIsLeadership(event.target.checked)} className="h-4 w-4 accent-emerald-300" />
              {copy.form.leadershipLabel}
            </label>
            <Field label={copy.form.impactLabel}>
              <textarea value={impactNotes} onChange={(event) => setImpactNotes(event.target.value)} className="form-input min-h-28 resize-y py-3" placeholder={copy.form.impactPlaceholder} />
            </Field>
            <Field label={copy.form.achievementsLabel}>
              <textarea value={achievements} onChange={(event) => setAchievements(event.target.value)} className="form-input min-h-24 resize-y py-3" placeholder={copy.form.achievementsPlaceholder} />
            </Field>

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
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_190px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className="form-input pl-11" placeholder={copy.filters.search} />
              </label>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="form-input">
                <option value="all">{copy.filters.allStatuses}</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{copy.labels.statuses[option]}</option>
                ))}
              </select>
              <label className="flex h-12 cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm font-semibold text-slate-200">
                <input type="checkbox" checked={leadershipOnly} onChange={(event) => setLeadershipOnly(event.target.checked)} className="h-4 w-4 accent-emerald-300" />
                {copy.filters.leadershipOnly}
              </label>
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/50 p-5 shadow-2xl shadow-black/25 backdrop-blur-2xl">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-300/20 bg-purple-300/10 text-purple-100">
                <UsersRound className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="font-display text-2xl font-semibold text-white">{copy.list.title}</h2>
            </div>

            {filteredClubs.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/14 bg-white/[0.035] p-8 text-center text-slate-400">
                {query || statusFilter !== "all" || leadershipOnly ? copy.filters.noMatches : copy.list.empty}
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredClubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    club={club}
                    copy={copy}
                    isEditing={editingClubId === club.id}
                    draft={draft}
                    setDraft={setDraft}
                    onEdit={() => startEditing(club)}
                    onCancel={() => setEditingClubId("")}
                    onSave={() => updateClub(club.id)}
                    onDelete={() => deleteClub(club.id)}
                    isBusy={pendingAction.endsWith(club.id)}
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
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/18 bg-emerald-300/10 text-emerald-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ClubCard({
  club,
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
  club: Club;
  copy: ClubsManagerCopy;
  isEditing: boolean;
  draft: ClubDraft;
  setDraft: (draft: ClubDraft) => void;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  isBusy: boolean;
}) {
  if (isEditing) {
    return (
      <article className="rounded-[1.5rem] border border-sky-300/22 bg-slate-950/76 p-4">
        <div className="space-y-3">
          <input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="form-input" />
          <input required value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value })} className="form-input" />
          <div className="grid gap-3 sm:grid-cols-2">
            <input type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} className="form-input" />
            <input type="date" value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} className="form-input" />
          </div>
          <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value })} className="form-input">
            {statusOptions.map((option) => (
              <option key={option} value={option}>{copy.labels.statuses[option]}</option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-200">
            <input type="checkbox" checked={draft.isLeadership} onChange={(event) => setDraft({ ...draft, isLeadership: event.target.checked })} className="h-4 w-4 accent-emerald-300" />
            {copy.form.leadershipLabel}
          </label>
          <textarea value={draft.impactNotes} onChange={(event) => setDraft({ ...draft, impactNotes: event.target.value })} className="form-input min-h-24 py-3" />
          <textarea value={draft.achievements} onChange={(event) => setDraft({ ...draft, achievements: event.target.value })} className="form-input min-h-24 py-3" />
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
    <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/64 p-5 transition-colors duration-200 hover:border-emerald-300/24 hover:bg-slate-900/72">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-200/16">
              {copy.labels.statuses[club.status]}
            </span>
            {club.is_leadership ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100 ring-1 ring-amber-200/16">
                <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                {copy.list.leadership}
              </span>
            ) : null}
          </div>
          <h3 className="break-words font-display text-2xl font-semibold leading-tight text-white">{club.name}</h3>
          <p className="mt-2 text-sm font-semibold text-sky-100">{club.role}</p>
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

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.list.period}</p>
        <p className="mt-2 text-sm text-slate-300">{formatPeriod(club.start_date, club.end_date, copy.list.present)}</p>
      </div>

      <div className="mt-4 grid gap-3">
        <InfoBlock title={copy.list.impact} value={club.impact_notes} />
        <InfoBlock title={copy.list.achievements} value={club.achievements} />
      </div>
    </article>
  );
}

function InfoBlock({ title, value }: { title: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-300">{value || "-"}</p>
    </div>
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

function formatPeriod(startDate: string | null, endDate: string | null, presentLabel: string) {
  if (!startDate && !endDate) {
    return "-";
  }

  return `${startDate || "?"} - ${endDate || presentLabel}`;
}
