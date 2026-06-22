import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BrainCircuit } from "lucide-react";

import { WorkspaceHeader } from "@/components/navigation/workspace-header";
import { SkillsManager } from "@/components/skills/skills-manager";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const skillsCopy = {
  en: {
    subtitle: "Personal skill map",
    dashboard: "Dashboard",
    roadmap: "Roadmap",
    grades: "Academic planner",
    goals: "Goals",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Skills for every major",
    title: "Build a skill map for your studies, projects, and future career.",
    description:
      "Track subject expertise, communication, research, digital tools, creativity, leadership, and career skills with levels, evidence, and notes.",
    manager: {
      summary: {
        tracked: "Skills tracked",
        mastered: "Mastered",
        averageProgress: "Average progress",
        evidence: "Evidence links"
      },
      form: {
        title: "Add a skill",
        nameLabel: "Skill name",
        namePlaceholder: "Public speaking, financial analysis, illustration, patient care",
        categoryLabel: "Category",
        levelLabel: "Current level",
        targetLevelLabel: "Target level",
        statusLabel: "Status",
        evidenceLabel: "Evidence URL",
        evidencePlaceholder: "Project, certificate, presentation, report, portfolio link",
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
        title: "Personal skill map",
        description:
          "Each skill shows your current level, target, learning status, and supporting evidence. Update it regularly to make growth visible.",
        empty: "No skills yet. Add your first skill to start building your map.",
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
          subject_expertise: "Subject Expertise",
          digital_tools: "Digital Tools",
          research_analysis: "Research & Analysis",
          teamwork_leadership: "Teamwork & Leadership",
          creative_design: "Creativity & Design",
          project_management: "Project Management",
          language: "Language",
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
    subtitle: "Bản đồ kỹ năng cá nhân",
    dashboard: "Bảng điều khiển",
    roadmap: "Lộ trình",
    grades: "Kế hoạch học tập",
    goals: "Mục tiêu",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Kỹ năng cho mọi ngành học",
    title: "Xây dựng bản đồ kỹ năng cho học tập, dự án và sự nghiệp tương lai.",
    description:
      "Theo dõi chuyên môn ngành học, giao tiếp, nghiên cứu, công cụ số, sáng tạo, lãnh đạo và kỹ năng nghề nghiệp bằng cấp độ, minh chứng và ghi chú.",
    manager: {
      summary: {
        tracked: "Kỹ năng đã theo dõi",
        mastered: "Đã thành thạo",
        averageProgress: "Tiến độ trung bình",
        evidence: "Minh chứng"
      },
      form: {
        title: "Thêm kỹ năng",
        nameLabel: "Tên kỹ năng",
        namePlaceholder: "Thuyết trình, phân tích tài chính, minh họa, chăm sóc người bệnh",
        categoryLabel: "Danh mục",
        levelLabel: "Cấp độ hiện tại",
        targetLevelLabel: "Cấp độ mục tiêu",
        statusLabel: "Trạng thái",
        evidenceLabel: "Đường dẫn minh chứng",
        evidencePlaceholder: "Dự án, chứng chỉ, bài thuyết trình, báo cáo, portfolio",
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
        title: "Bản đồ kỹ năng cá nhân",
        description:
          "Mỗi kỹ năng hiển thị cấp độ hiện tại, mục tiêu, trạng thái học tập và minh chứng đi kèm. Cập nhật thường xuyên để thấy rõ sự phát triển.",
        empty: "Chưa có kỹ năng. Hãy thêm kỹ năng đầu tiên để bắt đầu xây bản đồ.",
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
          subject_expertise: "Chuyên môn ngành học",
          digital_tools: "Công cụ số",
          research_analysis: "Nghiên cứu & phân tích",
          teamwork_leadership: "Làm việc nhóm & lãnh đạo",
          creative_design: "Sáng tạo & thiết kế",
          project_management: "Quản lý dự án",
          language: "Ngoại ngữ",
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
    <main id="main-content" className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8">
          <WorkspaceHeader
            language={language}
            subtitle={t.subtitle}
            languageLabel={t.languageLabel}
            signOutLabel={t.signOut}
          />
        </div>

        <section className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_0.55fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-green">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-5xl font-display text-5xl font-semibold leading-tight text-ink">
              {t.title}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-ink-muted">{t.description}</p>
          </div>
          <div className="rounded-[2rem] border border-brand-green/14 bg-brand-green/8 p-6 shadow-glow-blue backdrop-blur-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/12 text-signal-green ring-1 ring-brand-green/20">
              <BrainCircuit className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm leading-6 text-ink-muted">
              {language === "en"
                ? "Designed for students in every field—from business and health to arts, education, engineering, law, and technology."
                : "Dành cho sinh viên mọi lĩnh vực — từ kinh tế, sức khỏe, nghệ thuật, giáo dục đến kỹ thuật, luật và công nghệ."}
            </p>
          </div>
        </section>

        <SkillsManager userId={user.id} initialSkills={skills || []} copy={t.manager} />
      </div>
    </main>
  );
}
