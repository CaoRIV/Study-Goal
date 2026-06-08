import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GraduationCap, Trophy } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { PortfolioManager } from "@/components/portfolio/portfolio-manager";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const portfolioCopy = {
  en: {
    subtitle: "Achievement portfolio",
    dashboard: "Dashboard",
    roadmap: "Roadmap",
    grades: "Academic planner",
    goals: "Goals",
    skills: "Skills",
    clubs: "Clubs",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Portfolio System",
    title: "Turn university work into a compelling achievement portfolio.",
    description:
      "Collect projects, certificates, competitions, leadership, internships, publications, and evidence links in one place.",
    manager: {
      summary: {
        tracked: "Items tracked",
        ready: "Ready",
        featured: "Featured",
        linked: "Linked evidence"
      },
      form: {
        title: "Add portfolio item",
        titleLabel: "Title",
        titlePlaceholder: "NLP research poster, Kaggle project, club leadership impact",
        typeLabel: "Type",
        statusLabel: "Status",
        evidenceDateLabel: "Evidence date",
        urlLabel: "Evidence URL",
        urlPlaceholder: "GitHub, Drive, certificate, publication, demo link",
        descriptionLabel: "Description",
        descriptionPlaceholder: "What happened, what did you contribute, and why does it matter?",
        relationsTitle: "Connect evidence",
        courseLabel: "Related course",
        goalLabel: "Related goal",
        skillLabel: "Related skill",
        clubLabel: "Related club",
        noRelation: "No relation",
        submit: "Add item"
      },
      filters: {
        title: "Focus portfolio",
        search: "Search items, descriptions, or links",
        allTypes: "All types",
        allStatuses: "All statuses",
        noMatches: "No portfolio items match this view."
      },
      list: {
        title: "Evidence library",
        empty: "No portfolio items yet. Add your first proof of work.",
        evidenceDate: "Evidence date",
        links: "Connected to",
        open: "Open evidence",
        noUrl: "No URL",
        description: "Description"
      },
      actions: {
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        confirmDelete: "Delete this portfolio item?"
      },
      labels: {
        types: {
          project: "Project",
          research: "Research",
          certificate: "Certificate",
          competition: "Competition",
          leadership: "Leadership",
          internship: "Internship",
          publication: "Publication",
          club: "Club",
          skill: "Skill",
          course: "Course"
        },
        statuses: {
          draft: "Draft",
          ready: "Ready",
          featured: "Featured",
          archived: "Archived"
        }
      }
    }
  },
  vi: {
    subtitle: "Portfolio thành tựu",
    dashboard: "Bảng điều khiển",
    roadmap: "Lộ trình",
    grades: "Kế hoạch học tập",
    goals: "Mục tiêu",
    skills: "Kỹ năng",
    clubs: "CLB",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Hệ thống portfolio",
    title: "Biến thành quả đại học thành portfolio nổi bật.",
    description:
      "Thu thập dự án, chứng chỉ, cuộc thi, lãnh đạo, thực tập, công bố và đường dẫn minh chứng trong một nơi.",
    manager: {
      summary: {
        tracked: "Minh chứng đã lưu",
        ready: "Sẵn sàng",
        featured: "Nổi bật",
        linked: "Đã liên kết"
      },
      form: {
        title: "Thêm minh chứng",
        titleLabel: "Tiêu đề",
        titlePlaceholder: "Poster nghiên cứu NLP, dự án Kaggle, tác động lãnh đạo CLB",
        typeLabel: "Loại",
        statusLabel: "Trạng thái",
        evidenceDateLabel: "Ngày minh chứng",
        urlLabel: "Đường dẫn minh chứng",
        urlPlaceholder: "GitHub, Drive, chứng chỉ, bài báo, demo",
        descriptionLabel: "Mô tả",
        descriptionPlaceholder: "Điều gì đã xảy ra, bạn đóng góp gì, và vì sao nó quan trọng?",
        relationsTitle: "Liên kết minh chứng",
        courseLabel: "Môn học liên quan",
        goalLabel: "Mục tiêu liên quan",
        skillLabel: "Kỹ năng liên quan",
        clubLabel: "CLB liên quan",
        noRelation: "Không liên kết",
        submit: "Thêm minh chứng"
      },
      filters: {
        title: "Góc tập trung",
        search: "Tìm minh chứng, mô tả hoặc đường dẫn",
        allTypes: "Tất cả loại",
        allStatuses: "Tất cả trạng thái",
        noMatches: "Không có minh chứng nào khớp với chế độ xem này."
      },
      list: {
        title: "Thư viện minh chứng",
        empty: "Chưa có minh chứng portfolio. Hãy thêm thành quả đầu tiên.",
        evidenceDate: "Ngày minh chứng",
        links: "Liên kết với",
        open: "Mở minh chứng",
        noUrl: "Chưa có URL",
        description: "Mô tả"
      },
      actions: {
        edit: "Sửa",
        save: "Lưu",
        cancel: "Hủy",
        delete: "Xóa",
        confirmDelete: "Xóa minh chứng này?"
      },
      labels: {
        types: {
          project: "Dự án",
          research: "Nghiên cứu",
          certificate: "Chứng chỉ",
          competition: "Cuộc thi",
          leadership: "Lãnh đạo",
          internship: "Thực tập",
          publication: "Công bố",
          club: "CLB",
          skill: "Kỹ năng",
          course: "Môn học"
        },
        statuses: {
          draft: "Bản nháp",
          ready: "Sẵn sàng",
          featured: "Nổi bật",
          archived: "Lưu trữ"
        }
      }
    }
  }
} as const;

