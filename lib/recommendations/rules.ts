import {
  calculateCompletedCredits,
  calculateCreditProgress,
  calculateGpa,
  calculateProjectedGpa
} from "@/lib/calculations/academic";
import { calculateCareerReadiness } from "@/lib/calculations/career";
import type { Language } from "@/lib/language";

export type RecommendationPriority = "high" | "medium" | "low";
export type RecommendationCategory =
  | "academic"
  | "goals"
  | "skills"
  | "portfolio"
  | "career"
  | "clubs";

export type Recommendation = {
  id: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  title: string;
  summary: string;
  action: string;
  href: string;
  signal: string;
};

export type RecommendationProfile = {
  full_name: string | null;
  major: string | null;
  current_year: number | null;
  academic_year_target: number | null;
  target_gpa: number | null;
  graduation_credit_target: number | null;
  career_goal: string | null;
};

export type RecommendationCourse = {
  id: string;
  name: string;
  credits: number;
  target_grade: number | null;
  final_grade: number | null;
  status: string;
};

export type RecommendationSemester = {
  id: string;
  year_index: number;
  term: string;
};

export type RecommendationGoal = {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
  priority: string;
  target_date: string | null;
};

export type RecommendationMilestone = {
  id: string;
  goal_id: string;
  title: string;
  due_date: string | null;
  status: string;
};

export type RecommendationSkill = {
  id: string;
  name: string;
  category: string;
  level: number;
  target_level: number;
  evidence_url: string | null;
  status: string;
};

export type RecommendationClub = {
  id: string;
  status: string;
  is_leadership: boolean;
};

export type RecommendationPortfolioItem = {
  id: string;
  status: string;
  type: string;
  url: string | null;
  related_course_id: string | null;
  related_goal_id: string | null;
  related_skill_id: string | null;
  related_club_id: string | null;
};

export type RecommendationCareerReadiness = {
  resume_status: string;
  linkedin_status: string;
  github_status: string;
  portfolio_status: string;
  interview_practice_count: number;
  networking_contacts_count: number;
  target_role: string | null;
  target_industry: string | null;
  next_review_date: string | null;
};

export type RecommendationCareerTarget = {
  company: string;
  role: string;
  stage: string;
  deadline: string | null;
};

export type RecommendationInput = {
  profile: RecommendationProfile | null;
  semesters: RecommendationSemester[];
  courses: RecommendationCourse[];
  goals: RecommendationGoal[];
  milestones: RecommendationMilestone[];
  skills: RecommendationSkill[];
  clubs: RecommendationClub[];
  portfolioItems: RecommendationPortfolioItem[];
  careerReadiness: RecommendationCareerReadiness | null;
  careerTargets: RecommendationCareerTarget[];
};

type Copy = {
  signal: Record<RecommendationCategory, string>;
  actions: {
    openGrades: string;
    openGoals: string;
    openSkills: string;
    openPortfolio: string;
    openCareer: string;
    openClubs: string;
  };
  recs: Record<
    string,
    {
      title: string;
      summary: string;
    }
  >;
};

