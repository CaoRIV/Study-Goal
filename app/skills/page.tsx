import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrainCircuit, GraduationCap } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { SkillsManager } from "@/components/skills/skills-manager";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const skillsCopy = {
  en: {
    subtitle: "Skill tree",
    dashboard: "Dashboard",
    roadmap: "Roadmap",
    grades: "Academic planner",
    goals: "Goals",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "AI Student Mode",
    title: "Build a visible skill tree for your university portfolio.",
    description:
      "Track programming, machine learning, research, Kaggle, GitHub, and career skills with levels, evidence links, and notes.",
    manager: {
      summary: {
        tracked: "Skills tracked",
        mastered: "Mastered",
        averageProgress: "Average progress",
        evidence: "Evidence links"
      },
      form: {
        title: "Add skill node",
        nameLabel: "Skill name",
        namePlaceholder: "PyTorch, NLP paper reading, Kaggle notebooks",
        categoryLabel: "Category",
        levelLabel: "Current level",
        targetLevelLabel: "Target level",
        statusLabel: "Status",
        evidenceLabel: "Evidence URL",
        evidencePlaceholder: "GitHub, Kaggle, certificate, paper, portfolio link",
        notesLabel: "Notes",
        notesPlaceholder: "What are you building, practicing, or using as proof?",
        submit: "Add skill"
      },
      filters: {
        title: "Focus view",
        search: "Search skills or notes",
        allCategories: "All categories",
        allStatuses: "All statuses",
        noMatches: "No skills match this view."
      },
      tree: {
        title: "Skill tree",
        description:
          "Each node shows current level, target level, status, and portfolio evidence. Keep it updated weekly to reveal your growth path.",
        empty: "No skills yet. Add your first node to start building the tree.",
        progress: "Progress",
        evidence: "Evidence",
        noEvidence: "No evidence yet"
      },
      actions: {
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        confirmDelete: "Delete this skill?"
      },
      labels: {
        categories: {
          programming: "Programming",
          machine_learning: "Machine Learning",
          deep_learning: "Deep Learning",
          nlp: "NLP",
          computer_vision: "Computer Vision",
          research: "Research",
          github_portfolio: "GitHub Portfolio",
          kaggle_projects: "Kaggle Projects",
          career: "Career",
          communication: "Communication"
        },
        statuses: {
          planned: "Planned",
          learning: "Learning",
          practicing: "Practicing",
          mastered: "Mastered"
        }
      }
    }
  },
  vi: {
    subtitle: "Cây kỹ năng",
    dashboard: "Bảng điều khiển",
    roadmap: "Lộ trình",
    grades: "Kế hoạch học tập",
    goals: "Mục tiêu",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Chế độ sinh viên AI",
    title: "Xây dựng cây kỹ năng rõ ràng cho hồ sơ năng lực đại học.",
    description:
      "Theo dõi lập trình, machine learning, nghiên cứu, Kaggle, GitHub và kỹ năng nghề nghiệp bằng cấp độ, minh chứng và ghi chú.",
    manager: {
      summary: {
        tracked: "Kỹ năng đã theo dõi",
        mastered: "Đã thành thạo",
        averageProgress: "Tiến độ trung bình",
        evidence: "Minh chứng"
      },
      form: {
        title: "Thêm nút kỹ năng",
        nameLabel: "Tên kỹ năng",
        namePlaceholder: "PyTorch, đọc paper NLP, notebook Kaggle",
        categoryLabel: "Danh mục",
        levelLabel: "Cấp độ hiện tại",
        targetLevelLabel: "Cấp độ mục tiêu",
        statusLabel: "Trạng thái",
        evidenceLabel: "Đường dẫn minh chứng",
        evidencePlaceholder: "GitHub, Kaggle, chứng chỉ, paper, portfolio",
        notesLabel: "Ghi chú",
        notesPlaceholder: "Bạn đang xây gì, luyện gì, hoặc dùng gì làm minh chứng?",
        submit: "Thêm kỹ năng"
      },
      filters: {
        title: "Góc tập trung",
        search: "Tìm kỹ năng hoặc ghi chú",
        allCategories: "Tất cả danh mục",
        allStatuses: "Tất cả trạng thái",
        noMatches: "Không có kỹ năng nào khớp với chế độ xem này."
      },
      tree: {
        title: "Cây kỹ năng",
        description:
          "Mỗi nút hiển thị cấp độ hiện tại, cấp độ mục tiêu, trạng thái và minh chứng portfolio. Cập nhật hằng tuần để thấy đường phát triển của bạn.",
        empty: "Chưa có kỹ năng. Hãy thêm nút đầu tiên để bắt đầu xây cây.",
        progress: "Tiến độ",
        evidence: "Minh chứng",
        noEvidence: "Chưa có minh chứng"
      },
      actions: {
        edit: "Sửa",
        save: "Lưu",
        cancel: "Hủy",
        delete: "Xóa",
        confirmDelete: "Xóa kỹ năng này?"
      },
      labels: {
        categories: {
          programming: "Lập trình",
          machine_learning: "Machine Learning",
          deep_learning: "Deep Learning",
          nlp: "NLP",
          computer_vision: "Thị giác máy tính",
          research: "Nghiên cứu",
          github_portfolio: "Portfolio GitHub",
          kaggle_projects: "Dự án Kaggle",
          career: "Sự nghiệp",
          communication: "Giao tiếp"
        },
        statuses: {
          planned: "Dự định",
          learning: "Đang học",
          practicing: "Đang luyện tập",
          mastered: "Đã thành thạo"
        }
      }
    }
  }
} as const;

export default async function SkillsPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = skillsCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/skills");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const { data: skills } = await supabase
    .from("skills")
    .select("id, user_id, name, category, level, target_level, evidence_url, notes, status")
    .eq("user_id", user.id)
    .order("category", { ascending: true })
    .order("created_at", { ascending: false });

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
            <SignOutButton label={t.signOut} />
          </div>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_0.55fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-5xl font-display text-5xl font-semibold leading-tight text-white">
              {t.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{t.description}</p>
          </div>
          <div className="rounded-[2rem] border border-emerald-300/14 bg-emerald-300/8 p-6 shadow-glow-emerald backdrop-blur-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/12 text-emerald-100 ring-1 ring-emerald-200/20">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm leading-6 text-emerald-50/82">
              {language === "en"
                ? "Designed for AI, CS, research, and career-ready students who want proof of growth."
                : "Thiết kế cho sinh viên AI, CS, nghiên cứu và định hướng nghề nghiệp cần minh chứng phát triển rõ ràng."}
            </p>
          </div>
        </section>

        <SkillsManager userId={user.id} initialSkills={skills || []} copy={t.manager} />
      </div>
    </main>
  );
}
