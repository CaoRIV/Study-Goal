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
    title: "Your next best academic moves.",
    description:
      "Study Goal reviews your courses, GPA, goals, skills, portfolio, clubs, and career pipeline to surface practical recommendations.",
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
    title: "Những bước đi học tập nên làm tiếp theo.",
    description:
      "Study Goal rà soát môn học, GPA, mục tiêu, kỹ năng, portfolio, CLB và pipeline sự nghiệp để đưa ra gợi ý thực tế.",
    primary: "Gợi ý ưu tiên",
    secondary: "Bản đồ cơ hội",
    ruleBased: "Rule engine",
    localFirst: "Sẵn sàng Ollama local",
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
  high: "bg-orange-300/16 text-orange-100 ring-orange-200/25",
  medium: "bg-cyan-300/12 text-cyan-100 ring-cyan-200/20",
  low: "bg-emerald-300/12 text-emerald-100 ring-emerald-200/20"
};

const categoryStyles: Record<RecommendationCategory, string> = {
  academic: "border-cyan-300/20 bg-cyan-300/[0.055]",
  goals: "border-orange-300/20 bg-orange-300/[0.055]",
  skills: "border-emerald-300/20 bg-emerald-300/[0.055]",
  portfolio: "border-rose-200/20 bg-rose-200/[0.055]",
  career: "border-amber-200/20 bg-amber-200/[0.055]",
  clubs: "border-sky-300/20 bg-sky-300/[0.055]"
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
    <main id="main-content" className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <WorkspaceHeader
          language={language}
          subtitle={t.appSubtitle}
          languageLabel={t.languageLabel}
          signOutLabel={t.signOut}
        />

        <section className="mt-12 grid gap-8 xl:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-signal-cyan">
              {t.eyebrow}
            </p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-tight text-ink md:text-6xl">
              {t.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-ink-muted">
              {t.description}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <SignalPill icon={BarChart3} label={t.ruleBased} />
              <SignalPill icon={Sparkles} label={t.localFirst} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label={t.stats.recommendations} value={String(recommendations.length)} />
            <StatCard label={t.stats.highPriority} value={String(highPriorityCount)} />
            <StatCard label={t.stats.dataSources} value="7" />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-300/12 text-signal-cyan ring-1 ring-cyan-200/20">
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

        <section className="mt-10 grid gap-5 xl:grid-cols-[0.6fr_1.4fr]">
          <div className="rounded-[2rem] border border-white/10 bg-surface-panel/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-cyan">
              {t.secondary}
            </p>
            <div className="mt-6 grid gap-3">
              {visibleCategories.map((category) => {
                const Icon = categoryIcons[category];
                const count = recommendations.filter((recommendation) => recommendation.category === category).length;

                return (
                  <div key={category} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-signal-cyan" aria-hidden="true" />
                      <span className="text-sm font-semibold text-ink">{t.categories[category]}</span>
                    </div>
                    <span className="text-sm text-ink-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <OllamaReviewCard language={language} />
        </section>
      </div>
    </main>
  );
}

function SignalPill({ icon: Icon, label }: { icon: typeof Sparkles; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-ink">
      <Icon className="h-4 w-4 text-signal-cyan" aria-hidden="true" />
      {label}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-surface-panel/80 p-5">
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

  return (
    <article className={cn("group rounded-[1.5rem] border p-5 transition-colors duration-200 hover:border-cyan-200/30", categoryStyles[recommendation.category])}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/35 text-signal-cyan ring-1 ring-white/10">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-muted">{recommendation.signal}</p>
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
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-signal-cyan transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        {recommendation.action}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
      </a>
    </article>
  );
}
