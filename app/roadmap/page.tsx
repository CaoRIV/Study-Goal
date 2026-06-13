import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Flag,
  GraduationCap,
  Map,
  Target
} from "lucide-react";

import { StudyGoalLogo } from "@/components/brand/study-goal-logo";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { calculateCompletedCredits, calculateGpa } from "@/lib/calculations/academic";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

type Semester = {
  id: string;
  name: string;
  year_index: number;
  term: string;
};

type Course = {
  id: string;
  semester_id: string;
  code: string | null;
  name: string;
  credits: number;
  final_grade: number | null;
  status: string;
};

type Goal = {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
  target_date: string | null;
};

type Milestone = {
  id: string;
  goal_id: string;
  title: string;
  status: string;
};

const roadmapCopy = {
  en: {
    subtitle: "Four-year roadmap",
    dashboard: "Dashboard",
    grades: "Academic planner",
    goals: "Goals",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Roadmap",
    title: "Your four-year university master plan.",
    description:
      "See semesters, credits, GPA signals, goals, and milestones together so each year has a clear role in your long-term plan.",
    year: "Year",
    noSemesters: "No semesters planned for this year yet.",
    courses: "courses",
    credits: "credits",
    completedCredits: "completed credits",
    gpa: "GPA",
    unavailable: "N/A",
    activeGoals: "Active goals",
    milestones: "Milestones",
    noGoals: "No goals connected yet.",
    noCourses: "No courses in this semester yet.",
    currentYear: "Current year",
    academicDuration: "Study duration",
    roadmapCompletion: "Roadmap completion",
    plannedTerms: "Planned semesters",
    terms: {
      fall: "Fall",
      spring: "Spring",
      summer: "Summer",
      winter: "Winter",
      other: "Other"
    },
    statuses: {
      planned: "Planned",
      in_progress: "In progress",
      completed: "Completed",
      dropped: "Dropped",
      paused: "Paused"
    }
  },
  vi: {
    subtitle: "Lộ trình 4 năm",
    dashboard: "Bảng điều khiển",
    grades: "Kế hoạch học tập",
    goals: "Mục tiêu",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Lộ trình",
    title: "Kế hoạch tổng thể cho 4 năm đại học.",
    description:
      "Xem học kỳ, tín chỉ, tín hiệu GPA, mục tiêu và cột mốc cùng nhau để mỗi năm có vai trò rõ ràng trong kế hoạch dài hạn.",
    year: "Năm",
    noSemesters: "Chưa có học kỳ nào được lên kế hoạch cho năm này.",
    courses: "môn học",
    credits: "tín chỉ",
    completedCredits: "tín chỉ hoàn thành",
    gpa: "GPA",
    unavailable: "Chưa có",
    activeGoals: "Mục tiêu đang làm",
    milestones: "Cột mốc",
    noGoals: "Chưa có mục tiêu được kết nối.",
    noCourses: "Chưa có môn học trong học kỳ này.",
    currentYear: "Năm hiện tại",
    academicDuration: "Thời lượng học",
    roadmapCompletion: "Hoàn thành lộ trình",
    plannedTerms: "Học kỳ đã lên kế hoạch",
    terms: {
      fall: "Kỳ thu",
      spring: "Kỳ xuân",
      summer: "Kỳ hè",
      winter: "Kỳ đông",
      other: "Khác"
    },
    statuses: {
      planned: "Dự định",
      in_progress: "Đang học",
      completed: "Hoàn thành",
      dropped: "Đã hủy",
      paused: "Tạm dừng"
    }
  }
} as const;