const copy: Record<Language, Copy> = {
  en: {
    signal: {
      academic: "Academic signal",
      goals: "Goal signal",
      skills: "Skill signal",
      portfolio: "Portfolio signal",
      career: "Career signal",
      clubs: "Leadership signal"
    },
    actions: {
      openGrades: "Open academic planner",
      openGoals: "Open goals",
      openSkills: "Open skill tree",
      openPortfolio: "Open portfolio",
      openCareer: "Open career readiness",
      openClubs: "Open clubs"
    },
    recs: {
      createSemester: {
        title: "Create your first semester",
        summary: "Your roadmap needs at least one semester before Study Goal can understand your academic pace."
      },
      addCourse: {
        title: "Add your first course",
        summary: "Courses, credits, and grades unlock GPA prediction, credit progress, and better weekly recommendations."
      },
      gpaRisk: {
        title: "Your GPA needs attention",
        summary: "Your projected GPA is below your target. Review active courses and set realistic target grades this week."
      },
      creditLag: {
        title: "Your credit pace may be behind",
        summary: "Completed credits are behind the pace expected for your current study year. Re-check your semester plan."
      },
      noGoals: {
        title: "Create one active goal",
        summary: "The dashboard needs at least one active goal to connect your academic work with long-term outcomes."
      },
      urgentGoal: {
        title: "Review a goal deadline",
        summary: "One of your active goals is close to its target date. Break it into a concrete milestone before the week ends."
      },
      urgentMilestone: {
        title: "Finish the nearest milestone",
        summary: "A milestone is due soon or already overdue. Handle it before it turns into last-minute work."
      },
      noSkills: {
        title: "Start your skill tree",
        summary: "Add the core skills for your track so the system can show growth beyond GPA."
      },
      skillEvidence: {
        title: "Attach evidence to your strongest skill",
        summary: "A high-level skill without proof is hard to use in a portfolio. Link a project, paper, or GitHub artifact."
      },
      portfolioThin: {
        title: "Turn work into portfolio evidence",
        summary: "You have fewer than three ready portfolio items. Convert courses, clubs, or skills into proof."
      },
      careerProfile: {
        title: "Strengthen your career readiness profile",
        summary: "CV, LinkedIn, GitHub, and portfolio status strongly affect readiness. Move one item to ready."
      },
      careerPipeline: {
        title: "Add target opportunities",
        summary: "A career plan needs real companies or programs to aim at. Add at least three active targets."
      },
      interviewPractice: {
        title: "Practice interviews before applications heat up",
        summary: "Your opportunity pipeline is active, but interview practice is still low. Schedule a mock session."
      },
      noClub: {
        title: "Add a leadership or club signal",
        summary: "Club work can become strong portfolio evidence. Track one club, role, or initiative."
      },
      weeklyReview: {
        title: "Run a weekly Study Goal review",
        summary: "Your core system is active. Review grades, goals, skills, portfolio, and career targets once this week."
      }
    }
  },
  vi: {
    signal: {
      academic: "Tín hiệu học tập",
      goals: "Tín hiệu mục tiêu",
      skills: "Tín hiệu kỹ năng",
      portfolio: "Tín hiệu portfolio",
      career: "Tín hiệu sự nghiệp",
      clubs: "Tín hiệu lãnh đạo"
    },
    actions: {
      openGrades: "Mở kế hoạch học tập",
      openGoals: "Mở mục tiêu",
      openSkills: "Mở cây kỹ năng",
      openPortfolio: "Mở portfolio",
      openCareer: "Mở sẵn sàng nghề nghiệp",
      openClubs: "Mở câu lạc bộ"
    },
    recs: {
      createSemester: {
        title: "Tạo học kỳ đầu tiên",
        summary: "Lộ trình cần ít nhất một học kỳ để Study Goal hiểu được nhịp học tập của bạn."
      },
      addCourse: {
        title: "Thêm môn học đầu tiên",
        summary: "Môn học, tín chỉ và điểm số sẽ mở khóa dự báo GPA, tiến độ tín chỉ và gợi ý tuần tốt hơn."
      },
      gpaRisk: {
        title: "GPA của bạn cần chú ý",
        summary: "GPA dự kiến đang thấp hơn mục tiêu. Hãy xem lại các môn đang học và đặt điểm mục tiêu thực tế trong tuần này."
      },
      creditLag: {
        title: "Tiến độ tín chỉ có thể đang chậm",
        summary: "Số tín chỉ hoàn thành đang thấp hơn nhịp dự kiến theo năm học hiện tại. Hãy rà soát lại kế hoạch học kỳ."
      },
      noGoals: {
        title: "Tạo một mục tiêu đang hoạt động",
        summary: "Dashboard cần ít nhất một mục tiêu đang làm để kết nối việc học hằng ngày với kết quả dài hạn."
      },
      urgentGoal: {
        title: "Rà soát hạn mục tiêu",
        summary: "Một mục tiêu đang gần đến ngày hạn. Hãy chia nó thành cột mốc cụ thể trước khi hết tuần."
      },
      urgentMilestone: {
        title: "Hoàn thành cột mốc gần nhất",
        summary: "Một cột mốc sắp đến hạn hoặc đã quá hạn. Xử lý sớm để tránh dồn việc vào phút cuối."
      },
      noSkills: {
        title: "Bắt đầu cây kỹ năng",
        summary: "Thêm các kỹ năng cốt lõi cho định hướng của bạn để hệ thống theo dõi được sự phát triển ngoài GPA."
      },
      skillEvidence: {
        title: "Gắn minh chứng cho kỹ năng mạnh nhất",
        summary: "Kỹ năng cấp cao nhưng không có minh chứng sẽ khó dùng trong portfolio. Hãy liên kết dự án, bài nghiên cứu hoặc GitHub."
      },
      portfolioThin: {
        title: "Biến thành quả thành minh chứng portfolio",
        summary: "Bạn đang có ít hơn ba mục portfolio sẵn sàng. Hãy chuyển môn học, CLB hoặc kỹ năng thành bằng chứng cụ thể."
      },
      careerProfile: {
        title: "Tăng độ sẵn sàng nghề nghiệp",
        summary: "CV, LinkedIn, GitHub và portfolio ảnh hưởng lớn đến điểm sẵn sàng. Hãy đưa một mục lên trạng thái sẵn sàng."
      },
      careerPipeline: {
        title: "Thêm cơ hội mục tiêu",
        summary: "Kế hoạch sự nghiệp cần công ty hoặc chương trình cụ thể để nhắm tới. Hãy thêm ít nhất ba cơ hội đang hoạt động."
      },
      interviewPractice: {
        title: "Luyện phỏng vấn trước khi ứng tuyển mạnh",
        summary: "Pipeline cơ hội đã có tín hiệu, nhưng số buổi luyện phỏng vấn còn thấp. Hãy đặt lịch một buổi mock interview."
      },
      noClub: {
        title: "Thêm tín hiệu CLB hoặc lãnh đạo",
        summary: "Hoạt động CLB có thể trở thành minh chứng portfolio tốt. Hãy theo dõi một CLB, vai trò hoặc sáng kiến."
      },
      weeklyReview: {
        title: "Chạy review Study Goal hằng tuần",
        summary: "Hệ thống lõi đã hoạt động. Hãy rà soát điểm, mục tiêu, kỹ năng, portfolio và cơ hội nghề nghiệp trong tuần này."
      }
    }
  }
};

