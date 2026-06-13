import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  LineChart,
  Map as MapIcon,
  Target,
  Trophy,
  UsersRound
} from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { StudyGoalLogo } from "@/components/brand/study-goal-logo";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import {
  calculateCompletedCredits,
  calculateCreditProgress,
  calculateGpa,
  calculateProjectedGpa
} from "@/lib/calculations/academic";
import { calculateCareerReadiness } from "@/lib/calculations/career";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

type Course = {
  id: string;
  semester_id: string;
  code: string | null;
  name: string;
  credits: number;
  target_grade: number | null;
  final_grade: number | null;
  status: string;
};

type Goal = {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
  priority: string;
};

type Milestone = {
  id: string;
  goal_id: string;
  title: string;
  due_date: string | null;
  status: string;
};

type Skill = {
  id: string;
  level: number;
  target_level: number;
  status: string;
};

type Club = {
  id: string;
  status: string;
  is_leadership: boolean;
};

type PortfolioItem = {
  id: string;
  status: string;
  related_course_id: string | null;
  related_goal_id: string | null;
  related_skill_id: string | null;
  related_club_id: string | null;
};

type CareerReadiness = {
  resume_status: string;
  linkedin_status: string;
  github_status: string;
  portfolio_status: string;
  interview_practice_count: number;
  networking_contacts_count: number;
};

type CareerTarget = {
  stage: string;
};

