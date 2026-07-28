import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Flag,
  Lightbulb,
  Sparkles,
  Target,
  Trophy,
  UsersRound
} from "lucide-react";

import { OllamaReviewCard } from "@/components/insights/ollama-review-card";
import { WorkspaceHeader } from "@/components/navigation/workspace-header";
import { createRuleRecommendations, type Recommendation, type RecommendationCategory, type RecommendationPriority } from "@/lib/recommendations/rules";
import { loadRecommendationInput } from "@/lib/recommendations/server";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const copy = {
  en: {
    appSubtitle: "Personal university OS",
    languageLabel: "Change language",
    signOut: "Sign out",
    eyebrow: "AI insights",
    title: "Your next best moves.",
    primary: "Priority recommendations",
    secondary: "Opportunity map",
    ruleBased: "Rule engine",
    localFirst: "Ollama local-ready",
    priority: {
      high: "High",
      medium: "Medium",
      low: "Low"
    },
    stats: {
      recommendations: "Recommendations",
      highPriority: "High priority",
      dataSources: "Data sources"
    },
    categories: {
      academic: "Academic",
      goals: "Goals",
      skills: "Skills",
      portfolio: "Portfolio",
      career: "Career",
      clubs: "Clubs"
    }
  },
  vi: {
    appSubtitle: "Hệ điều hành đại học cá nhân",
    languageLabel: "Đổi ngôn ngữ",
    signOut: "Đăng xuất",
    eyebrow: "AI insights",
    title: "Những bước đi nên làm tiếp theo.",
    primary: "Gợi ý ưu tiên",
    secondary: "Bản đồ cơ hội",
    ruleBased: "Rule engine",
    localFirst: "Sẵn sàng AI Review Insight",
    priority: {
      high: "Cao",
      medium: "Trung bình",
      low: "Thấp"
    },
    stats: {
      recommendations: "Gợi ý",
      highPriority: "Ưu tiên cao",
      dataSources: "Nguồn dữ liệu"
    },
    categories: {
      academic: "Học tập",
      goals: "Mục tiêu",
      skills: "Kỹ năng",
      portfolio: "Portfolio",
      career: "Sự nghiệp",
      clubs: "CLB"
    }
  }
} as const;

const categoryIcons: Record<RecommendationCategory, typeof BookOpenCheck> = {
  academic: BookOpenCheck,
  goals: Target,
  skills: BrainCircuit,
  portfolio: Trophy,
  career: BriefcaseBusiness,
  clubs: UsersRound
};

const priorityStyles: Record<RecommendationPriority, string> = {
  high: "bg-brand-orange text-white shadow-[0_8px_24px_rgba(249,115,22,0.22)] ring-orange-600/10",
  medium: "bg-brand-cyan text-white shadow-[0_8px_24px_rgba(8,145,178,0.18)] ring-cyan-700/10",
  low: "bg-brand-green text-white shadow-[0_8px_24px_rgba(16,185,129,0.18)] ring-emerald-700/10"
};

const categoryStyles: Record<
  RecommendationCategory,
  {
    card: string;
    icon: string;
    text: string;
    bar: string;
    row: string;
  }
> = {
  academic: {
    card: "border-cyan-700/14 bg-white shadow-[0_18px_50px_rgba(8,145,178,0.08)]",
    icon: "bg-cyan-700/10 text-signal-cyan ring-cyan-700/16",
    text: "text-signal-cyan",
    bar: "bg-brand-cyan",
    row: "bg-cyan-700/8 text-signal-cyan ring-cyan-700/14"
  },
  goals: {
    card: "border-orange-600/14 bg-white shadow-[0_18px_50px_rgba(249,115,22,0.08)]",
    icon: "bg-orange-600/10 text-signal-orange ring-orange-600/16",
    text: "text-signal-orange",
    bar: "bg-brand-orange",
    row: "bg-orange-600/8 text-signal-orange ring-orange-600/14"
  },
  skills: {
    card: "border-emerald-700/14 bg-white shadow-[0_18px_50px_rgba(16,185,129,0.08)]",
    icon: "bg-emerald-700/10 text-signal-green ring-emerald-700/16",
    text: "text-signal-green",
    bar: "bg-brand-green",
    row: "bg-emerald-700/8 text-signal-green ring-emerald-700/14"
  },
  portfolio: {
    card: "border-rose-700/14 bg-white shadow-[0_18px_50px_rgba(251,113,133,0.08)]",
    icon: "bg-rose-700/10 text-signal-red ring-rose-700/16",
    text: "text-signal-red",
    bar: "bg-brand-coral",
    row: "bg-rose-700/8 text-signal-red ring-rose-700/14"
  },
  career: {
    card: "border-amber-700/14 bg-white shadow-[0_18px_50px_rgba(194,65,12,0.08)]",
    icon: "bg-amber-700/10 text-signal-orange ring-amber-700/16",
    text: "text-signal-orange",
    bar: "bg-amber-500",
    row: "bg-amber-700/8 text-signal-orange ring-amber-700/14"
  },
  clubs: {
    card: "border-sky-700/14 bg-white shadow-[0_18px_50px_rgba(14,116,144,0.08)]",
    icon: "bg-sky-700/10 text-signal-cyan ring-sky-700/16",
    text: "text-signal-cyan",
    bar: "bg-sky-500",
    row: "bg-sky-700/8 text-signal-cyan ring-sky-700/14"
  }
};