export function createRuleRecommendations(
  input: RecommendationInput,
  language: Language
): Recommendation[] {
  const c = copy[language];
  const recommendations: Recommendation[] = [];
  const completedCredits = calculateCompletedCredits(input.courses);
  const targetCredits = Number(input.profile?.graduation_credit_target || 128);
  const creditProgress = calculateCreditProgress(completedCredits, targetCredits);
  const currentGpa = calculateGpa(input.courses);
  const targetGpa = input.profile?.target_gpa ?? null;
  const projectedGpa = calculateProjectedGpa(input.courses, targetGpa);
  const targetYears = Number(input.profile?.academic_year_target || 4);
  const currentYear = Number(input.profile?.current_year || 1);
  const expectedCreditProgress = Math.min(100, Math.round((currentYear / Math.max(1, targetYears)) * 100));
  const activeGoals = input.goals.filter((goal) => !["completed", "paused"].includes(goal.status));
  const readyPortfolioItems = input.portfolioItems.filter((item) => ["ready", "featured"].includes(item.status));
  const activeCareerTargets = input.careerTargets.filter((target) =>
    ["preparing", "applied", "interviewing", "offer"].includes(target.stage)
  );
  const readinessScore = calculateCareerReadiness(input.careerReadiness, input.careerTargets);

  function add(
    id: string,
    category: RecommendationCategory,
    priority: RecommendationPriority,
    href: string,
    action: string
  ) {
    recommendations.push({
      id,
      category,
      priority,
      title: c.recs[id].title,
      summary: c.recs[id].summary,
      action,
      href,
      signal: c.signal[category]
    });
  }

  if (input.semesters.length === 0) {
    add("createSemester", "academic", "high", "/grades", c.actions.openGrades);
  }

  if (input.courses.length === 0) {
    add("addCourse", "academic", input.semesters.length === 0 ? "medium" : "high", "/grades", c.actions.openGrades);
  }

  if (targetGpa && projectedGpa && projectedGpa < targetGpa - 0.12) {
    add("gpaRisk", "academic", projectedGpa < targetGpa - 0.35 ? "high" : "medium", "/grades", c.actions.openGrades);
  }

  if (input.courses.length > 0 && creditProgress + 10 < expectedCreditProgress) {
    add("creditLag", "academic", "medium", "/roadmap", c.actions.openGrades);
  }

  if (activeGoals.length === 0) {
    add("noGoals", "goals", "high", "/goals", c.actions.openGoals);
  }

  const urgentGoal = activeGoals.find((goal) => isWithinDays(goal.target_date, 14));
  if (urgentGoal) {
    add("urgentGoal", "goals", isOverdue(urgentGoal.target_date) ? "high" : "medium", "/goals", c.actions.openGoals);
  }

  const urgentMilestone = input.milestones.find((milestone) => milestone.status !== "completed" && isWithinDays(milestone.due_date, 7));
  if (urgentMilestone) {
    add("urgentMilestone", "goals", isOverdue(urgentMilestone.due_date) ? "high" : "medium", "/goals", c.actions.openGoals);
  }

  if (input.skills.length === 0) {
    add("noSkills", "skills", "medium", "/skills", c.actions.openSkills);
  }

  const strongSkillWithoutEvidence = input.skills.find(
    (skill) => skill.level >= Math.max(3, Math.ceil(skill.target_level * 0.7)) && !skill.evidence_url
  );
  if (strongSkillWithoutEvidence) {
    add("skillEvidence", "skills", "medium", "/skills", c.actions.openSkills);
  }

  if (readyPortfolioItems.length < 3) {
    add("portfolioThin", "portfolio", readyPortfolioItems.length === 0 ? "high" : "medium", "/portfolio", c.actions.openPortfolio);
  }

  if (readinessScore < 55) {
    add("careerProfile", "career", readinessScore < 25 ? "high" : "medium", "/career", c.actions.openCareer);
  }

  if (input.careerTargets.length < 3) {
    add("careerPipeline", "career", "medium", "/career", c.actions.openCareer);
  }

  if (activeCareerTargets.length > 0 && Number(input.careerReadiness?.interview_practice_count || 0) < 3) {
    add("interviewPractice", "career", "medium", "/career", c.actions.openCareer);
  }

  if (input.clubs.length === 0) {
    add("noClub", "clubs", "low", "/clubs", c.actions.openClubs);
  }

  if (recommendations.length === 0) {
    add("weeklyReview", "goals", "low", "/dashboard", c.actions.openGoals);
  }

  return sortRecommendations(dedupeRecommendations(recommendations)).slice(0, 8);
}