const dashboardCopy = {
  en: {
    appSubtitle: "Personal university OS",
    profile: "Profile",
    roadmap: "Roadmap",
    grades: "Academic planner",
    goals: "Goals",
    skills: "Skills",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Dashboard",
    welcome: "Welcome back",
    description:
      "Your live command center now reflects semesters, courses, grades, and goals from your Study Goal workspace.",
    fallbackName: "Student",
    notSet: "Not set",
    unavailable: "N/A",
    year: "Year",
    units: {
      courses: "courses",
      credits: "credits",
      active: "active",
      completed: "completed"
    },
    courseFallback: "Course",
    statusLabels: {
      planned: "Planned",
      in_progress: "In progress",
      completed: "Completed",
      dropped: "Dropped"
    },
    metricLabels: {
      currentGpa: "Current GPA",
      completedCredits: "Completed credits",
      creditProgress: "Credit progress",
      projectedGpa: "Projected GPA",
      activeGoals: "Active goals",
      goalProgress: "Goal progress",
      coursesTracked: "Courses tracked",
      semesters: "Semesters"
    },
    intelligence: {
      academicSignal: "Academic signal",
      graduationCredits: "graduation credits",
      targetGpa: "Target GPA",
      gpaHealthy: "Your projection is aligned with your target.",
      gpaWarning: "Your projection is below target. Review unfinished courses and target grades."
    },
    modules: {
      academicTitle: "Academic Planner",
      academicText: "Courses and credits tracked from your semester plan.",
      goalsTitle: "Goal Management",
      goalsText: "Active academic, skill, research, and career goals.",
      skillsTitle: "Skill Tree",
      skillsText: "Portfolio-ready skill progress with levels and evidence."
    },
    roadmapModule: {
      title: "Roadmap",
      yearUnit: "year",
      text: "See every year, semester, course, goal, and milestone in one master plan."
    },
    nextActions: {
      title: "Next best actions",
      createSemester: "Create your first semester",
      createSemesterCopy: "Start the academic planner by adding the semester you are currently studying.",
      addCourse: "Add your first course",
      addCourseCopy: "Connect credits and grades to make GPA analytics meaningful.",
      createGoal: "Create your first goal",
      createGoalCopy: "Give the dashboard a target to track beyond grades.",
      completeCourse: "Complete one course record",
      completeCourseCopy: "Add a final grade to unlock your current GPA.",
      review: "Review this week's plan",
      reviewCopy: "Your core data is live. Keep updating grades and goal progress weekly."
    },
    recentCourses: "Recent courses",
    activeGoalsTitle: "Active goals",
    weeklyFocus: "Weekly focus",
    noFocus: "No active milestones yet.",
    sourceGoal: "Goal",
    noCourses: "No courses yet.",
    noGoals: "No goals yet.",
    careerGoal: "Career goal",
    emptyCareerGoal: "No career goal yet.",
    readiness: "Readiness score"
  },
  vi: {
    appSubtitle: "Hệ điều hành đại học cá nhân",
    profile: "Hồ sơ",
    roadmap: "Lộ trình",
    grades: "Kế hoạch học tập",
    goals: "Mục tiêu",
    skills: "Kỹ năng",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Bảng điều khiển",
    welcome: "Chào mừng trở lại",
    description:
      "Trung tâm điều khiển của bạn giờ phản ánh dữ liệu thật từ học kỳ, môn học, điểm số, mục tiêu và kỹ năng trong Study Goal.",
    fallbackName: "Sinh viên",
    notSet: "Chưa thiết lập",
    unavailable: "Chưa có",
    year: "Năm",
    units: {
      courses: "môn học",
      credits: "tín chỉ",
      active: "đang làm",
      completed: "đã hoàn thành"
    },
    courseFallback: "Môn học",
    statusLabels: {
      planned: "Dự định",
      in_progress: "Đang học",
      completed: "Hoàn thành",
      dropped: "Đã hủy"
    },
    metricLabels: {
      currentGpa: "GPA hiện tại",
      completedCredits: "Tín chỉ hoàn thành",
      creditProgress: "Tiến độ tín chỉ",
      projectedGpa: "GPA dự kiến",
      activeGoals: "Mục tiêu đang làm",
      goalProgress: "Tiến độ mục tiêu",
      coursesTracked: "Môn học đã theo dõi",
      semesters: "Học kỳ"
    },
    intelligence: {
      academicSignal: "Tín hiệu học tập",
      graduationCredits: "tín chỉ tốt nghiệp",
      targetGpa: "GPA mục tiêu",
      gpaHealthy: "GPA dự kiến đang phù hợp với mục tiêu của bạn.",
      gpaWarning: "GPA dự kiến đang thấp hơn mục tiêu. Hãy xem lại các môn chưa hoàn thành và điểm mục tiêu."
    },
    modules: {
      academicTitle: "Lập kế hoạch học tập",
      academicText: "Môn học và tín chỉ được lấy từ kế hoạch học kỳ của bạn.",
      goalsTitle: "Quản lý mục tiêu",
      goalsText: "Các mục tiêu học tập, kỹ năng, nghiên cứu và sự nghiệp đang hoạt động.",
      skillsTitle: "Cây kỹ năng",
      skillsText: "Tiến độ kỹ năng có cấp độ và minh chứng cho portfolio."
    },
    roadmapModule: {
      title: "Lộ trình",
      yearUnit: "năm",
      text: "Xem từng năm, học kỳ, môn học, mục tiêu và cột mốc trong một kế hoạch tổng thể."
    },
    nextActions: {
      title: "Hành động tiếp theo",
      createSemester: "Tạo học kỳ đầu tiên",
      createSemesterCopy: "Bắt đầu trình lập kế hoạch học tập bằng học kỳ bạn đang học.",
      addCourse: "Thêm môn học đầu tiên",
      addCourseCopy: "Kết nối tín chỉ và điểm số để phân tích GPA có ý nghĩa.",
      createGoal: "Tạo mục tiêu đầu tiên",
      createGoalCopy: "Cho bảng điều khiển một mục tiêu để theo dõi ngoài điểm số.",
      completeCourse: "Hoàn tất một môn học",
      completeCourseCopy: "Nhập điểm cuối kỳ để mở khóa GPA hiện tại.",
      review: "Xem lại kế hoạch tuần này",
      reviewCopy: "Dữ liệu lõi đã hoạt động. Hãy cập nhật điểm, kỹ năng và tiến độ mục tiêu hằng tuần."
    },
    recentCourses: "Môn học gần đây",
    activeGoalsTitle: "Mục tiêu đang hoạt động",
    weeklyFocus: "Trọng tâm tuần này",
    noFocus: "Chưa có cột mốc đang hoạt động.",
    sourceGoal: "Mục tiêu",
    noCourses: "Chưa có môn học.",
    noGoals: "Chưa có mục tiêu.",
    careerGoal: "Mục tiêu nghề nghiệp",
    emptyCareerGoal: "Chưa có mục tiêu nghề nghiệp.",
    readiness: "Điểm sẵn sàng"
  }
} as const;