export default async function InsightsPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = copy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/insights");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const input = await loadRecommendationInput(user.id);
  const recommendations = createRuleRecommendations(input, language);
  const highPriorityCount = recommendations.filter((recommendation) => recommendation.priority === "high").length;
  const visibleCategories = Array.from(new Set(recommendations.map((recommendation) => recommendation.category)));

  return (
    <main id="main-content" className="neo-app neo-insights workspace-shell min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <WorkspaceHeader
          language={language}
          subtitle={t.appSubtitle}
          languageLabel={t.languageLabel}
          signOutLabel={t.signOut}
        />

        <section className="workspace-page-hero mt-8 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-cyan">
              {t.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl text-balance font-display text-5xl font-semibold leading-tight text-ink md:text-6xl">
              {t.title}
            </h1>
            <div className="mt-7 flex flex-wrap gap-3">
              <SignalPill icon={BarChart3} label={t.ruleBased} />
              <SignalPill icon={Sparkles} label={t.localFirst} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard tone="sky" label={t.stats.recommendations} value={String(recommendations.length)} />
            <StatCard tone="coral" label={t.stats.highPriority} value={String(highPriorityCount)} />
            <StatCard tone="mint" label={t.stats.dataSources} value="7" />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-yellow text-neo-ink shadow-neo-xs">
              <Lightbulb className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-display text-3xl font-semibold text-ink">{t.primary}</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {recommendations.map((recommendation) => (
              <RecommendationCard
                key={recommendation.id}
                recommendation={recommendation}
                priorityLabel={t.priority[recommendation.priority]}
                categoryLabel={t.categories[recommendation.category]}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 xl:grid-cols-[0.58fr_1.42fr]">
          <aside className="rounded-neo-lg border-neo-strong border-neo-ink bg-neo-sky p-6 shadow-neo-lg">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-cyan">
              {t.secondary}
            </p>
            <div className="mt-6 grid gap-3">
              {visibleCategories.map((category) => {
                const Icon = categoryIcons[category];
                const styles = categoryStyles[category];
                const count = recommendations.filter((recommendation) => recommendation.category === category).length;

                return (
                  <div
                    key={category}
                    className="flex items-center justify-between gap-4 rounded-neo border-2 border-neo-ink bg-neo-white px-4 py-3.5 shadow-neo-xs transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-neo-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", styles.icon)}>
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-ink">{t.categories[category]}</span>
                    </div>
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold ring-1", styles.row)}>{count}</span>
                  </div>
                );
              })}
            </div>
          </aside>
          <OllamaReviewCard language={language} />
        </section>
      </div>
    </main>
  );
}

function SignalPill({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <span className="neo-signal-pill inline-flex items-center gap-2 rounded-neo-sm border-2 border-neo-ink bg-neo-white px-4 py-2 text-sm font-black text-neo-ink shadow-neo-xs">
      <Icon className="h-4 w-4 text-signal-cyan" aria-hidden="true" />
      {label}
    </span>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: "sky" | "coral" | "mint" }) {
  return (
    <div className={`neo-insight-stat neo-insight-stat-${tone} rounded-neo border-2 border-neo-ink bg-neo-white p-5 shadow-neo-sm`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">{label}</p>
      <p className="mt-4 font-display text-4xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function RecommendationCard({
  recommendation,
  priorityLabel,
  categoryLabel
}: {
  recommendation: Recommendation;
  priorityLabel: string;
  categoryLabel: string;
}) {
  const Icon = categoryIcons[recommendation.category];
  const styles = categoryStyles[recommendation.category];

  return (
    <article className={cn(`neo-recommendation neo-recommendation-${recommendation.category} group relative overflow-hidden rounded-neo border-2 border-neo-ink p-5 shadow-neo-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-neo-lg`, styles.card)}>
      <div className={cn("absolute inset-x-0 top-0 h-1", styles.bar)} />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-1", styles.icon)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className={cn("text-xs font-semibold uppercase tracking-[0.16em]", styles.text)}>{recommendation.signal}</p>
            <p className="mt-1 text-sm text-ink-muted">{categoryLabel}</p>
          </div>
        </div>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold ring-1", priorityStyles[recommendation.priority])}>
          {priorityLabel}
        </span>
      </div>

      <h3 className="mt-6 font-display text-2xl font-semibold leading-tight text-ink">
        {recommendation.title}
      </h3>
      <p className="mt-3 leading-7 text-ink-muted">{recommendation.summary}</p>
      <a
        href={recommendation.href}
        className={cn("mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300", styles.text)}
      >
        {recommendation.action}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </a>
    </article>
  );
}