export function buildOllamaStudyContext(input: RecommendationInput, recommendations: Recommendation[], language: Language) {
  const completedCredits = calculateCompletedCredits(input.courses);
  const targetCredits = Number(input.profile?.graduation_credit_target || 128);
  const currentGpa = calculateGpa(input.courses);
  const projectedGpa = calculateProjectedGpa(input.courses, input.profile?.target_gpa ?? null);
  const readinessScore = calculateCareerReadiness(input.careerReadiness, input.careerTargets);

  return [
    `Language: ${language === "vi" ? "Vietnamese" : "English"}`,
    `Student: ${input.profile?.full_name || "Student"}`,
    `Major: ${input.profile?.major || "Not set"}`,
    `Current year: ${input.profile?.current_year || "Not set"} / Target years: ${input.profile?.academic_year_target || 4}`,
    `Career goal: ${input.profile?.career_goal || "Not set"}`,
    `Current GPA: ${currentGpa ?? "N/A"} / Projected GPA: ${projectedGpa ?? "N/A"} / Target GPA: ${input.profile?.target_gpa ?? "N/A"}`,
    `Credits: ${completedCredits}/${targetCredits}`,
    `Courses tracked: ${input.courses.length}`,
    `Active goals: ${input.goals.filter((goal) => !["completed", "paused"].includes(goal.status)).length}`,
    `Skills tracked: ${input.skills.length}`,
    `Ready portfolio items: ${input.portfolioItems.filter((item) => ["ready", "featured"].includes(item.status)).length}`,
    `Career readiness score: ${readinessScore}/100`,
    `Career targets: ${input.careerTargets.length}`,
    `Rule recommendations: ${recommendations.map((rec) => `${rec.priority}: ${rec.title}`).join("; ")}`
  ].join("\n");
}

function isWithinDays(dateValue: string | null, days: number) {
  const diff = daysUntil(dateValue);
  return diff !== null && diff <= days;
}

function isOverdue(dateValue: string | null) {
  const diff = daysUntil(dateValue);
  return diff !== null && diff < 0;
}

function daysUntil(dateValue: string | null) {
  if (!dateValue) {
    return null;
  }

  const now = new Date();
  const target = new Date(`${dateValue}T23:59:59`);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

function dedupeRecommendations(recommendations: Recommendation[]) {
  const seen = new Set<string>();
  return recommendations.filter((recommendation) => {
    if (seen.has(recommendation.id)) {
      return false;
    }
    seen.add(recommendation.id);
    return true;
  });
}

function sortRecommendations(recommendations: Recommendation[]) {
  const weight: Record<RecommendationPriority, number> = {
    high: 3,
    medium: 2,
    low: 1
  };

  return [...recommendations].sort((a, b) => weight[b.priority] - weight[a.priority]);
}
