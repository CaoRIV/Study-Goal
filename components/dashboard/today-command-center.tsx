"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  Ban,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Flag,
  Loader2,
  Plus,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  type CheckInState,
  type TodayDeadlineItem,
  type TodayEntityType,
  type TodayPriorityItem,
  type TodayRiskItem,
  type TodayUrgency
} from "@/lib/dashboard/today";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const copy = {
  en: {
    eyebrow: "Today",
    title: "Your daily command center",
    description:
      "Three high-impact moves, the next seven days, and the risks worth handling now.",
    priorities: "Top 3 priorities",
    prioritiesHint: "Ranked by urgency, importance, and progress.",
    noPriorities: "No active goal or milestone needs attention.",
    noPrioritiesHint: "Add a goal to give Today something useful to rank.",
    deadlines: "Next 7 days",
    noDeadlines: "No deadlines in the next seven days.",
    risks: "Risk radar",
    done: "Done",
    tomorrow: "Tomorrow",
    blocked: "Blocked",
    rescheduled: "Moved to tomorrow",
    checkInError: "Could not save this check-in. Please try again.",
    quickAdd: "Quick add",
    addGoal: "Goal",
    addMilestone: "Milestone",
    addEvidence: "Evidence",
    kind: {
      goal: "Goal",
      milestone: "Milestone",
      career: "Career"
    },
    urgency: {
      overdue: "Overdue",
      today: "Due today",
      soon: "Due soon",
      later: "Upcoming",
      undated: "No deadline"
    },
    dateLocale: "en-US"
  },
  vi: {
    eyebrow: "Hôm nay",
    title: "Trung tâm điều hành trong ngày",
    description:
      "Ba việc tạo tác động lớn nhất, deadline bảy ngày tới và rủi ro cần xử lý ngay.",
    priorities: "3 ưu tiên cao nhất",
    prioritiesHint: "Xếp theo độ gấp, mức quan trọng và tiến độ.",
    noPriorities: "Không có mục tiêu hoặc cột mốc nào đang cần chú ý.",
    noPrioritiesHint: "Thêm mục tiêu để Today có dữ liệu hữu ích để xếp hạng.",
    deadlines: "7 ngày tiếp theo",
    noDeadlines: "Không có deadline trong bảy ngày tới.",
    risks: "Radar rủi ro",
    done: "Xong",
    tomorrow: "Ngày mai",
    blocked: "Bị chặn",
    rescheduled: "Đã dời sang ngày mai",
    checkInError: "Không thể lưu check-in. Vui lòng thử lại.",
    quickAdd: "Thêm nhanh",
    addGoal: "Mục tiêu",
    addMilestone: "Cột mốc",
    addEvidence: "Minh chứng",
    kind: {
      goal: "Mục tiêu",
      milestone: "Cột mốc",
      career: "Sự nghiệp"
    },
    urgency: {
      overdue: "Quá hạn",
      today: "Hạn hôm nay",
      soon: "Sắp đến hạn",
      later: "Sắp tới",
      undated: "Chưa có hạn"
    },
    dateLocale: "vi-VN"
  }
} as const;

const priorityTones = [
  "bg-neo-sky",
  "bg-neo-yellow",
  "bg-neo-mint"
] as const;

function dateFromIso(date: string) {
  return new Date(`${date}T00:00:00Z`);
}