export default async function RoadmapPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = roadmapCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/roadmap");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded, current_year, academic_year_target, graduation_credit_target")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const [{ data: semesters }, { data: courses }, { data: goals }, { data: milestones }] = await Promise.all([
    supabase
      .from("semesters")
      .select("id, name, year_index, term")
      .eq("user_id", user.id)
      .order("year_index", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("courses")
      .select("id, semester_id, code, name, credits, final_grade, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("goals")
      .select("id, title, category, progress, status, target_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("goal_milestones")
      .select("id, goal_id, title, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
  ]);

  const safeSemesters = (semesters || []) as Semester[];
  const safeCourses = (courses || []).map((course) => ({
    ...course,
    credits: Number(course.credits || 0),
    final_grade: course.final_grade === null ? null : Number(course.final_grade)
  })) as Course[];
  const safeGoals = (goals || []) as Goal[];
  const safeMilestones = (milestones || []) as Milestone[];
  const completedCredits = calculateCompletedCredits(safeCourses);
  const targetCredits = Number(profile.graduation_credit_target || 128);
  const targetYears = Number(profile.academic_year_target || 4);
  const maxSemesterYear = safeSemesters.reduce((max, semester) => Math.max(max, Number(semester.year_index || 1)), 1);
  const roadmapYearCount = Math.max(targetYears, maxSemesterYear);
  const expectedSemesters = Math.max(1, targetYears * 2);
  const roadmapCompletion = Math.min(100, Math.round((safeSemesters.length / expectedSemesters) * 100));
  const years = Array.from({ length: roadmapYearCount }, (_, index) => index + 1).map((yearIndex) => {
    const yearSemesters = safeSemesters.filter((semester) => semester.year_index === yearIndex);
    const semesterIds = new Set(yearSemesters.map((semester) => semester.id));
    const yearCourses = safeCourses.filter((course) => semesterIds.has(course.semester_id));
    const yearCredits = yearCourses.reduce((total, course) => total + Number(course.credits || 0), 0);
    const yearCompletedCredits = calculateCompletedCredits(yearCourses);
    const yearGpa = calculateGpa(yearCourses);
    const yearGoals = safeGoals.filter((goal) => {
      if (!goal.target_date) {
        return goal.status !== "completed" && yearIndex === Number(profile.current_year || 1);
      }

      return yearSemesters.some((semester) => String(goal.target_date).includes(String(semester.name).slice(-4)));
    });

    return {
      yearIndex,
      semesters: yearSemesters,
      courses: yearCourses,
      credits: yearCredits,
      completedCredits: yearCompletedCredits,
      gpa: yearGpa,
      goals: yearGoals
    };
  });

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/12 bg-slate-950/64 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <a href="/dashboard" className="flex items-center gap-3">
            <StudyGoalLogo priority />
            <div>
              <p className="font-display text-lg font-semibold text-white">Study Goal</p>
              <p className="text-sm text-slate-400">{t.subtitle}</p>
            </div>
          </a>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <LanguageSwitcher language={language} label={t.languageLabel} />
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/dashboard">
              {t.dashboard}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/grades">
              {t.grades}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/goals">
              {t.goals}
            </a>
            <SignOutButton label={t.signOut} />
          </div>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-tight text-white">
              {t.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{t.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label={t.currentYear} value={`${t.year} ${profile.current_year || 1}`} icon={CalendarDays} />
            <Metric label={t.academicDuration} value={`${targetYears} ${t.year.toLowerCase()}`} icon={Map} />
            <Metric label={t.roadmapCompletion} value={`${roadmapCompletion}%`} icon={CheckCircle2} />
            <Metric label={t.completedCredits} value={`${completedCredits}/${targetCredits}`} icon={GraduationCap} />
          </div>
        </section>

        <section className="space-y-5">
          {years.map((year) => (
            <article key={year.yearIndex} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-5 shadow-2xl shadow-black/20">
              <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="lg:border-r lg:border-white/10 lg:pr-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200 ring-1 ring-sky-200/18">
                    <span className="font-display text-2xl font-semibold">{year.yearIndex}</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-semibold text-white">{t.year} {year.yearIndex}</h2>
                  <div className="mt-5 space-y-3 text-sm text-slate-400">
                    <StatLine label={t.plannedTerms} value={String(year.semesters.length)} />
                    <StatLine label={t.courses} value={String(year.courses.length)} />
                    <StatLine label={t.credits} value={String(year.credits)} />
                    <StatLine label={t.gpa} value={year.gpa === null ? t.unavailable : String(year.gpa)} />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="space-y-3">
                    {year.semesters.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-white/10 bg-slate-950/45 p-4 text-sm text-slate-500">{t.noSemesters}</p>
                    ) : null}
                    {year.semesters.map((semester) => {
                      const semesterCourses = safeCourses.filter((course) => course.semester_id === semester.id);

                      return (
                        <section key={semester.id} className="rounded-2xl border border-white/10 bg-slate-950/62 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">{t.terms[semester.term as keyof typeof t.terms] || semester.term}</p>
                              <h3 className="mt-1 text-lg font-semibold text-white">{semester.name}</h3>
                            </div>
                            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                              {semesterCourses.length} {t.courses}
                            </span>
                          </div>
                          <div className="mt-4 space-y-2">
                            {semesterCourses.length === 0 ? <p className="text-sm text-slate-500">{t.noCourses}</p> : null}
                            {semesterCourses.slice(0, 5).map((course) => (
                              <div key={course.id} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.035] px-3 py-2 text-sm">
                                <div className="min-w-0">
                                  <p className="truncate font-medium text-slate-100">{course.name}</p>
                                  <p className="text-xs text-slate-500">{course.code || t.courses} / {t.statuses[course.status as keyof typeof t.statuses] || course.status}</p>
                                </div>
                                <span className="shrink-0 text-xs font-semibold text-emerald-100">{course.credits} {t.credits}</span>
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                    <div className="mb-4 flex items-center gap-3">
                      <Target className="h-5 w-5 text-emerald-200" aria-hidden="true" />
                      <h3 className="font-semibold text-white">{t.activeGoals}</h3>
                    </div>
                    <div className="space-y-3">
                      {year.goals.length === 0 ? <p className="text-sm text-slate-500">{t.noGoals}</p> : null}
                      {year.goals.slice(0, 4).map((goal) => {
                        const goalMilestones = safeMilestones.filter((milestone) => milestone.goal_id === goal.id);
                        const completedMilestones = goalMilestones.filter((milestone) => milestone.status === "completed").length;

                        return (
                          <div key={goal.id} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-medium leading-6 text-white">{goal.title}</p>
                              <span className="shrink-0 text-sm font-semibold text-emerald-100">{goal.progress}%</span>
                            </div>
                            <div className="mt-3 h-2 rounded-full bg-slate-800">
                              <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" style={{ width: `${goal.progress}%` }} />
                            </div>
                            <p className="mt-2 text-xs text-slate-500">{t.milestones}: {completedMilestones}/{goalMilestones.length}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof GraduationCap;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-sky-200" aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  );
}