export default async function PortfolioPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = portfolioCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/portfolio");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const [{ data: items }, { data: courses }, { data: goals }, { data: skills }, { data: clubs }] = await Promise.all([
    supabase
      .from("portfolio_items")
      .select("id, user_id, title, type, description, url, status, evidence_date, related_course_id, related_goal_id, related_skill_id, related_club_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("courses")
      .select("id, code, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("goals")
      .select("id, title")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("skills")
      .select("id, name")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("clubs")
      .select("id, name, role")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/12 bg-slate-950/64 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
          <a href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-indigo-400 to-emerald-300 text-slate-950 shadow-glow-blue">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </span>
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
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/roadmap">
              {t.roadmap}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/grades">
              {t.grades}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/goals">
              {t.goals}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/skills">
              {t.skills}
            </a>
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/clubs">
              {t.clubs}
            </a>
            <SignOutButton label={t.signOut} />
          </div>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_0.55fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-200">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-5xl font-display text-5xl font-semibold leading-tight text-white">
              {t.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{t.description}</p>
          </div>
          <div className="rounded-[2rem] border border-amber-300/14 bg-amber-300/8 p-6 shadow-glow-emerald backdrop-blur-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/12 text-amber-100 ring-1 ring-amber-200/20">
              <Trophy className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm leading-6 text-amber-50/82">
              {language === "en"
                ? "Every strong application needs evidence. This is where Study Goal turns scattered work into a story."
                : "Mọi hồ sơ mạnh đều cần minh chứng. Đây là nơi Study Goal biến thành quả rời rạc thành một câu chuyện rõ ràng."}
            </p>
          </div>
        </section>

        <PortfolioManager
          userId={user.id}
          initialItems={items || []}
          courses={(courses || []).map((course) => ({ id: course.id, label: `${course.code || "Course"} - ${course.name}` }))}
          goals={(goals || []).map((goal) => ({ id: goal.id, label: goal.title }))}
          skills={(skills || []).map((skill) => ({ id: skill.id, label: skill.name }))}
          clubs={(clubs || []).map((club) => ({ id: club.id, label: `${club.name} - ${club.role}` }))}
          copy={t.manager}
        />
      </div>
    </main>
  );
}
