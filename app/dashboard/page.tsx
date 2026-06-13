import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarDays,
  CalendarRange,
  Clock3,
  Compass,
  Flag,
  GraduationCap,
  Lightbulb,
  Map as MapIcon,
  Sparkles,
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
import { cn } from "@/lib/utils";

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

type Semester = {
  id: string;
  name: string;
  year_index: number;
  term: string;
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
    readiness: "Readiness score",
    pulse: {
      eyebrow: "Academic pulse",
      title: "Your semester at a glance",
      description: "Credits, GPA, goals, and career readiness combined into one study signal.",
      onTrack: "On track",
      attention: "Needs attention",
      gpaTrend: "GPA trend",
      noTrend: "Complete a graded course to unlock the trend.",
      projected: "projected",
      target: "target",
      remaining: "credits remaining",
      skillMomentum: "Skill momentum",
      activeGoals: "Active goals",
      careerReady: "Career ready"
    },
    timeline: {
      eyebrow: "Semester journey",
      title: "See the academic path, not isolated tasks",
      description: "Every semester connects courses, completion, and the next chapter of your university plan.",
      completed: "Completed",
      current: "Current",
      planned: "Planned",
      courses: "courses",
      empty: "Create your first semester to start the journey."
    },
    workspace: {
      eyebrow: "Study workspace",
      title: "One system, clear academic lanes",
      description: "Each module has its own signal color while staying connected to your master plan."
    },
    focusBoard: {
      eyebrow: "Focus board",
      title: "What deserves attention next"
    },
    northStar: "Career north star"
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
    readiness: "Điểm sẵn sàng",
    pulse: {
      eyebrow: "Nhịp học tập",
      title: "Toàn cảnh học kỳ của bạn",
      description: "Tín chỉ, GPA, mục tiêu và mức sẵn sàng nghề nghiệp trong một tín hiệu học tập.",
      onTrack: "Đúng tiến độ",
      attention: "Cần chú ý",
      gpaTrend: "Xu hướng GPA",
      noTrend: "Hoàn thành một môn có điểm để mở xu hướng.",
      projected: "dự kiến",
      target: "mục tiêu",
      remaining: "tín chỉ còn lại",
      skillMomentum: "Đà phát triển kỹ năng",
      activeGoals: "Mục tiêu đang làm",
      careerReady: "Sẵn sàng nghề nghiệp"
    },
    timeline: {
      eyebrow: "Hành trình học kỳ",
      title: "Nhìn thấy lộ trình, không chỉ từng nhiệm vụ",
      description: "Mỗi học kỳ kết nối môn học, tiến độ và chương tiếp theo trong kế hoạch đại học.",
      completed: "Hoàn thành",
      current: "Hiện tại",
      planned: "Dự kiến",
      courses: "môn",
      empty: "Tạo học kỳ đầu tiên để bắt đầu hành trình."
    },
    workspace: {
      eyebrow: "Không gian học tập",
      title: "Một hệ thống, từng luồng học tập rõ ràng",
      description: "Mỗi module có màu tín hiệu riêng nhưng vẫn kết nối với kế hoạch tổng thể."
    },
    focusBoard: {
      eyebrow: "Bảng ưu tiên",
      title: "Việc cần tập trung tiếp theo"
    },
    northStar: "Đích đến sự nghiệp"
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

  const safeSemesters = (semesters || []).map((semester) => ({
    ...semester,
    year_index: Number(semester.year_index || 1)
  })) as Semester[];
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
  const clubProgress = safeClubs.length ? Math.round((activeClubs.length / safeClubs.length) * 100) : 0;
  const clubsLabel = language === "vi" ? "CLB" : "Clubs";
  const clubsTitle = language === "vi" ? "Theo dõi câu lạc bộ" : "Club Tracker";
  const clubsText =
    language === "vi"
      ? `${activeClubs.length} CLB đang tham gia / ${leadershipClubs.length} vai trò lãnh đạo.`
      : `${activeClubs.length} active clubs / ${leadershipClubs.length} leadership roles.`;
  const portfolioLabel = language === "vi" ? "Portfolio" : "Portfolio";
  const portfolioTitle = language === "vi" ? "Portfolio thành tựu" : "Achievement Portfolio";
  const readyPortfolioItems = safePortfolioItems.filter((item) => item.status === "ready" || item.status === "featured");
  const portfolioProgress = safePortfolioItems.length
    ? Math.round((readyPortfolioItems.length / safePortfolioItems.length) * 100)
    : 0;
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
    hasSemesters: safeSemesters.length > 0,
    hasCourses: safeCourses.length > 0,
    hasGoals: safeGoals.length > 0,
    hasGpa: gpa !== null,
    copy: t.nextActions
  });
  const activeSemesterId = safeCourses.find((course) => course.status === "in_progress")?.semester_id;
  const currentSemester =
    safeSemesters.find((semester) => semester.id === activeSemesterId) ||
    safeSemesters.find((semester) => semester.year_index === Number(profile.current_year || 1)) ||
    safeSemesters.at(-1);
  const semesterJourney = safeSemesters.map((semester) => {
    const semesterCourses = safeCourses.filter((course) => course.semester_id === semester.id);
    const completedCourseCount = semesterCourses.filter((course) => course.status === "completed").length;
    const progress = semesterCourses.length
      ? Math.round((completedCourseCount / semesterCourses.length) * 100)
      : 0;
    const status: "completed" | "current" | "planned" =
      semesterCourses.length > 0 && completedCourseCount === semesterCourses.length
        ? "completed"
        : semester.id === currentSemester?.id
          ? "current"
          : "planned";

    return {
      ...semester,
      courses: semesterCourses,
      progress,
      status
    };
  });
  let runningCredits = 0;
  let runningGradePoints = 0;
  const gpaTrend = safeCourses
    .filter((course) => course.status === "completed" && course.final_grade !== null)
    .reverse()
    .map((course) => {
      runningCredits += course.credits;
      runningGradePoints += course.credits * Number(course.final_grade);
      return Number((runningGradePoints / runningCredits).toFixed(2));
    })
    .slice(-7);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/12 bg-slate-950/72 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl xl:flex-row xl:items-center">
          <a href="/" className="flex items-center gap-3">
            <StudyGoalLogo priority />
            <div>
              <p className="font-display text-lg font-semibold text-white">Study Goal</p>
              <p className="text-sm text-slate-400">{t.appSubtitle}</p>
            </div>
          </a>
          <nav
            aria-label={language === "vi" ? "Điều hướng không gian học tập" : "Study workspace navigation"}
            className="flex flex-1 flex-wrap items-center gap-1 xl:justify-center"
          >
            <a className="workspace-nav-link" href="/grades">
              {t.grades}
            </a>
            <a className="workspace-nav-link" href="/roadmap">
              {t.roadmap}
            </a>
            <a className="workspace-nav-link" href="/goals">
              {t.goals}
            </a>
            <a className="workspace-nav-link" href="/skills">
              {t.skills}
            </a>
            <a className="workspace-nav-link" href="/clubs">
              {clubsLabel}
            </a>
            <a className="workspace-nav-link" href="/portfolio">
              {portfolioLabel}
            </a>
            <a className="workspace-nav-link" href="/career">
              {careerLabel}
            </a>
            <a className="workspace-nav-link" href="/profile">
              {t.profile}
            </a>
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <LanguageSwitcher language={language} label={t.languageLabel} />
            <SignOutButton label={t.signOut} />
          </div>
        </header>

        <section className="academic-grid relative mt-6 overflow-hidden rounded-[2rem] border border-white/12 bg-slate-950/48 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] lg:p-8">
          <div className="pointer-events-none absolute -left-20 top-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="relative grid gap-8 xl:grid-cols-[0.72fr_1.28fr] xl:items-stretch">
            <div className="flex flex-col justify-between">
              <div>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-300/18 bg-sky-300/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  {t.eyebrow}
                </div>
                <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl">
                  {t.welcome}, <span className="text-sky-100">{displayName}</span>.
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">{t.description}</p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <StudyContext
                  icon={GraduationCap}
                  label={profile.university || t.notSet}
                  value={profile.major || t.notSet}
                  tone="sky"
                />
                <StudyContext
                  icon={CalendarRange}
                  label={`${t.year} ${profile.current_year || 1}`}
                  value={`${safeSemesters.length}/${expectedSemesters} ${t.metricLabels.semesters.toLowerCase()}`}
                  tone="violet"
                />
              </div>
            </div>

            <AcademicPulse
              labels={t.pulse}
              currentGpa={gpa}
              projectedGpa={projectedGpa}
              targetGpa={targetGpa}
              gpaTrend={gpaTrend}
              creditProgress={creditProgress}
              completedCredits={completedCredits}
              targetCredits={targetCredits}
              activeGoals={activeGoals.length}
              skillProgress={skillProgress}
              readinessScore={readinessScore}
              healthy={Boolean(isProjectedHealthy)}
              unavailable={t.unavailable}
              creditsLabel={t.units.credits}
            />
          </div>
        </section>

        <SemesterJourney
          semesters={semesterJourney}
          labels={t.timeline}
          yearLabel={t.year}
          statusLabels={t.statusLabels}
        />

        <section className="mt-10">
          <SectionHeading
            eyebrow={t.workspace.eyebrow}
            title={t.workspace.title}
            description={t.workspace.description}
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
            <NextModule
              icon={Compass}
              title={
                language === "en"
                  ? `${targetYears}-${t.roadmapModule.yearUnit} ${t.roadmapModule.title}`
                  : `${t.roadmapModule.title} ${targetYears} ${t.roadmapModule.yearUnit}`
              }
              text={t.roadmapModule.text}
              href="/roadmap"
              tone="violet"
              span="feature"
              metric={`${roadmapCompletion}%`}
              progress={roadmapCompletion}
            />
            <NextModule
              icon={BookOpenCheck}
              title={t.modules.academicTitle}
              text={`${t.modules.academicText} ${safeCourses.length} ${t.units.courses} / ${completedCredits} ${t.units.credits}.`}
              href="/grades"
              tone="sky"
              span="primary"
              metric={`${completedCredits}/${targetCredits}`}
              progress={creditProgress}
            />
            <NextModule
              icon={Target}
              title={t.modules.goalsTitle}
              text={`${t.modules.goalsText} ${activeGoals.length} ${t.units.active} / ${completedGoals.length} ${t.units.completed}.`}
              href="/goals"
              tone="amber"
              span="default"
              metric={`${goalProgress}%`}
              progress={goalProgress}
            />
            <NextModule
              icon={BrainCircuit}
              title={t.modules.skillsTitle}
              text={`${t.modules.skillsText} ${safeSkills.length} ${t.skills.toLowerCase()} / ${skillProgress}%.`}
              href="/skills"
              tone="emerald"
              span="default"
              metric={`${skillProgress}%`}
              progress={skillProgress}
            />
            <NextModule
              icon={BriefcaseBusiness}
              title={careerTitle}
              text={careerText}
              href="/career"
              tone="orange"
              span="default"
              metric={`${readinessScore}/100`}
              progress={readinessScore}
            />
            <NextModule
              icon={UsersRound}
              title={clubsTitle}
              text={clubsText}
              href="/clubs"
              tone="cyan"
              span="half"
              metric={String(activeClubs.length)}
              progress={clubProgress}
            />
            <NextModule
              icon={Trophy}
              title={portfolioTitle}
              text={portfolioText}
              href="/portfolio"
              tone="rose"
              span="half"
              metric={String(readyPortfolioItems.length)}
              progress={portfolioProgress}
            />
          </div>
        </section>

        <section className="mt-10">
          <SectionHeading eyebrow={t.focusBoard.eyebrow} title={t.focusBoard.title} />
          <div className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-amber-300/20 bg-amber-300/[0.055] p-6">
              <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-amber-300/10 blur-3xl" />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-300/12 text-amber-100 ring-1 ring-amber-200/20">
                  <Lightbulb className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">{t.nextActions.title}</p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-white">{nextAction.title}</h2>
                <p className="mt-3 max-w-xl leading-7 text-slate-300">{nextAction.copy}</p>
                <a
                  href={nextAction.href}
                  className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-amber-100 px-5 text-sm font-semibold text-amber-950 transition-colors duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200"
                >
                  {nextAction.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <ListPanel title={t.weeklyFocus} empty={t.noFocus} icon={Clock3} tone="violet">
                {safeMilestones.slice(0, 4).map((milestone) => (
                  <div key={milestone.id} className="study-list-item">
                    <p className="font-semibold text-white">{milestone.title}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {t.sourceGoal}: {goalTitleById.get(milestone.goal_id) || t.goals}
                    </p>
                  </div>
                ))}
              </ListPanel>

              <ListPanel title={t.recentCourses} empty={t.noCourses} icon={BookOpenCheck} tone="sky">
                {safeCourses.slice(0, 4).map((course) => (
                  <div key={course.id} className="study-list-item flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{course.name}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {course.code || t.courseFallback} / {t.statusLabels[course.status as keyof typeof t.statusLabels] || course.status}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-sky-100">{course.final_grade ?? "-"}</span>
                  </div>
                ))}
              </ListPanel>

              <div className="md:col-span-2">
                <ListPanel title={t.activeGoalsTitle} empty={t.noGoals} icon={Flag} tone="amber">
                  {activeGoals.slice(0, 4).map((goal) => (
                    <div key={goal.id} className="study-list-item">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-white">{goal.title}</p>
                        <span className="text-sm font-semibold text-amber-100">{goal.progress}%</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                        <div className="h-full rounded-full bg-amber-300" style={{ width: `${goal.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </ListPanel>
              </div>
            </div>
          </div>
        </section>

        <section className="academic-grid relative mt-6 overflow-hidden rounded-[2rem] border border-orange-300/18 bg-orange-300/[0.045] p-6">
          <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-300/12 text-orange-100 ring-1 ring-orange-200/20">
                <BriefcaseBusiness className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">{t.northStar}</p>
                <p className="mt-2 max-w-4xl text-lg leading-8 text-slate-200">
                  {profile.career_goal || t.emptyCareerGoal}
                </p>
              </div>
            </div>
            <a
              href="/career"
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-orange-200/20 bg-orange-200/10 px-5 text-sm font-semibold text-orange-100 transition-colors duration-200 hover:bg-orange-200/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-200"
            >
              {careerLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
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

type AccentTone = "sky" | "violet" | "amber" | "emerald" | "orange" | "cyan" | "rose";

const accentStyles: Record<
  AccentTone,
  {
    card: string;
    icon: string;
    text: string;
    bar: string;
  }
> = {
  sky: {
    card: "border-sky-300/16 bg-sky-300/[0.045] hover:border-sky-300/34",
    icon: "bg-sky-300/10 text-sky-100 ring-sky-200/20",
    text: "text-sky-200",
    bar: "bg-sky-300"
  },
  violet: {
    card: "border-violet-300/16 bg-violet-300/[0.045] hover:border-violet-300/34",
    icon: "bg-violet-300/10 text-violet-100 ring-violet-200/20",
    text: "text-violet-200",
    bar: "bg-violet-300"
  },
  amber: {
    card: "border-amber-300/16 bg-amber-300/[0.045] hover:border-amber-300/34",
    icon: "bg-amber-300/10 text-amber-100 ring-amber-200/20",
    text: "text-amber-200",
    bar: "bg-amber-300"
  },
  emerald: {
    card: "border-emerald-300/16 bg-emerald-300/[0.045] hover:border-emerald-300/34",
    icon: "bg-emerald-300/10 text-emerald-100 ring-emerald-200/20",
    text: "text-emerald-200",
    bar: "bg-emerald-300"
  },
  orange: {
    card: "border-orange-300/16 bg-orange-300/[0.045] hover:border-orange-300/34",
    icon: "bg-orange-300/10 text-orange-100 ring-orange-200/20",
    text: "text-orange-200",
    bar: "bg-orange-300"
  },
  cyan: {
    card: "border-cyan-300/16 bg-cyan-300/[0.045] hover:border-cyan-300/34",
    icon: "bg-cyan-300/10 text-cyan-100 ring-cyan-200/20",
    text: "text-cyan-200",
    bar: "bg-cyan-300"
  },
  rose: {
    card: "border-rose-300/16 bg-rose-300/[0.045] hover:border-rose-300/34",
    icon: "bg-rose-300/10 text-rose-100 ring-rose-200/20",
    text: "text-rose-200",
    bar: "bg-rose-300"
  }
};

function StudyContext({
  label,
  value,
  icon: Icon,
  tone
}: {
  label: string;
  value: string;
  icon: typeof GraduationCap;
  tone: "sky" | "violet";
}) {
  const styles = accentStyles[tone];

  return (
    <div className={cn("rounded-2xl border p-4 backdrop-blur-sm", styles.card)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", styles.icon)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-1 truncate font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function AcademicPulse({
  labels,
  currentGpa,
  projectedGpa,
  targetGpa,
  gpaTrend,
  creditProgress,
  completedCredits,
  targetCredits,
  activeGoals,
  skillProgress,
  readinessScore,
  healthy,
  unavailable,
  creditsLabel
}: {
  labels: {
    eyebrow: string;
    title: string;
    description: string;
    onTrack: string;
    attention: string;
    gpaTrend: string;
    noTrend: string;
    projected: string;
    target: string;
    remaining: string;
    skillMomentum: string;
    activeGoals: string;
    careerReady: string;
  };
  currentGpa: number | null;
  projectedGpa: number | null;
  targetGpa: number | null;
  gpaTrend: number[];
  creditProgress: number;
  completedCredits: number;
  targetCredits: number;
  activeGoals: number;
  skillProgress: number;
  readinessScore: number;
  healthy: boolean;
  unavailable: string;
  creditsLabel: string;
}) {
  return (
    <div className="glass glass-elevated rounded-[2rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">{labels.eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-white">{labels.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{labels.description}</p>
        </div>
        <div
          className={cn(
            "inline-flex shrink-0 items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-semibold ring-1",
            healthy
              ? "bg-emerald-300/10 text-emerald-100 ring-emerald-200/20"
              : "bg-amber-300/10 text-amber-100 ring-amber-200/20"
          )}
        >
          <Activity className="h-3.5 w-3.5" aria-hidden="true" />
          {healthy ? labels.onTrack : labels.attention}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.72fr_1.28fr]">
        <div className="flex items-center gap-5 rounded-[1.5rem] border border-sky-300/14 bg-slate-950/52 p-4">
          <div
            className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full p-3"
            style={{
              background: `conic-gradient(rgb(125 211 252) ${creditProgress * 3.6}deg, rgba(51, 65, 85, 0.72) 0deg)`
            }}
            role="img"
            aria-label={`${creditProgress}%`}
          >
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full border border-white/8 bg-slate-950">
              <span className="font-display text-3xl font-semibold text-white">{creditProgress}%</span>
              <span className="mt-1 text-[11px] uppercase tracking-[0.12em] text-slate-500">{creditsLabel}</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">{completedCredits}/{targetCredits}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-white">{completedCredits} {creditsLabel}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {targetCredits - completedCredits > 0 ? targetCredits - completedCredits : 0} {labels.remaining}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/52 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-300">{labels.gpaTrend}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold text-white">{currentGpa ?? unavailable}</span>
                <span className="text-xs text-slate-500">
                  {projectedGpa ?? unavailable} {labels.projected} / {targetGpa ?? unavailable} {labels.target}
                </span>
              </div>
            </div>
            <BarChart3 className="h-5 w-5 text-violet-200" aria-hidden="true" />
          </div>
          <div className="mt-4">
            {gpaTrend.length > 0 ? (
              <GpaSparkline values={gpaTrend} label={labels.gpaTrend} />
            ) : (
              <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                {labels.noTrend}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <PulseMetric icon={Target} label={labels.activeGoals} value={String(activeGoals)} tone="amber" />
        <PulseMetric icon={BrainCircuit} label={labels.skillMomentum} value={`${skillProgress}%`} tone="emerald" />
        <PulseMetric icon={BriefcaseBusiness} label={labels.careerReady} value={`${readinessScore}/100`} tone="orange" />
      </div>
    </div>
  );
}

function GpaSparkline({ values, label }: { values: number[]; label: string }) {
  const chartValues = values.length === 1 ? [values[0], values[0]] : values;
  const points = chartValues
    .map((value, index) => {
      const x = (index / Math.max(1, chartValues.length - 1)) * 240;
      const y = 66 - (Math.max(0, Math.min(4.3, value)) / 4.3) * 54;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 240 72" className="h-20 w-full overflow-visible" role="img" aria-label={label}>
      <defs>
        <linearGradient id="gpa-line" x1="0" x2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      {[18, 36, 54].map((y) => (
        <line key={y} x1="0" x2="240" y1={y} y2={y} stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
      ))}
      <polyline points={points} fill="none" stroke="url(#gpa-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {chartValues.map((value, index) => {
        const [x, y] = points.split(" ")[index].split(",");
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="3.5" fill="#0f172a" stroke="#bae6fd" strokeWidth="2" />;
      })}
    </svg>
  );
}

function PulseMetric({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof GraduationCap;
  label: string;
  value: string;
  tone: AccentTone;
}) {
  const styles = accentStyles[tone];

  return (
    <div className={cn("rounded-2xl border p-4", styles.card)}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <Icon className={cn("h-4 w-4", styles.text)} aria-hidden="true" />
      </div>
      <p className="mt-3 font-display text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5 max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base leading-7 text-slate-400">{description}</p> : null}
    </div>
  );
}

function SemesterJourney({
  semesters,
  labels,
  yearLabel,
  statusLabels
}: {
  semesters: Array<
    Semester & {
      courses: Course[];
      progress: number;
      status: "completed" | "current" | "planned";
    }
  >;
  labels: {
    eyebrow: string;
    title: string;
    description: string;
    completed: string;
    current: string;
    planned: string;
    courses: string;
    empty: string;
  };
  yearLabel: string;
  statusLabels: Record<string, string>;
}) {
  const statusStyles = {
    completed: {
      label: labels.completed,
      badge: "bg-emerald-300/10 text-emerald-100 ring-emerald-200/18",
      dot: "bg-emerald-300",
      line: "bg-emerald-300"
    },
    current: {
      label: labels.current,
      badge: "bg-sky-300/10 text-sky-100 ring-sky-200/18",
      dot: "bg-sky-300",
      line: "bg-sky-300"
    },
    planned: {
      label: labels.planned,
      badge: "bg-slate-300/8 text-slate-300 ring-white/10",
      dot: "bg-slate-600",
      line: "bg-slate-600"
    }
  } as const;

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow={labels.eyebrow} title={labels.title} description={labels.description} />
        <a
          href="/roadmap"
          className="mb-5 inline-flex items-center gap-2 self-start text-sm font-semibold text-sky-200 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 sm:self-auto"
        >
          <MapIcon className="h-4 w-4" aria-hidden="true" />
          {labels.eyebrow}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>

      {semesters.length > 0 ? (
        <div className="academic-grid rounded-[2rem] border border-white/10 bg-slate-950/46 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {semesters.map((semester, index) => {
              const styles = statusStyles[semester.status];

              return (
                <a
                  key={semester.id}
                  href="/grades"
                  className={cn(
                    "group relative min-h-60 overflow-hidden rounded-[1.5rem] border p-5 transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                    semester.status === "current"
                      ? "border-sky-300/28 bg-sky-300/[0.075] shadow-[0_20px_60px_rgba(14,165,233,0.08)]"
                      : "border-white/10 bg-slate-950/62 hover:border-white/20 hover:bg-slate-900/72"
                  )}
                >
                  <div className={cn("absolute left-0 top-0 h-1", styles.line)} style={{ width: `${Math.max(8, semester.progress)}%` }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-950 font-display text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{yearLabel} {semester.year_index}</p>
                        <h3 className="mt-1 font-display text-lg font-semibold text-white">{semester.name}</h3>
                      </div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1", styles.badge)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                      {styles.label}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
                    <span>{semester.courses.length} {labels.courses}</span>
                    <span>{semester.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className={cn("h-full rounded-full", styles.line)} style={{ width: `${semester.progress}%` }} />
                  </div>

                  <div className="mt-5 space-y-2">
                    {semester.courses.slice(0, 3).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center gap-2 rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2 text-xs text-slate-300"
                        title={statusLabels[course.status] || course.status}
                      >
                        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", course.status === "completed" ? "bg-emerald-300" : course.status === "in_progress" ? "bg-sky-300" : "bg-slate-600")} />
                        <span className="truncate">{course.code || course.name}</span>
                      </div>
                    ))}
                    {semester.courses.length > 3 ? (
                      <p className="px-1 text-xs text-slate-500">+{semester.courses.length - 3} {labels.courses}</p>
                    ) : null}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      ) : (
        <a
          href="/grades"
          className="academic-grid flex min-h-48 items-center justify-center rounded-[2rem] border border-dashed border-sky-300/20 bg-sky-300/[0.035] p-6 text-center text-slate-400 transition-colors duration-200 hover:border-sky-300/38 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
        >
          <span>
            <CalendarDays className="mx-auto mb-3 h-6 w-6 text-sky-200" aria-hidden="true" />
            {labels.empty}
          </span>
        </a>
      )}
    </section>
  );
}

const moduleSpanStyles = {
  feature: "xl:col-span-7",
  primary: "xl:col-span-5",
  default: "xl:col-span-4",
  half: "xl:col-span-6"
} as const;

function NextModule({
  icon: Icon,
  title,
  text,
  href,
  tone,
  span,
  metric,
  progress
}: {
  icon: typeof GraduationCap;
  title: string;
  text: string;
  href: string;
  tone: AccentTone;
  span: keyof typeof moduleSpanStyles;
  metric: string;
  progress: number;
}) {
  const styles = accentStyles[tone];

  return (
    <a
      href={href}
      className={cn(
        "group relative flex min-h-56 flex-col overflow-hidden rounded-[1.5rem] border p-5 transition-[border-color,background-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
        styles.card,
        moduleSpanStyles[span]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl ring-1", styles.icon)}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="text-right">
          <p className={cn("font-display text-2xl font-semibold", styles.text)}>{metric}</p>
          <ArrowUpRight className={cn("ml-auto mt-1 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5", styles.text)} aria-hidden="true" />
        </div>
      </div>
      <div className="mt-auto pt-8">
        <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{text}</p>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-800/80">
          <div className={cn("h-full rounded-full", styles.bar)} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
        </div>
      </div>
    </a>
  );
}

function ListPanel({
  title,
  empty,
  children,
  icon: Icon,
  tone
}: {
  title: string;
  empty: string;
  children: ReactNode;
  icon: typeof GraduationCap;
  tone: AccentTone;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);
  const styles = accentStyles[tone];

  return (
    <div className={cn("h-full rounded-[1.5rem] border p-5", styles.card)}>
      <div className="mb-5 flex items-center gap-3">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl ring-1", styles.icon)}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
        {hasItems ? children : <p className="study-list-item text-sm text-slate-400">{empty}</p>}
      </div>
    </div>
  );
}

