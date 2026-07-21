"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  Code2,
  Compass,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  LineChart,
  Medal,
  Network,
  Play,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { PublicFooter } from "@/components/navigation/public-footer";
import { PublicHeader } from "@/components/navigation/public-header";
import { LANGUAGE_COOKIE } from "@/lib/language";
import { cn } from "@/lib/utils";

type Language = "en" | "vi";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const content = {
  en: {
    nav: {
      roadmap: "Roadmap",
      skills: "Skills",
      features: "Features",
      analytics: "Analytics",
      cta: "Get Started",
      login: "Log in",
      register: "Sign up free",
      languageLabel: "Change language",
      english: "EN",
      vietnamese: "VI"
    },
    hero: {
      tagline: "Turn Your University Journey Into a Master Plan.",
      title: "Your Entire University Journey, Visualized.",
      copy:
        "Plan courses, track progress, manage projects and activities, build transferable skills, and prepare for your future—all in one place.",
      primaryCta: "Get Started",
      secondaryCta: "Watch Demo",
      stats: [
        ["4 years", "planned"],
        ["94%", "career ready"],
        ["41", "skills leveled"]
      ]
    },
    dashboard: {
      eyebrow: "Master Plan",
      title: "University OS",
      status: "On track",
      roadmap: "4-year roadmap",
      credits: "128 credits",
      gpaTracker: "GPA tracker",
      careerReadiness: "Career readiness",
      skillTree: "Personal skill map",
      researchProgress: "Project progress",
      researchSteps: ["Plan", "Build", "Present"]
    },
    problems: {
      eyebrow: "The hidden cost",
      title: "Most Students Drift Through University.",
      copy:
        "The problem is rarely ambition. It is the absence of a system that connects today's choices to a four-year outcome.",
      items: [
        {
          title: "Missed opportunities",
          copy: "Scholarships, placements, competitions, exchanges, and campus opportunities vanish without a living plan.",
          icon: Compass
        },
        {
          title: "Poor planning",
          copy: "Course prerequisites, credit loads, and graduation targets become painful when tracked too late.",
          icon: CalendarClock
        },
        {
          title: "Forgotten goals",
          copy: "Big ambitions get buried under weekly assignments when there is no operating rhythm.",
          icon: Target
        },
        {
          title: "Weak portfolios",
          copy: "Projects, clubs, leadership, practical work, and achievements stay scattered instead of becoming a coherent story.",
          icon: FolderKanban
        },
        {
          title: "Last-minute careers",
          copy: "Internship preparation starts too close to deadline, with missing evidence and shallow practice.",
          icon: BriefcaseBusiness
        }
      ]
    },
    solution: {
      eyebrow: "A student operating system",
      title: "Study Goal Helps You Stay Ahead.",
      copy: "Every academic, professional, and personal growth signal flows into one elegant dashboard.",
      commandCenter: "Command center",
      sprint: "Spring 2027 Sprint",
      aligned: "91% aligned",
      miniCards: ["Courses", "Projects", "Career"],
      portfolioEvidence: "Portfolio evidence collected",
      artifacts: "38 artifacts",
      items: [
        { label: "Academic Planning", value: "126 credits mapped", icon: BookOpenCheck },
        { label: "Project Tracking", value: "3 projects in motion", icon: FlaskConical },
        { label: "Club Participation", value: "2 leadership arcs", icon: UsersRound },
        { label: "Skill Development", value: "41 skills leveled", icon: BrainCircuit },
        { label: "Career Preparation", value: "86 readiness score", icon: Medal }
      ]
    },
    roadmap: {
      eyebrow: "Four-year roadmap",
      title: "See Every Semester Before It Happens.",
      copy:
        "A long-range timeline for courses, GPA, projects, activities, internships, and the graduation story you are building.",
      selected: "Selected chapter",
      metricLabels: {
        courses: "Courses",
        gpa: "GPA",
          research: "Projects",
        career: "Career"
      },
      years: [
        {
          year: "Year 1",
          title: "Foundation",
          gpa: "3.55",
          focus: "Core courses, clubs, study rhythm",
          stats: ["32 credits", "2 clubs", "4 portfolio notes"]
        },
        {
          year: "Year 2",
          title: "Direction",
          gpa: "3.71",
          focus: "Core expertise, practical skills, first projects",
          stats: ["64 credits", "3 projects", "6 skill proofs"]
        },
        {
          year: "Year 3",
          title: "Evidence",
          gpa: "3.82",
          focus: "Leadership, internships, major milestones",
          stats: ["96 credits", "2 internships", "1 capstone"]
        },
        {
          year: "Year 4",
          title: "Launch",
          gpa: "3.88",
          focus: "Graduate school, capstone, career story",
          stats: ["128 credits", "9 applications", "94 career score"]
        }
      ]
    },
    skills: {
      eyebrow: "Skills for every major",
      title: "Build a Skill Map That Reflects Your Own Path.",
      copy:
        "Whether you study business, health, engineering, arts, education, law, or technology, track the expertise and transferable skills that move you forward.",
      level: "Level",
      skills: [
        "Subject Expertise",
        "Communication",
        "Research & Analysis",
        "Digital Tools",
        "Creative Problem Solving",
        "Teamwork & Leadership",
        "Project Management",
        "Career Readiness"
      ]
    },
    skillNodes: [
      { name: "Expertise", level: 88, x: "8%", y: "52%" },
      { name: "Writing", level: 78, x: "29%", y: "24%" },
      { name: "Analysis", level: 72, x: "52%", y: "18%" },
      { name: "Presentation", level: 68, x: "76%", y: "34%" },
      { name: "Digital", level: 61, x: "69%", y: "70%" },
      { name: "Projects", level: 74, x: "42%", y: "72%" },
      { name: "Leadership", level: 65, x: "19%", y: "78%" },
      { name: "Career", level: 82, x: "88%", y: "58%" }
    ],
    features: {
      eyebrow: "Feature system",
      title: "Everything Ambitious Students Already Track, Rebuilt as One System.",
      items: [
        { title: "Academic Dashboard", icon: GraduationCap, text: "Courses, credits, GPA, prerequisites, and semester load in one command center." },
        { title: "Goal Management", icon: Target, text: "Turn graduation targets into weekly milestones with visible momentum." },
        { title: "Project Workspace", icon: FlaskConical, text: "Track assignments, research, creative work, field practice, and major project deadlines." },
        { title: "Club Tracker", icon: UsersRound, text: "Map participation, leadership roles, events, and portfolio-worthy impact." },
        { title: "Skill Map", icon: BrainCircuit, text: "Grow subject, digital, communication, leadership, and career skills with evidence attached." },
        { title: "Achievement Portfolio", icon: Trophy, text: "Collect proof across courses, projects, placements, activities, and leadership." },
        { title: "Career Planner", icon: BriefcaseBusiness, text: "Prepare internship targets, resumes, interviews, and application sprints." },
        { title: "Analytics Dashboard", icon: BarChart3, text: "Spot trends before they become risks with clear progress intelligence." }
      ]
    },
    analytics: {
      eyebrow: "Analytics",
      title: "Beautiful Charts for the Decisions That Shape Your Future.",
      copy:
        "Study Goal transforms scattered student activity into clear academic, project, goal, and career signals.",
      liveSignal: "Live university signal",
      cards: {
        gpa: "GPA Growth",
        credits: "Credit Completion",
        research: "Project Activity"
      },
      goalProgress: "Goal Progress",
      goalCopy: "Academic, portfolio, and career milestones",
      progressLabels: ["Academic", "Portfolio", "Career"],
      careerReadiness: "Career Readiness"
    },
    testimonials: {
      eyebrow: "Student outcomes",
      title: "Designed for Students Who Want More Than a Transcript.",
      items: [
        {
          quote:
            "Study Goal turned my semester planning from guesswork into a clear roadmap. I can connect courses, campus activities, and projects to the career I want.",
          name: "Maya Tran",
          role: "Business Administration, sophomore",
          result: "GPA from 3.42 to 3.78"
        },
        {
          quote:
            "I used to keep clinical practice, volunteer work, and internship preparation in separate apps. Now my portfolio grows as I learn.",
          name: "Jordan Ellis",
          role: "Nursing, junior",
          result: "2 internship offers"
        },
        {
          quote:
            "The four-year view changed how I think. I stopped reacting to deadlines and started designing the university story I wanted admissions teams to see.",
          name: "Ari Chen",
          role: "Architecture, senior",
          result: "Graduate applications ready 6 weeks early"
        }
      ]
    },
    finalCta: {
      eyebrow: "Start the master plan",
      titleLine1: "Don't Just Survive University.",
      titleLine2: "Master It.",
      copy:
        "Build the four-year operating system that turns classes, goals, skills, projects, and career preparation into one extraordinary portfolio.",
      cta: "Start Building Your Future"
    }
  },
  vi: {
    nav: {
      roadmap: "Lộ trình",
      skills: "Kỹ năng",
      features: "Tính năng",
      analytics: "Phân tích",
      cta: "Bắt đầu",
      login: "Đăng nhập",
      register: "Đăng ký miễn phí",
      languageLabel: "Đổi ngôn ngữ",
      english: "EN",
      vietnamese: "VI"
    },
    hero: {
      tagline: "Biến hành trình đại học của bạn thành một bản kế hoạch tổng thể.",
      title: "Toàn bộ hành trình đại học của bạn, được trực quan hóa.",
      copy:
        "Lập kế hoạch môn học, theo dõi tiến độ, quản lý dự án và hoạt động, xây dựng kỹ năng chuyển đổi và chuẩn bị cho tương lai — tất cả trong một nơi.",
      primaryCta: "Bắt đầu",
      secondaryCta: "Xem demo",
      stats: [
        ["4 năm", "đã lên kế hoạch"],
        ["94%", "sẵn sàng nghề nghiệp"],
        ["41", "kỹ năng đã nâng cấp"]
      ]
    },
    dashboard: {
      eyebrow: "Kế hoạch tổng thể",
      title: "Hệ điều hành đại học",
      status: "Đúng tiến độ",
      roadmap: "Lộ trình 4 năm",
      credits: "128 tín chỉ",
      gpaTracker: "Theo dõi GPA",
      careerReadiness: "Sẵn sàng nghề nghiệp",
      skillTree: "Bản đồ kỹ năng cá nhân",
      researchProgress: "Tiến độ dự án",
      researchSteps: ["Lập kế hoạch", "Thực hiện", "Trình bày"]
    },
    problems: {
      eyebrow: "Chi phí ẩn",
      title: "Phần lớn sinh viên trôi qua đại học mà không có định hướng.",
      copy:
        "Vấn đề hiếm khi nằm ở tham vọng. Vấn đề là thiếu một hệ thống kết nối lựa chọn hôm nay với kết quả bốn năm sau.",
      items: [
        {
          title: "Bỏ lỡ cơ hội",
          copy: "Học bổng, thực tập, cuộc thi, trao đổi và cơ hội trong trường dễ biến mất nếu không có một kế hoạch sống.",
          icon: Compass
        },
        {
          title: "Lập kế hoạch yếu",
          copy: "Môn tiên quyết, tải tín chỉ và mục tiêu tốt nghiệp trở nên khó kiểm soát khi theo dõi quá muộn.",
          icon: CalendarClock
        },
        {
          title: "Mục tiêu bị lãng quên",
          copy: "Tham vọng lớn bị vùi dưới bài tập hằng tuần khi không có nhịp vận hành rõ ràng.",
          icon: Target
        },
        {
          title: "Portfolio yếu",
          copy: "Dự án, câu lạc bộ, vai trò lãnh đạo, thực hành và thành tựu bị phân tán thay vì tạo thành một câu chuyện nhất quán.",
          icon: FolderKanban
        },
        {
          title: "Chuẩn bị nghề nghiệp quá muộn",
          copy: "Việc chuẩn bị thực tập thường bắt đầu sát hạn, thiếu minh chứng và thiếu luyện tập có chiều sâu.",
          icon: BriefcaseBusiness
        }
      ]
    },
    solution: {
      eyebrow: "Hệ điều hành dành cho sinh viên",
      title: "Study Goal giúp bạn luôn đi trước.",
      copy: "Mọi tín hiệu học tập, nghề nghiệp và phát triển cá nhân hội tụ trong một dashboard tinh gọn.",
      commandCenter: "Trung tâm điều khiển",
      sprint: "Sprint Xuân 2027",
      aligned: "91% đồng bộ mục tiêu",
      miniCards: ["Môn học", "Dự án", "Sự nghiệp"],
      portfolioEvidence: "Minh chứng portfolio đã thu thập",
      artifacts: "38 minh chứng",
      items: [
        { label: "Lập kế hoạch học tập", value: "126 tín chỉ đã map", icon: BookOpenCheck },
        { label: "Theo dõi dự án", value: "3 dự án đang triển khai", icon: FlaskConical },
        { label: "Tham gia câu lạc bộ", value: "2 lộ trình lãnh đạo", icon: UsersRound },
        { label: "Phát triển kỹ năng", value: "41 kỹ năng đã nâng cấp", icon: BrainCircuit },
        { label: "Chuẩn bị sự nghiệp", value: "86 điểm sẵn sàng", icon: Medal }
      ]
    },
    roadmap: {
      eyebrow: "Lộ trình bốn năm",
      title: "Nhìn thấy từng học kỳ trước khi nó diễn ra.",
      copy:
        "Một timeline dài hạn cho môn học, GPA, dự án, hoạt động, thực tập và câu chuyện tốt nghiệp bạn đang xây dựng.",
      selected: "Chặng đang chọn",
      metricLabels: {
        courses: "Môn học",
        gpa: "GPA",
          research: "Dự án",
        career: "Sự nghiệp"
      },
      years: [
        {
          year: "Năm 1",
          title: "Nền tảng",
          gpa: "3.55",
          focus: "Môn đại cương, câu lạc bộ, nhịp học tập",
          stats: ["32 tín chỉ", "2 câu lạc bộ", "4 ghi chú portfolio"]
        },
        {
          year: "Năm 2",
          title: "Định hướng",
          gpa: "3.71",
          focus: "Chuyên môn cốt lõi, kỹ năng thực hành, dự án đầu tiên",
          stats: ["64 tín chỉ", "3 dự án", "6 minh chứng kỹ năng"]
        },
        {
          year: "Năm 3",
          title: "Minh chứng",
          gpa: "3.82",
          focus: "Lãnh đạo, thực tập, cột mốc chuyên ngành",
          stats: ["96 tín chỉ", "2 kỳ thực tập", "1 đồ án lớn"]
        },
        {
          year: "Năm 4",
          title: "Bứt phá",
          gpa: "3.88",
          focus: "Cao học, đồ án tốt nghiệp, câu chuyện nghề nghiệp",
          stats: ["128 tín chỉ", "9 hồ sơ ứng tuyển", "94 điểm nghề nghiệp"]
        }
      ]
    },
    skills: {
      eyebrow: "Kỹ năng cho mọi ngành học",
      title: "Xây dựng bản đồ kỹ năng phản ánh con đường riêng của bạn.",
      copy:
        "Dù học kinh tế, sức khỏe, kỹ thuật, nghệ thuật, giáo dục, luật hay công nghệ, bạn đều có thể theo dõi chuyên môn và kỹ năng chuyển đổi cần cho tương lai.",
      level: "Cấp",
      skills: [
        "Chuyên môn ngành học",
        "Giao tiếp",
        "Nghiên cứu & phân tích",
        "Công cụ số",
        "Giải quyết vấn đề sáng tạo",
        "Làm việc nhóm & lãnh đạo",
        "Quản lý dự án",
        "Sẵn sàng nghề nghiệp"
      ]
    },
    skillNodes: [
      { name: "Chuyên môn", level: 88, x: "8%", y: "52%" },
      { name: "Viết", level: 78, x: "29%", y: "24%" },
      { name: "Phân tích", level: 72, x: "52%", y: "18%" },
      { name: "Thuyết trình", level: 68, x: "76%", y: "34%" },
      { name: "Công cụ số", level: 61, x: "69%", y: "70%" },
      { name: "Dự án", level: 74, x: "42%", y: "72%" },
      { name: "Lãnh đạo", level: 65, x: "19%", y: "78%" },
      { name: "Nghề nghiệp", level: 82, x: "88%", y: "58%" }
    ],
    features: {
      eyebrow: "Hệ thống tính năng",
      title: "Mọi thứ sinh viên tham vọng đã theo dõi, nay được xây lại thành một hệ thống.",
      items: [
        { title: "Dashboard học tập", icon: GraduationCap, text: "Môn học, tín chỉ, GPA, môn tiên quyết và tải học kỳ trong một trung tâm điều khiển." },
        { title: "Quản lý mục tiêu", icon: Target, text: "Biến mục tiêu tốt nghiệp thành các cột mốc hằng tuần với tiến độ rõ ràng." },
        { title: "Không gian dự án", icon: FlaskConical, text: "Theo dõi bài tập lớn, nghiên cứu, sản phẩm sáng tạo, thực hành thực địa và hạn hoàn thành." },
        { title: "Theo dõi câu lạc bộ", icon: UsersRound, text: "Ghi lại mức độ tham gia, vai trò lãnh đạo, sự kiện và tác động đáng đưa vào portfolio." },
        { title: "Bản đồ kỹ năng", icon: BrainCircuit, text: "Phát triển chuyên môn, công cụ số, giao tiếp, lãnh đạo và kỹ năng nghề nghiệp với minh chứng đi kèm." },
        { title: "Portfolio thành tựu", icon: Trophy, text: "Thu thập minh chứng từ môn học, dự án, thực tập, hoạt động và vai trò lãnh đạo." },
        { title: "Kế hoạch sự nghiệp", icon: BriefcaseBusiness, text: "Chuẩn bị mục tiêu thực tập, CV, phỏng vấn và các đợt ứng tuyển." },
        { title: "Dashboard phân tích", icon: BarChart3, text: "Nhìn thấy xu hướng trước khi chúng trở thành rủi ro bằng dữ liệu tiến độ rõ ràng." }
      ]
    },
    analytics: {
      eyebrow: "Phân tích",
      title: "Biểu đồ đẹp cho những quyết định định hình tương lai.",
      copy:
        "Study Goal biến hoạt động sinh viên rời rạc thành tín hiệu rõ ràng về học tập, dự án, mục tiêu và sự nghiệp.",
      liveSignal: "Tín hiệu đại học trực tiếp",
      cards: {
        gpa: "Tăng trưởng GPA",
        credits: "Hoàn thành tín chỉ",
        research: "Hoạt động dự án"
      },
      goalProgress: "Tiến độ mục tiêu",
      goalCopy: "Các cột mốc học tập, portfolio và sự nghiệp",
      progressLabels: ["Học tập", "Portfolio", "Sự nghiệp"],
      careerReadiness: "Sẵn sàng nghề nghiệp"
    },
    testimonials: {
      eyebrow: "Kết quả của sinh viên",
      title: "Dành cho sinh viên muốn nhiều hơn một bảng điểm.",
      items: [
        {
          quote:
            "Study Goal biến việc lập kế hoạch học kỳ của mình từ phỏng đoán thành một lộ trình rõ ràng. Mình có thể kết nối môn học, hoạt động và dự án với nghề nghiệp mong muốn.",
          name: "Maya Tran",
          role: "Quản trị Kinh doanh, sinh viên năm hai",
          result: "GPA từ 3.42 lên 3.78"
        },
        {
          quote:
            "Trước đây mình để ghi chép thực hành, hoạt động tình nguyện và chuẩn bị thực tập ở nhiều app khác nhau. Bây giờ portfolio được xây dần trong quá trình học.",
          name: "Jordan Ellis",
          role: "Điều dưỡng, sinh viên năm ba",
          result: "2 offer thực tập"
        },
        {
          quote:
            "Góc nhìn bốn năm thay đổi cách mình suy nghĩ. Mình ngừng chạy theo deadline và bắt đầu thiết kế câu chuyện đại học mà hội đồng tuyển sinh muốn thấy.",
          name: "Ari Chen",
          role: "Kiến trúc, sinh viên năm cuối",
          result: "Hồ sơ cao học sẵn sàng sớm 6 tuần"
        }
      ]
    },
    finalCta: {
      eyebrow: "Bắt đầu kế hoạch tổng thể",
      titleLine1: "Đừng chỉ cố sống sót qua đại học.",
      titleLine2: "Hãy làm chủ nó.",
      copy:
        "Xây dựng hệ điều hành bốn năm biến môn học, mục tiêu, kỹ năng, dự án và chuẩn bị nghề nghiệp thành một portfolio xuất sắc.",
      cta: "Bắt đầu xây dựng tương lai"
    }
  }
} as const;