type NextActionsCopy = {
  title: string;
  createSemester: string;
  createSemesterCopy: string;
  addCourse: string;
  addCourseCopy: string;
  createGoal: string;
  createGoalCopy: string;
  completeCourse: string;
  completeCourseCopy: string;
  review: string;
  reviewCopy: string;
};

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = dashboardCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, university, major, start_year, current_year, academic_year_target, target_gpa, graduation_credit_target, career_goal, is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const [
    { data: semesters },
    { data: courses },
    { data: goals },
    { data: milestones },
    { data: skills },
    { data: clubs },
    { data: portfolioItems },
    { data: careerReadiness },
    { data: careerTargets }
  ] = await Promise.all([
    supabase
      .from("semesters")
      .select("id, name, year_index, term")
      .eq("user_id", user.id)
      .order("year_index", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase
      .from("courses")
      .select("id, semester_id, code, name, credits, target_grade, final_grade, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("goals")
      .select("id, title, category, progress, status, priority")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("goal_milestones")
      .select("id, goal_id, title, due_date, status")
      .eq("user_id", user.id)
      .neq("status", "completed")
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("skills")
      .select("id, level, target_level, status")
      .eq("user_id", user.id),
    supabase
      .from("clubs")
      .select("id, status, is_leadership")
      .eq("user_id", user.id),
    supabase
      .from("portfolio_items")
      .select("id, status, related_course_id, related_goal_id, related_skill_id, related_club_id")
      .eq("user_id", user.id),
    supabase
      .from("career_readiness")
      .select("resume_status, linkedin_status, github_status, portfolio_status, interview_practice_count, networking_contacts_count")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("career_targets")
      .select("stage")
      .eq("user_id", user.id)
  ]);

  const safeCourses = (courses || []).map((course) => ({
    ...course,
    credits: Number(course.credits || 0),
    target_grade: course.target_grade === null ? null : Number(course.target_grade),
    final_grade: course.final_grade === null ? null : Number(course.final_grade)
  })) as Course[];
  const safeGoals = (goals || []) as Goal[];
  const safeMilestones = (milestones || []) as Milestone[];
  const safeSkills = (skills || []).map((skill) => ({
    ...skill,
    level: Number(skill.level || 0),
    target_level: Number(skill.target_level || 1)
  })) as Skill[];
  const safeClubs = (clubs || []) as Club[];
  const safePortfolioItems = (portfolioItems || []) as PortfolioItem[];
  const safeCareerReadiness = careerReadiness as CareerReadiness | null;
  const safeCareerTargets = (careerTargets || []) as CareerTarget[];
  const displayName = profile.full_name || user.email || t.fallbackName;
  const completedCredits = calculateCompletedCredits(safeCourses);
  const gpa = calculateGpa(safeCourses);
  const targetCredits = Number(profile.graduation_credit_target || 128);
  const creditProgress = calculateCreditProgress(completedCredits, targetCredits);
  const targetGpa = profile.target_gpa === null ? null : Number(profile.target_gpa);
  const projectedGpa = calculateProjectedGpa(safeCourses, targetGpa);
  const isProjectedHealthy = targetGpa && projectedGpa ? projectedGpa >= targetGpa : true;
  const activeGoals = safeGoals.filter((goal) => !["completed", "paused"].includes(goal.status));
  const completedGoals = safeGoals.filter((goal) => goal.status === "completed");
  const goalTitleById = new Map(safeGoals.map((goal) => [goal.id, goal.title]));
  const targetYears = Number(profile.academic_year_target || 4);
  const expectedSemesters = Math.max(1, targetYears * 2);
  const roadmapCompletion = Math.min(100, Math.round(((semesters?.length || 0) / expectedSemesters) * 100));
  const skillProgress = safeSkills.length
    ? Math.round(
        safeSkills.reduce((total, skill) => total + Math.min(100, Math.round((skill.level / Math.max(1, skill.target_level)) * 100)), 0) /
          safeSkills.length
      )
    : 0;
  const activeClubs = safeClubs.filter((club) => club.status === "active");
  const leadershipClubs = safeClubs.filter((club) => club.is_leadership);
  const clubsLabel = language === "vi" ? "CLB" : "Clubs";
  const clubsTitle = language === "vi" ? "Theo dõi câu lạc bộ" : "Club Tracker";
  const clubsText =
    language === "vi"
      ? `${activeClubs.length} CLB đang tham gia / ${leadershipClubs.length} vai trò lãnh đạo.`
      : `${activeClubs.length} active clubs / ${leadershipClubs.length} leadership roles.`;
  const portfolioLabel = language === "vi" ? "Portfolio" : "Portfolio";
  const portfolioTitle = language === "vi" ? "Portfolio thành tựu" : "Achievement Portfolio";
  const readyPortfolioItems = safePortfolioItems.filter((item) => item.status === "ready" || item.status === "featured");
  const linkedPortfolioItems = safePortfolioItems.filter((item) =>
    Boolean(item.related_course_id || item.related_goal_id || item.related_skill_id || item.related_club_id)
  );
  const portfolioText =
    language === "vi"
      ? `${readyPortfolioItems.length} minh chứng sẵn sàng / ${linkedPortfolioItems.length} đã liên kết.`
      : `${readyPortfolioItems.length} ready items / ${linkedPortfolioItems.length} linked evidence.`;
  const goalProgress = safeGoals.length
    ? Math.round(safeGoals.reduce((total, goal) => total + Number(goal.progress || 0), 0) / safeGoals.length)
    : 0;
  const readinessScore = calculateCareerReadiness(safeCareerReadiness, safeCareerTargets);
  const activeCareerTargets = safeCareerTargets.filter((target) =>
    ["applied", "interviewing", "offer"].includes(target.stage)
  ).length;
  const careerLabel = language === "vi" ? "Sự nghiệp" : "Career";
  const careerTitle = language === "vi" ? "Sẵn sàng nghề nghiệp" : "Career Readiness";
  const careerText =
    language === "vi"
      ? `${readinessScore}/100 điểm sẵn sàng / ${activeCareerTargets} cơ hội đang hoạt động.`
      : `${readinessScore}/100 readiness / ${activeCareerTargets} active opportunities.`;
  const nextAction = getNextAction({
    hasSemesters: Boolean(semesters?.length),
    hasCourses: safeCourses.length > 0,
    hasGoals: safeGoals.length > 0,
    hasGpa: gpa !== null,
    copy: t.nextActions
  });

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/12 bg-slate-950/64 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="flex items-center gap-3">
            <StudyGoalLogo priority />
            <div>
              <p className="font-display text-lg font-semibold text-white">Study Goal</p>
              <p className="text-sm text-slate-400">{t.appSubtitle}</p>
            </div>
          </a>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <LanguageSwitcher language={language} label={t.languageLabel} />
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/grades">
              {t.grades}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/roadmap">
              {t.roadmap}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/goals">
              {t.goals}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/skills">
              {t.skills}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/clubs">
              {clubsLabel}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/portfolio">
              {portfolioLabel}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/career">
              {careerLabel}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/profile">
              {t.profile}
            </a>
            <SignOutButton label={t.signOut} />
          </div>
        </header>

        <section className="grid gap-6 py-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">{t.eyebrow}</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-tight text-white">
              {t.welcome}, {displayName}.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{t.description}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <IdentityPill label={t.metricLabels.semesters} value={String(semesters?.length || 0)} icon={CalendarDays} />
              <IdentityPill label={t.roadmap} value={`${roadmapCompletion}%`} icon={MapIcon} />
            </div>
          </div>

          <div className="glass rounded-[2rem] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-emerald-200">{t.readiness}</p>
                <h2 className="mt-2 font-display text-4xl font-semibold text-white">{readinessScore}/100</h2>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-300/24 bg-emerald-300/10 text-emerald-100 shadow-glow-emerald">
                <Trophy className="h-8 w-8" aria-hidden="true" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label={t.metricLabels.currentGpa} value={gpa === null ? t.unavailable : String(gpa)} icon={BarChart3} />
              <MetricCard label={t.metricLabels.completedCredits} value={String(completedCredits)} icon={GraduationCap} />
              <MetricCard label={t.metricLabels.activeGoals} value={String(activeGoals.length)} icon={Target} />
              <MetricCard label={t.metricLabels.goalProgress} value={`${goalProgress}%`} icon={LineChart} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="glass rounded-[2rem] p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">{t.metricLabels.creditProgress}</p>
                <h2 className="mt-2 font-display text-4xl font-semibold text-white">{creditProgress}%</h2>
              </div>
              <span className="rounded-full bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-200/16">
                {completedCredits}/{targetCredits} {t.units.credits}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" style={{ width: `${creditProgress}%` }} />
            </div>
            <p className="mt-4 text-sm text-slate-400">{targetCredits} {t.intelligence.graduationCredits}</p>
          </div>

          <div className="glass rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">{t.intelligence.academicSignal}</p>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-slate-400">{t.metricLabels.projectedGpa}</p>
                <p className="mt-1 font-display text-4xl font-semibold text-white">{projectedGpa === null ? t.unavailable : projectedGpa}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400">{t.intelligence.targetGpa}</p>
                <p className="mt-1 text-xl font-semibold text-slate-100">{targetGpa || t.unavailable}</p>
              </div>
            </div>
            <p className={`mt-5 rounded-2xl px-4 py-3 text-sm ${isProjectedHealthy ? "bg-emerald-300/10 text-emerald-100" : "bg-amber-300/10 text-amber-100"}`}>
              {isProjectedHealthy ? t.intelligence.gpaHealthy : t.intelligence.gpaWarning}
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <NextModule
            icon={MapIcon}
            title={
              language === "en"
                ? `${targetYears}-${t.roadmapModule.yearUnit} ${t.roadmapModule.title}`
                : `${t.roadmapModule.title} ${targetYears} ${t.roadmapModule.yearUnit}`
            }
            text={t.roadmapModule.text}
            href="/roadmap"
          />
          <NextModule
            icon={BookOpenCheck}
            title={t.modules.academicTitle}
            text={`${t.modules.academicText} ${safeCourses.length} ${t.units.courses} / ${completedCredits} ${t.units.credits}.`}
            href="/grades"
          />
          <NextModule
            icon={Target}
            title={t.modules.goalsTitle}
            text={`${t.modules.goalsText} ${activeGoals.length} ${t.units.active} / ${completedGoals.length} ${t.units.completed}.`}
            href="/goals"
          />
          <NextModule
            icon={BrainCircuit}
            title={t.modules.skillsTitle}
            text={`${t.modules.skillsText} ${safeSkills.length} ${t.skills.toLowerCase()} / ${skillProgress}%.`}
            href="/skills"
          />
          <NextModule
            icon={UsersRound}
            title={clubsTitle}
            text={clubsText}
            href="/clubs"
          />
          <NextModule
            icon={Trophy}
            title={portfolioTitle}
            text={portfolioText}
            href="/portfolio"
          />
          <NextModule
            icon={BriefcaseBusiness}
            title={careerTitle}
            text={careerText}
            href="/career"
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="glass rounded-[2rem] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">{t.nextActions.title}</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-white">{nextAction.title}</h2>
            <p className="mt-3 leading-7 text-slate-300">{nextAction.copy}</p>
            <a href={nextAction.href} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-100">
              {nextAction.cta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <ListPanel title={t.weeklyFocus} empty={t.noFocus}>
              {safeMilestones.slice(0, 4).map((milestone) => (
                <div key={milestone.id} className="rounded-2xl border border-white/10 bg-slate-950/52 p-4">
                  <p className="font-semibold text-white">{milestone.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.sourceGoal}: {goalTitleById.get(milestone.goal_id) || t.goals}
                  </p>
                </div>
              ))}
            </ListPanel>

            <ListPanel title={t.recentCourses} empty={t.noCourses}>
              {safeCourses.slice(0, 4).map((course) => (
                <div key={course.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/52 p-4">
                  <div>
                    <p className="font-semibold text-white">{course.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {course.code || t.courseFallback} / {t.statusLabels[course.status as keyof typeof t.statusLabels] || course.status}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-100">{course.final_grade ?? "-"}</span>
                </div>
              ))}
            </ListPanel>

            <ListPanel title={t.activeGoalsTitle} empty={t.noGoals}>
              {activeGoals.slice(0, 4).map((goal) => (
                <div key={goal.id} className="rounded-2xl border border-white/10 bg-slate-950/52 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{goal.title}</p>
                    <span className="text-sm text-emerald-100">{goal.progress}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
              ))}
            </ListPanel>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.055] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">{t.careerGoal}</p>
          <p className="mt-4 text-lg leading-8 text-slate-200">
            {profile.career_goal || t.emptyCareerGoal}
          </p>
        </section>
      </div>
    </main>
  );
}

function getNextAction({
  hasSemesters,
  hasCourses,
  hasGoals,
  hasGpa,
  copy
}: {
  hasSemesters: boolean;
  hasCourses: boolean;
  hasGoals: boolean;
  hasGpa: boolean;
  copy: NextActionsCopy;
}) {
  if (!hasSemesters) {
    return {
      title: copy.createSemester,
      copy: copy.createSemesterCopy,
      href: "/grades",
      cta: copy.createSemester
    };
  }

  if (!hasCourses) {
    return {
      title: copy.addCourse,
      copy: copy.addCourseCopy,
      href: "/grades",
      cta: copy.addCourse
    };
  }

  if (!hasGoals) {
    return {
      title: copy.createGoal,
      copy: copy.createGoalCopy,
      href: "/goals",
      cta: copy.createGoal
    };
  }

  if (!hasGpa) {
    return {
      title: copy.completeCourse,
      copy: copy.completeCourseCopy,
      href: "/grades",
      cta: copy.completeCourse
    };
  }

  return {
    title: copy.review,
    copy: copy.reviewCopy,
    href: "/goals",
    cta: copy.review
  };
}

function IdentityPill({
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

function MetricCard({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: typeof GraduationCap;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/62 p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon className="h-4 w-4 text-sky-200" aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function NextModule({
  icon: Icon,
  title,
  text,
  href
}: {
  icon: typeof GraduationCap;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <a href={href} className="block rounded-2xl border border-white/10 bg-white/[0.055] p-5 transition-colors hover:border-sky-300/30 hover:bg-white/[0.085]">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200 ring-1 ring-sky-200/16">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>
    </a>
  );
}

function ListPanel({
  title,
  empty,
  children
}: {
  title: string;
  empty: string;
  children: ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <div className="glass rounded-[2rem] p-5">
      <div className="mb-5 flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-200" aria-hidden="true" />
        <h2 className="font-display text-xl font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-3">
        {hasItems ? children : <p className="rounded-2xl border border-white/10 bg-slate-950/52 p-4 text-sm text-slate-400">{empty}</p>}
      </div>
    </div>
  );
}