export function TodayCommandCenter({
  language,
  today,
  priorities,
  deadlines,
  risks
}: {
  language: "en" | "vi";
  today: string;
  priorities: TodayPriorityItem[];
  deadlines: TodayDeadlineItem[];
  risks: TodayRiskItem[];
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [pendingKey, setPendingKey] = useState("");
  const [error, setError] = useState("");
  const t = copy[language];
  const tomorrow = new Date(dateFromIso(today).getTime() + 86_400_000)
    .toISOString()
    .slice(0, 10);
  const todayLabel = new Intl.DateTimeFormat(t.dateLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC"
  }).format(dateFromIso(today));

  async function checkIn(
    entityType: TodayEntityType,
    entityId: string,
    state: CheckInState
  ) {
    const key = `${entityType}:${entityId}:${state}`;
    setPendingKey(key);
    setError("");

    const { error: checkInError } = await supabase.rpc(
      "record_daily_check_in",
      {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_state: state,
        p_rescheduled_for: state === "rescheduled" ? tomorrow : null,
        p_check_in_date: today
      }
    );

    if (checkInError) {
      setError(t.checkInError);
      setPendingKey("");
      return;
    }

    setPendingKey("");
    router.refresh();
  }

  return (
    <section className="mt-10" aria-labelledby="today-command-title">
      <div className="workspace-panel overflow-visible p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 border-b-2 border-neo-ink pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="accent">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t.eyebrow}
              </Badge>
              <span className="text-sm font-bold capitalize text-ink-muted">
                {todayLabel}
              </span>
            </div>
            <h2
              id="today-command-title"
              className="mt-4 font-display text-3xl font-black tracking-[-0.025em] text-neo-ink sm:text-4xl"
            >
              {t.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-ink-muted sm:text-base">
              {t.description}
            </p>
          </div>

          <details className="group relative z-20 self-start lg:self-auto">
            <summary
              className={cn(
                buttonVariants({ variant: "default" }),
                "list-none [&::-webkit-details-marker]:hidden"
              )}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.quickAdd}
              <ChevronDown
                className="h-4 w-4 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.65rem)] grid w-56 gap-2 rounded-neo border-2 border-neo-ink bg-neo-paper p-2 shadow-neo-lg">
              <QuickAddLink
                href="/goals#create-goal"
                icon={Target}
                label={t.addGoal}
              />
              <QuickAddLink
                href="/goals#goal-board"
                icon={Flag}
                label={t.addMilestone}
              />
              <QuickAddLink
                href="/portfolio#create-evidence"
                icon={Trophy}
                label={t.addEvidence}
              />
            </div>
          </details>
        </div>

        {error ? (
          <div
            className="mt-5 rounded-neo-sm border-2 border-neo-ink bg-neo-coral px-4 py-3 text-sm font-bold text-neo-ink shadow-neo-xs"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div>
            <PanelHeading
              icon={CircleDot}
              title={t.priorities}
              description={t.prioritiesHint}
            />

            {priorities.length ? (
              <ol className="mt-4 grid gap-4">
                {priorities.map((item, index) => (
                  <PriorityCard
                    key={`${item.entityType}:${item.id}`}
                    item={item}
                    index={index}
                    tone={priorityTones[index] || "bg-neo-paper"}
                    language={language}
                    pendingKey={pendingKey}
                    onCheckIn={checkIn}
                  />
                ))}
              </ol>
            ) : (
              <div className="mt-4 rounded-neo border-2 border-dashed border-neo-ink bg-neo-mint p-6">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                <p className="mt-3 font-display text-xl font-black text-neo-ink">
                  {t.noPriorities}
                </p>
                <p className="mt-1 text-sm font-medium leading-6 text-ink-muted">
                  {t.noPrioritiesHint}
                </p>
                <Button asChild size="sm" className="mt-4">
                  <a href="/goals">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t.addGoal}
                  </a>
                </Button>
              </div>
            )}
          </div>

          <div className="grid content-start gap-5">
            <SidePanel
              icon={CalendarDays}
              title={t.deadlines}
              tone="bg-neo-sky"
            >
              {deadlines.length ? (
                <div className="grid gap-2">
                  {deadlines.map((deadline) => (
                    <a
                      key={deadline.id}
                      href={deadline.href}
                      className="group flex items-center justify-between gap-3 rounded-neo-sm border-2 border-neo-ink bg-neo-white p-3 shadow-neo-xs transition-[box-shadow,transform] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-sm focus-visible:outline-none focus-visible:shadow-neo-focus"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-neo-ink">
                          {deadline.title}
                        </span>
                        <span className="mt-1 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                          {t.kind[deadline.kind]}
                          <span aria-hidden="true">·</span>
                          {formatShortDate(
                            deadline.dueDate,
                            t.dateLocale
                          )}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="rounded-neo-sm border-2 border-dashed border-neo-ink bg-neo-white p-4 text-sm font-semibold leading-6 text-ink-muted">
                  {t.noDeadlines}
                </p>
              )}
            </SidePanel>

            <SidePanel
              icon={AlertTriangle}
              title={t.risks}
              tone="bg-neo-coral"
            >
              <div className="grid gap-2">
                {risks.map((risk) => (
                  <a
                    key={risk.id}
                    href={risk.href}
                    className={cn(
                      "group rounded-neo-sm border-2 border-neo-ink p-3 shadow-neo-xs transition-[box-shadow,transform] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neo-sm focus-visible:outline-none focus-visible:shadow-neo-focus",
                      risk.severity === "clear"
                        ? "bg-neo-mint"
                        : risk.severity === "high"
                          ? "bg-neo-white"
                          : "bg-neo-yellow"
                    )}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-sm font-black text-neo-ink">
                          {risk.title}
                        </span>
                        <span className="mt-1 block text-xs font-semibold leading-5 text-ink-muted">
                          {risk.detail}
                        </span>
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </a>
                ))}
              </div>
            </SidePanel>
          </div>
        </div>
      </div>
    </section>
  );
}
function PriorityCard({
  item,
  index,
  tone,
  language,
  pendingKey,
  onCheckIn
}: {
  item: TodayPriorityItem;
  index: number;
  tone: string;
  language: "en" | "vi";
  pendingKey: string;
  onCheckIn: (
    entityType: TodayEntityType,
    entityId: string,
    state: CheckInState
  ) => Promise<void>;
}) {
  const t = copy[language];
  const isBusy = Boolean(pendingKey);
  const href = "/goals";

  return (
    <li
      className={cn(
        "rounded-neo border-2 border-neo-ink p-4 shadow-neo-sm sm:p-5",
        tone
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-white font-display text-lg font-black shadow-neo-xs">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{t.kind[item.entityType]}</Badge>
            <UrgencyBadge urgency={item.urgency} label={t.urgency[item.urgency]} />
            {item.checkInState === "blocked" ? (
              <Badge variant="destructive">
                <Ban className="h-3 w-3" aria-hidden="true" />
                {t.blocked}
              </Badge>
            ) : null}
            {item.checkInState === "rescheduled" ? (
              <Badge variant="secondary">{t.rescheduled}</Badge>
            ) : null}
          </div>

          <a
            href={href}
            className="mt-3 inline-flex items-start gap-1 font-display text-xl font-black leading-tight text-neo-ink underline-offset-4 hover:underline focus-visible:outline-none focus-visible:shadow-neo-focus sm:text-2xl"
          >
            {item.title}
            <ArrowUpRight
              className="mt-1 h-4 w-4 shrink-0"
              aria-hidden="true"
            />
          </a>
          <p className="mt-1 text-sm font-semibold text-ink-muted">
            {item.context}
          </p>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-bold text-ink-muted">
              <span>{item.progress}%</span>
              {item.dueDate ? (
                <span>
                  {formatShortDate(item.dueDate, t.dateLocale)}
                </span>
              ) : null}
            </div>
            <div className="h-2 overflow-hidden rounded-full border-2 border-neo-ink bg-neo-white">
              <div
                className="h-full bg-neo-primary"
                style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t-2 border-neo-ink/20 pt-4 sm:pl-14">
        <Button
          type="button"
          size="sm"
          variant="success"
          disabled={isBusy}
          onClick={() => onCheckIn(item.entityType, item.id, "completed")}
        >
          {pendingKey === `${item.entityType}:${item.id}:completed` ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Check className="h-4 w-4" aria-hidden="true" />
          )}
          {t.done}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isBusy}
          onClick={() => onCheckIn(item.entityType, item.id, "rescheduled")}
        >
          {pendingKey === `${item.entityType}:${item.id}:rescheduled` ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
          )}
          {t.tomorrow}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isBusy}
          onClick={() => onCheckIn(item.entityType, item.id, "blocked")}
        >
          {pendingKey === `${item.entityType}:${item.id}:blocked` ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Ban className="h-4 w-4" aria-hidden="true" />
          )}
          {t.blocked}
        </Button>
      </div>
    </li>
  );
}

function UrgencyBadge({
  urgency,
  label
}: {
  urgency: TodayUrgency;
  label: string;
}) {
  return (
    <Badge
      variant={
        urgency === "overdue"
          ? "destructive"
          : urgency === "today" || urgency === "soon"
            ? "warning"
            : "secondary"
      }
    >
      {label}
    </Badge>
  );
}

function PanelHeading({
  icon: Icon,
  title,
  description
}: {
  icon: typeof CircleDot;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-primary text-white shadow-neo-xs">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-display text-xl font-black text-neo-ink">{title}</h3>
        <p className="mt-1 text-sm font-medium text-ink-muted">{description}</p>
      </div>
    </div>
  );
}

function SidePanel({
  icon: Icon,
  title,
  tone,
  children
}: {
  icon: typeof CalendarDays;
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-neo border-2 border-neo-ink p-4 shadow-neo-sm", tone)}>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-white shadow-neo-xs">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="font-display text-lg font-black text-neo-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function QuickAddLink({
  href,
  icon: Icon,
  label
}: {
  href: string;
  icon: typeof Target;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between gap-3 rounded-neo-sm border-2 border-neo-ink bg-neo-white px-3 py-2.5 text-sm font-black text-neo-ink shadow-neo-xs transition-[background-color,box-shadow,transform] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-neo-yellow hover:shadow-neo-sm focus-visible:outline-none focus-visible:shadow-neo-focus"
    >
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      <Plus className="h-4 w-4" aria-hidden="true" />
    </a>
  );
}

function formatShortDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  }).format(dateFromIso(date));
}