type Content = (typeof content)[Language];

export default function Home() {
  const [activeYear, setActiveYear] = useState(1);
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("study-goal-language");
    const savedCookie = document.cookie
      .split("; ")
      .find((item) => item.startsWith(`${LANGUAGE_COOKIE}=`))
      ?.split("=")[1];

    if (savedLanguage === "en" || savedLanguage === "vi") {
      setLanguage(savedLanguage);
    } else if (savedCookie === "en" || savedCookie === "vi") {
      setLanguage(savedCookie);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(LANGUAGE_COOKIE, language);
    document.cookie = `${LANGUAGE_COOKIE}=${language}; path=/; max-age=31536000; SameSite=Lax`;
  }, [language]);

  const t = content[language];

  return (
    <MotionConfig reducedMotion="user">
    <main id="main-content" className="neo-landing relative overflow-hidden bg-neo-canvas text-neo-ink">
      <PublicHeader language={language} setLanguage={setLanguage} labels={t.nav} />
      <Hero t={t} />
      <ChapterProgress t={t} />
      <Problem t={t} />
      <Solution t={t} />
      <Roadmap activeYear={activeYear} setActiveYear={setActiveYear} t={t} />
      <SkillsShowcase t={t} />
      <Features t={t} />
      <Analytics t={t} />
      <Testimonials t={t} />
      <FinalCta t={t} />
      <PublicFooter language={language} />
    </main>
    </MotionConfig>
  );
}

function Hero({ t }: { t: Content }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial={false}
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-neo-sm border-2 border-neo-ink bg-neo-yellow px-4 py-2 text-sm font-black uppercase tracking-[0.12em] text-neo-ink shadow-neo-sm">
            <Zap className="h-4 w-4 shrink-0" aria-hidden="true" />
            {t.hero.tagline}
          </div>
          <h1 className="max-w-5xl font-display text-5xl font-black leading-[0.96] tracking-[-0.04em] text-balance text-neo-ink sm:text-6xl lg:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted text-pretty">
            {t.hero.copy}
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="/register">
                {t.hero.primaryCta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#demo">
                <Play className="h-4 w-4" aria-hidden="true" /> {t.hero.secondaryCta}
              </a>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {t.hero.stats.map(([value, label]) => (
              <div key={label} className="glass-soft rounded-neo-sm px-4 py-3">
                <div className="font-display text-2xl font-black text-neo-ink">{value}</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-neo-ink-muted">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={false}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative"
          id="demo"
        >
          <DashboardVisual t={t} />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardVisual({ t }: { t: Content }) {
  const reduceMotion = useReducedMotion();
  const floatMotion = reduceMotion ? {} : { y: [0, -8, 0] };
  const softPulse = reduceMotion ? {} : { opacity: [0.84, 1, 0.84] };
  const heroLayers = [
    {
      title: t.dashboard.gpaTracker,
      value: "3.82",
      detail: "+0.27",
      icon: LineChart,
      className: "left-2 top-10 sm:left-0"
    },
    {
      title: t.dashboard.careerReadiness,
      value: "86",
      detail: t.dashboard.status,
      icon: Medal,
      className: "right-1 top-4 sm:right-0"
    },
    {
      title: t.dashboard.skillTree,
      value: "41",
      detail: t.skills.level,
      icon: Network,
      className: "bottom-14 left-4 sm:left-8"
    },
    {
      title: t.solution.portfolioEvidence,
      value: "38",
      detail: t.solution.artifacts,
      icon: FolderKanban,
      className: "bottom-5 right-3 sm:right-8"
    }
  ];

  return (
    <div className="spatial-scene relative min-h-[590px] overflow-hidden rounded-neo-lg border-neo-strong border-neo-ink bg-neo-sky p-4 shadow-neo-xl sm:min-h-[640px]">
      <div className="scene-grid absolute inset-0" aria-hidden="true" />
      <div className="absolute right-8 top-8 h-24 w-24 rotate-6 border-2 border-neo-ink bg-neo-yellow" aria-hidden="true" />

      <motion.div
        className="absolute inset-x-5 bottom-8 sm:inset-x-12"
        animate={softPulse}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="study-plane study-plane-base rounded-neo-lg border-neo-strong border-neo-ink bg-neo-mint p-5 shadow-neo-lg">
          <div className="grid grid-cols-4 gap-3">
            {t.roadmap.years.map((item, index) => (
              <div key={item.year} className="rounded-neo-sm border-2 border-neo-ink bg-neo-white p-3 shadow-neo-xs">
                <div className="mb-3 h-1.5 rounded-full bg-cyan-900/10">
                  <div
                    className="h-full bg-neo-primary"
                    style={{ width: `${44 + index * 14}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-signal-cyan">{item.year}</div>
                <div className="mt-1 truncate text-xs font-semibold text-ink">{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="absolute left-6 right-6 top-20 sm:left-10 sm:right-10"
        animate={floatMotion}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="study-plane study-plane-main glass-elevated rounded-neo-lg p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-cyan">{t.dashboard.eyebrow}</p>
              <h2 className="font-display text-2xl font-semibold text-ink">{t.dashboard.title}</h2>
            </div>
            <div className="rounded-neo-sm border-2 border-neo-ink bg-neo-yellow px-3 py-1.5 text-sm font-bold text-neo-ink shadow-neo-xs">
              {t.dashboard.status}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.78fr]">
            <div className="rounded-neo border-2 border-neo-ink bg-neo-white p-4 shadow-neo-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{t.dashboard.roadmap}</span>
                <span className="text-xs text-ink-muted">{t.dashboard.credits}</span>
              </div>
              <div className="relative h-36 rounded-neo-sm border-2 border-neo-ink bg-neo-canvas p-4">
                <div className="absolute left-5 right-5 top-1/2 h-px bg-gradient-to-r from-cyan-300/20 via-cyan-500/55 to-cyan-300/20" />
                <div className="relative grid h-full grid-cols-4 gap-3">
                {t.roadmap.years.map((item, index) => (
                  <div key={item.year} className="flex flex-col justify-between rounded-neo-sm border-2 border-neo-ink bg-neo-white p-3 shadow-neo-xs">
                    <span className="text-xs text-ink-muted">{item.year}</span>
                    <span className="font-display text-lg font-semibold text-ink">{item.gpa}</span>
                    <span className="text-[11px] text-signal-cyan">{item.title}</span>
                  </div>
                ))}
                </div>
              </div>
            </div>

            <div className="rounded-neo border-2 border-neo-ink bg-neo-white p-4 shadow-neo-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-ink">{t.dashboard.skillTree}</span>
                <BrainCircuit className="h-4 w-4 text-signal-cyan" aria-hidden="true" />
              </div>
              <div className="relative h-36 overflow-hidden rounded-neo-sm border-2 border-neo-ink bg-neo-canvas">
                <div className="absolute left-[16%] top-[52%] h-px w-[66%] rotate-[-18deg] bg-cyan-300/30" />
                <div className="absolute left-[22%] top-[50%] h-px w-[58%] rotate-[26deg] bg-brand-green/28" />
                {t.skillNodes.slice(0, 6).map((node) => (
                  <div
                    key={node.name}
                    className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-coral text-[10px] font-black text-neo-ink shadow-neo-xs"
                    style={{ left: node.x, top: node.y }}
                  >
                    {node.name.split(" ")[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              [t.dashboard.gpaTracker, "3.82", "from-brand-cyan to-brand-bright"],
              [t.dashboard.careerReadiness, "86", "from-brand-green to-emerald-300"],
              [t.dashboard.researchProgress, "72%", "from-brand-orange to-orange-300"]
            ].map(([title, value, accent]) => (
              <MetricPanel key={title} title={title} value={value} accent={accent} />
            ))}
          </div>
        </div>
      </motion.div>

      {heroLayers.map((layer, index) => (
        <motion.div
          key={layer.title}
          className={cn("absolute hidden w-44 sm:block", layer.className)}
          animate={reduceMotion ? { opacity: 1 } : { y: [0, index % 2 === 0 ? -10 : 10, 0] }}
          transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="study-plane study-plane-card rounded-neo border-2 border-neo-ink bg-neo-white p-4 shadow-neo-sm">
            <div className="mb-3 flex items-center justify-between">
              <layer.icon className="h-4 w-4 text-signal-cyan" aria-hidden="true" />
              <span className="text-xs text-ink-muted">{layer.detail}</span>
            </div>
            <div className="font-display text-3xl font-semibold text-ink">{layer.value}</div>
            <div className="mt-1 text-xs font-medium text-ink-muted">{layer.title}</div>
          </div>
        </motion.div>
      ))}

      <div className="absolute inset-x-6 bottom-4 flex items-center justify-center gap-2 text-xs font-medium text-ink-muted">
        <span className="h-px w-12 bg-cyan-900/14" />
        {t.solution.commandCenter}
        <span className="h-px w-12 bg-cyan-900/14" />
      </div>
    </div>
  );
}

function MetricPanel({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="rounded-neo border-2 border-neo-ink bg-neo-white p-4 shadow-neo-sm">
      <div className="text-sm text-ink-muted">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="font-display text-3xl font-semibold text-ink">{value}</div>
        <div className="flex h-16 items-end gap-1">
          {[42, 52, 48, 65, 74, 86].map((height, index) => (
            <div
              key={index}
              className={cn("w-2 bg-neo-primary", accent)}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChapterProgress({ t }: { t: Content }) {
  const chapters = [
    { href: "#problem", label: t.problems.eyebrow, value: "01" },
    { href: "#solution", label: t.solution.eyebrow, value: "02" },
    { href: "#roadmap", label: t.roadmap.eyebrow, value: "03" },
    { href: "#skills", label: t.skills.eyebrow, value: "04" },
    { href: "#analytics", label: t.analytics.eyebrow, value: "05" }
  ];

  return (
    <section className="chapter-progress px-4 pb-10 sm:px-6 lg:px-8" aria-label="Study journey chapters">
      <div className="mx-auto max-w-7xl rounded-neo-lg border-neo-strong border-neo-ink bg-neo-paper p-2 shadow-neo-lg">
        <div className="grid gap-2 md:grid-cols-5">
          {chapters.map((chapter) => (
            <a
              key={chapter.href}
              href={chapter.href}
              className="group flex items-center gap-3 rounded-neo-sm border-2 border-transparent px-3 py-3 text-left transition-[background-color,border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-neo-ink hover:bg-neo-yellow hover:shadow-neo-xs focus-visible:outline-none focus-visible:shadow-neo-focus"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-primary font-display text-sm font-black text-white">
                {chapter.value}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{chapter.label}</span>
                <span className="mt-1 block h-1 rounded-full bg-cyan-900/10">
                  <span className="block h-full w-0 rounded-full bg-brand-cyan transition-all duration-300 group-hover:w-full" />
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      variants={fadeIn}
      transition={{ duration: 0.55 }}
      className="mb-12 max-w-3xl text-left"
    >
      <p className="mb-3 inline-flex rounded-neo-sm border-2 border-neo-ink bg-neo-yellow px-3 py-1.5 text-sm font-black uppercase tracking-[0.12em] text-neo-ink shadow-neo-xs">{eyebrow}</p>
      <h2 className="font-display text-4xl font-black tracking-[-0.035em] text-balance text-neo-ink sm:text-5xl">
        {title}
      </h2>
      {copy ? <p className="mt-5 max-w-2xl text-lg leading-8 text-neo-ink-muted text-pretty">{copy}</p> : null}
    </motion.div>
  );
}

function ChapterFrame({
  id,
  chapter,
  eyebrow,
  title,
  copy,
  nextHref,
  nextLabel,
  children
}: {
  id: string;
  chapter: string;
  eyebrow: string;
  title: string;
  copy?: string;
  nextHref: string;
  nextLabel: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="chapter-section px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="chapter-rail hidden lg:block">
          <div className="sticky top-28 rounded-neo border-neo-strong border-neo-ink bg-neo-sky p-4 shadow-neo-lg">
            <div className="font-display text-5xl font-black text-neo-ink">{chapter}</div>
            <div className="mt-4 h-1 bg-neo-ink" />
            <p className="mt-4 text-sm font-semibold text-ink">{eyebrow}</p>
            <a
              href={nextHref}
              className="mt-6 inline-flex w-full items-center justify-between rounded-neo-sm border-2 border-neo-ink bg-neo-primary px-3 py-2.5 text-sm font-black text-white shadow-neo-sm transition-[box-shadow,transform] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline-none focus-visible:shadow-neo-focus"
            >
              {nextLabel}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </aside>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="min-w-0"
        >
          <div className="mb-12 max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-3 rounded-neo-sm border-2 border-neo-ink bg-neo-yellow px-3 py-1.5 text-sm font-black text-neo-ink shadow-neo-xs">
              <span className="font-display text-base">{chapter}</span>
              <span className="h-1 w-1 rounded-full bg-brand-cyan/45" aria-hidden="true" />
              <span>{eyebrow}</span>
            </div>
            <h2 className="font-display text-4xl font-black tracking-[-0.035em] text-balance text-neo-ink sm:text-5xl">
              {title}
            </h2>
            {copy ? <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted text-pretty">{copy}</p> : null}
          </div>

          {children}

          <div className="mt-8 flex justify-start lg:hidden">
            <a
              href={nextHref}
              className="inline-flex items-center gap-2 rounded-neo-sm border-2 border-neo-ink bg-neo-primary px-4 py-3 text-sm font-black text-white shadow-neo-sm transition-[box-shadow,transform] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none focus-visible:outline-none focus-visible:shadow-neo-focus"
            >
              {nextLabel}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Problem({ t }: { t: Content }) {
  return (
    <ChapterFrame
      id="problem"
      chapter="01"
      eyebrow={t.problems.eyebrow}
      title={t.problems.title}
      copy={t.problems.copy}
      nextHref="#solution"
      nextLabel={t.solution.eyebrow}
    >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {t.problems.items.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              className="group rounded-neo border-2 border-neo-ink bg-neo-white p-5 shadow-neo-sm transition-[box-shadow,transform] hover:-translate-y-1 hover:shadow-neo"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-cyan/10 text-signal-cyan ring-1 ring-brand-cyan/16 transition-colors group-hover:bg-brand-cyan/14">
                <problem.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{problem.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{problem.copy}</p>
            </motion.div>
          ))}
        </div>
    </ChapterFrame>
  );
}

function Solution({ t }: { t: Content }) {
  return (
    <ChapterFrame
      id="solution"
      chapter="02"
      eyebrow={t.solution.eyebrow}
      title={t.solution.title}
      copy={t.solution.copy}
      nextHref="#roadmap"
      nextLabel={t.roadmap.eyebrow}
    >
        <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {t.solution.items.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="glass-soft flex items-center justify-between rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl ring-1",
                      index === 0 && "bg-brand-cyan/14 text-signal-cyan ring-brand-bright/22",
                      index === 1 && "bg-brand-green/14 text-signal-green ring-brand-green/24",
                      index === 2 && "bg-brand-coral/14 text-signal-red ring-brand-coral/24",
                      index === 3 && "bg-brand-orange/14 text-signal-orange ring-brand-orange/24",
                      index === 4 && "bg-brand-cream text-brand-deep-red ring-brand-coral-soft/44"
                    )}
                  >
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-ink">{item.label}</span>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    index === 0 && "text-signal-cyan",
                    index === 1 && "text-signal-green",
                    index === 2 && "text-signal-red",
                    index === 3 && "text-signal-orange",
                    index === 4 && "text-ink-muted"
                  )}
                >
                  {item.value}
                </span>
              </motion.div>
            ))}
          </div>
          <div className="glass rounded-[2rem] p-4">
            <div className="rounded-[1.5rem] border border-outline bg-surface-panel/90 p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">{t.solution.commandCenter}</p>
                  <h3 className="font-display text-2xl font-semibold text-ink">{t.solution.sprint}</h3>
                </div>
                <div className="rounded-full bg-cyan-300/10 px-3 py-1.5 text-sm text-signal-cyan ring-1 ring-cyan-200/18">
                  {t.solution.aligned}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {t.solution.miniCards.map((label, index) => (
                  <div key={label} className="rounded-2xl border border-outline bg-surface-warm p-4">
                    <div className="text-sm text-ink-muted">{label}</div>
              <div className="mt-3 h-28 rounded-xl bg-gradient-to-b from-brand-cyan/18 to-brand-coral-soft/38 p-3">
                      <div className="flex h-full items-end gap-2">
                        {[42, 68, 54, 83, 72].map((height, bar) => (
                          <div
                            key={bar}
                            className={cn(
                              "flex-1 rounded-t-md",
                              index === 0 && "bg-brand-cyan",
                              index === 1 && "bg-brand-bright",
                              index === 2 && "bg-brand-green"
                            )}
                            style={{ height: `${height}%`, opacity: 0.56 + bar * 0.08 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-outline bg-surface-warm p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-ink-muted">{t.solution.portfolioEvidence}</span>
                  <span className="text-ink">{t.solution.artifacts}</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-7 rounded-md border border-outline",
                        index % 3 === 0 && "bg-brand-cyan/45",
                        index % 3 === 1 && "bg-brand-green/40",
                        index % 3 === 2 && "bg-brand-coral/40"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
    </ChapterFrame>
  );
}

function Roadmap({
  activeYear,
  setActiveYear,
  t
}: {
  activeYear: number;
  setActiveYear: (year: number) => void;
  t: Content;
}) {
  const active = t.roadmap.years[activeYear];

  return (
    <ChapterFrame
      id="roadmap"
      chapter="03"
      eyebrow={t.roadmap.eyebrow}
      title={t.roadmap.title}
      copy={t.roadmap.copy}
      nextHref="#skills"
      nextLabel={t.skills.eyebrow}
    >
        <div className="glass rounded-neo-lg p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-neo border-2 border-neo-ink bg-neo-sky p-5">
              <div className="absolute left-8 right-8 top-1/2 h-px bg-gradient-to-r from-cyan-300/20 via-cyan-300/55 to-cyan-300/20" />
              <div className="relative grid h-full gap-4 sm:grid-cols-4">
                {t.roadmap.years.map((item, index) => (
                  <button
                    key={item.year}
                    type="button"
                    onClick={() => setActiveYear(index)}
                    className={cn(
                      "group flex min-h-72 cursor-pointer flex-col justify-between rounded-neo border-2 border-neo-ink p-4 text-left transition-[box-shadow,transform,background-color] focus-visible:outline-none focus-visible:shadow-neo-focus",
                      activeYear === index
                        ? "-translate-y-1 bg-neo-yellow shadow-neo-lg"
                        : "bg-neo-white shadow-neo-sm hover:-translate-y-0.5 hover:bg-neo-mint hover:shadow-neo"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-signal-cyan">{item.year}</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-coral ring-1 ring-outline">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="mt-8 font-display text-2xl font-semibold text-ink">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-ink-muted">{item.focus}</p>
                    </div>
                    <div className="space-y-2">
                      {item.stats.map((stat) => (
                        <div key={stat} className="flex items-center gap-2 text-sm text-ink-muted">
                          <CircleCheck className="h-4 w-4 text-signal-cyan" aria-hidden="true" />
                          {stat}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <motion.div
              key={`${active.year}-${active.title}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-neo border-neo-strong border-neo-ink bg-neo-paper p-6 shadow-neo-lg"
            >
              <p className="text-sm uppercase tracking-[0.18em] text-signal-cyan">{t.roadmap.selected}</p>
              <h3 className="mt-3 font-display text-4xl font-semibold text-ink">{active.year}: {active.title}</h3>
              <p className="mt-4 leading-7 text-ink-muted">{active.focus}</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  [t.roadmap.metricLabels.courses, active.stats[0]],
                  [t.roadmap.metricLabels.gpa, active.gpa],
                  [t.roadmap.metricLabels.research, active.stats[1]],
                  [t.roadmap.metricLabels.career, active.stats[2]]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-neo-sm border-2 border-neo-ink bg-neo-white p-4 shadow-neo-xs">
                    <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">{label}</div>
                    <div className="mt-2 font-display text-2xl font-semibold text-ink">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
    </ChapterFrame>
  );
}

function SkillsShowcase({ t }: { t: Content }) {
  return (
    <ChapterFrame
      id="skills"
      chapter="04"
      eyebrow={t.skills.eyebrow}
      title={t.skills.title}
      copy={t.skills.copy}
      nextHref="#analytics"
      nextLabel={t.analytics.eyebrow}
    >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass relative min-h-[460px] overflow-hidden rounded-neo-lg p-5">
            <div className="absolute left-[12%] top-[57%] h-px w-[72%] rotate-[-19deg] bg-brand-green/38" />
            <div className="absolute left-[15%] top-[60%] h-px w-[66%] rotate-[18deg] bg-brand-cyan/28" />
            <div className="absolute left-[28%] top-[52%] h-px w-[48%] rotate-[-49deg] bg-brand-coral/24" />
            {t.skillNodes.map((node, index) => (
              <motion.div
                key={node.name}
                initial={{ opacity: 0, scale: 0.82 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.38 }}
                className="absolute w-28 -translate-x-1/2 -translate-y-1/2"
                style={{ left: node.x, top: node.y }}
              >
                <div className="rounded-neo border-2 border-neo-ink bg-neo-mint p-3 text-center shadow-neo-sm">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-white text-neo-ink">
                    <Network className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-ink">{node.name}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-surface-cyan">
                    <div className="h-full rounded-full bg-gradient-to-r from-brand-green to-emerald-300" style={{ width: `${node.level}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3">
            {t.skills.skills.map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-neo border-2 border-neo-ink bg-neo-white p-4 shadow-neo-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-green/10 text-signal-green ring-1 ring-brand-green/18">
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-ink">{item}</span>
                </div>
                <span className="text-sm text-ink-muted">{t.skills.level} {index + 4}</span>
              </div>
            ))}
          </div>
        </div>
    </ChapterFrame>
  );
}

function Features({ t }: { t: Content }) {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow={t.features.eyebrow} title={t.features.title} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.features.items.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.42 }}
              className={cn(
                "group rounded-neo border-2 border-neo-ink p-5 shadow-neo-sm transition-[box-shadow,transform] hover:-translate-y-1 hover:shadow-neo-lg",
                index % 4 === 0 && "bg-neo-sky",
                index % 4 === 1 && "bg-neo-coral",
                index % 4 === 2 && "bg-neo-mint",
                index % 4 === 3 && "bg-neo-yellow"
              )}
            >
              <div
                className={cn(
                  "mb-6 flex h-12 w-12 items-center justify-center rounded-neo-sm border-2 border-neo-ink bg-neo-white text-neo-ink shadow-neo-xs"
                )}
              >
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-ink">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink-muted">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Analytics({ t }: { t: Content }) {
  return (
    <ChapterFrame
      id="analytics"
      chapter="05"
      eyebrow={t.analytics.eyebrow}
      title={t.analytics.title}
      copy={t.analytics.copy}
      nextHref="#start"
      nextLabel={t.finalCta.eyebrow}
    >
        <div className="grid gap-4 lg:grid-cols-5">
          <ChartCard title={t.analytics.cards.gpa} value="+0.33" className="lg:col-span-2" liveSignal={t.analytics.liveSignal} />
          <ChartCard title={t.analytics.cards.credits} value="74%" className="lg:col-span-3" variant="wide" liveSignal={t.analytics.liveSignal} />
          <ChartCard title={t.analytics.cards.research} value="18 logs" className="lg:col-span-2" variant="dots" liveSignal={t.analytics.liveSignal} />
          <div className="glass rounded-2xl p-5 lg:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-ink">{t.analytics.goalProgress}</h3>
                <p className="mt-1 text-sm text-ink-muted">{t.analytics.goalCopy}</p>
              </div>
              <LineChart className="h-5 w-5 text-signal-cyan" aria-hidden="true" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [t.analytics.progressLabels[0], 86, "from-brand-cyan to-brand-bright"],
                [t.analytics.progressLabels[1], 72, "from-brand-orange to-orange-300"],
                [t.analytics.progressLabels[2], 94, "from-brand-green to-emerald-300"]
              ].map(([label, value, color]) => (
                <div key={label as string} className="rounded-2xl bg-surface-panel/90 p-4 ring-1 ring-outline">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-muted">{label}</span>
                    <span className="text-ink">{value}%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-surface-cyan">
                    <div className={cn("h-full rounded-full bg-gradient-to-r", color as string)} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-brand-green/10 p-4 ring-1 ring-brand-green/20">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-signal-green">{t.analytics.careerReadiness}</span>
                <span className="font-display text-3xl font-semibold text-ink">91</span>
              </div>
            </div>
          </div>
        </div>
    </ChapterFrame>
  );
}

function ChartCard({
  title,
  value,
  liveSignal,
  variant = "bars",
  className
}: {
  title: string;
  value: string;
  liveSignal: string;
  variant?: "bars" | "wide" | "dots";
  className?: string;
}) {
  return (
    <div className={cn("glass min-h-64 rounded-2xl p-5", className)}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-muted">{liveSignal}</p>
        </div>
        <span className="font-display text-2xl font-semibold text-signal-cyan">{value}</span>
      </div>
      {variant === "dots" ? (
        <div className="grid grid-cols-9 gap-2">
          {Array.from({ length: 54 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-md",
                index % 5 === 0 ? "bg-brand-coral/80" : index % 3 === 0 ? "bg-brand-green/65" : "bg-brand-cyan/24"
              )}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-end gap-2">
          {[38, 44, 51, 48, 63, 70, 74, 81, 88, 92, 86, 95].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col justify-end">
              <div
                className={cn(
                  "rounded-t-lg bg-gradient-to-t",
                  variant === "wide" ? "from-brand-cyan to-brand-bright" : "from-cyan-400 to-brand-bright"
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Testimonials({ t }: { t: Content }) {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow={t.testimonials.eyebrow} title={t.testimonials.title} />
        <div className="grid gap-4 lg:grid-cols-3">
          {t.testimonials.items.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.45 }}
              className="cream-panel rounded-2xl p-6"
            >
              <div className="mb-6 flex items-center gap-1 text-signal-red">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Sparkles key={star} className="h-4 w-4" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-lg leading-8 text-brand-deep-red/90 text-pretty">&quot;{testimonial.quote}&quot;</blockquote>
              <figcaption className="mt-7 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-brand-deep-red">{testimonial.name}</div>
                  <div className="mt-1 text-sm text-brand-deep-red/70">{testimonial.role}</div>
                </div>
                <div className="rounded-full bg-brand-coral-soft px-3 py-1.5 text-xs font-semibold text-brand-deep-red ring-1 ring-brand-coral/30">
                  {testimonial.result}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta({ t }: { t: Content }) {
  return (
    <section id="start" className="px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass glass-elevated relative overflow-hidden rounded-neo-lg bg-neo-yellow px-6 py-16 text-center sm:px-10 lg:py-24">
          <div className="absolute -right-8 -top-8 h-32 w-32 rotate-12 border-neo-strong border-neo-ink bg-neo-coral" />
          <div className="relative mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-signal-orange">{t.finalCta.eyebrow}</p>
            <h2 className="font-display text-5xl font-semibold leading-tight tracking-normal text-balance text-ink sm:text-6xl">
              {t.finalCta.titleLine1}
              <span className="block text-signal-cyan">{t.finalCta.titleLine2}</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
              {t.finalCta.copy}
            </p>
            <Button asChild size="lg" className="mt-9">
              <a href="/register">
                {t.finalCta.cta} <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
