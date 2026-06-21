import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GoalsManager } from "@/components/goals/goals-manager";
import { WorkspaceHeader } from "@/components/navigation/workspace-header";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const goalsCopy = {
  en: {
    subtitle: "Goal management",
    dashboard: "Dashboard",
    grades: "Academic planner",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Goal management",
    title: "Turn long-term ambition into visible weekly progress.",
    description:
      "Create academic, career, research, skill, club, portfolio, and personal goals, then keep progress connected to your dashboard.",
    manager: {
      summary: {
        tracked: "Goals tracked",
        completed: "Completed",
        averageProgress: "Average progress"
      },
      form: {
        title: "Create goal",
        titleLabel: "Title",
        titlePlaceholder: "Raise GPA to 3.8",
        descriptionLabel: "Description",
        descriptionPlaceholder: "What does success look like?",
        categoryLabel: "Category",
        priorityLabel: "Priority",
        statusLabel: "Status",
        progressLabel: "Progress",
        targetDateLabel: "Target date",
        submit: "Add goal"
      },
      filters: {
        title: "Filter goals",
        allStatuses: "All statuses",
        allCategories: "All categories",
        allPriorities: "All priorities",
        sortLabel: "Sort by",
        newest: "Newest",
        priority: "Priority",
        progress: "Progress",
        deadline: "Deadline",
        noMatches: "No goals match these filters."
      },
      board: {
        title: "Goal board",
        emptyColumn: "No goals here yet.",
        moveTo: "Move to"
      },
      milestones: {
        title: "Milestones",
        add: "Add milestone",
        placeholder: "Add the next step",
        empty: "No milestones yet.",
        next: "Next step",
        dueDate: "Due date",
        todo: "To do",
        inProgress: "In progress",
        completed: "Completed",
        confirmDelete: "Delete this milestone?"
      },
      empty: {
        title: "No goals yet",
        description: "Create your first goal to start tracking meaningful progress."
      },
      card: {
        targetDate: "Target date",
        progress: "Progress",
        delete: "Delete"
      },
      actions: {
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        confirmDelete: "Delete this goal?"
      },
      labels: {
        categories: {
          academic: "Academic",
          career: "Career",
          research: "Research",
          skill: "Skill",
          club: "Club",
          portfolio: "Portfolio",
          personal: "Personal"
        },
        priorities: {
          low: "Low",
          medium: "Medium",
          high: "High"
        },
        statuses: {
          planned: "Planned",
          in_progress: "In progress",
          completed: "Completed",
          paused: "Paused"
        }
      }
    }
  },
  vi: {
    subtitle: "Quản lý mục tiêu",
    dashboard: "Bảng điều khiển",
    grades: "Kế hoạch học tập",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Quản lý mục tiêu",
    title: "Biến tham vọng dài hạn thành tiến độ hằng tuần rõ ràng.",
    description:
      "Tạo mục tiêu học tập, sự nghiệp, nghiên cứu, kỹ năng, câu lạc bộ, hồ sơ năng lực và cá nhân, sau đó kết nối tiến độ với bảng điều khiển.",
    manager: {
      summary: {
        tracked: "Mục tiêu đã theo dõi",
        completed: "Đã hoàn thành",
        averageProgress: "Tiến độ trung bình"
      },
      form: {
        title: "Tạo mục tiêu",
        titleLabel: "Tiêu đề",
        titlePlaceholder: "Nâng GPA lên 3.8",
        descriptionLabel: "Mô tả",
        descriptionPlaceholder: "Thành công sẽ trông như thế nào?",
        categoryLabel: "Danh mục",
        priorityLabel: "Độ ưu tiên",
        statusLabel: "Trạng thái",
        progressLabel: "Tiến độ",
        targetDateLabel: "Ngày mục tiêu",
        submit: "Thêm mục tiêu"
      },
      filters: {
        title: "Lọc mục tiêu",
        allStatuses: "Tất cả trạng thái",
        allCategories: "Tất cả danh mục",
        allPriorities: "Tất cả độ ưu tiên",
        sortLabel: "Sắp xếp theo",
        newest: "Mới nhất",
        priority: "Độ ưu tiên",
        progress: "Tiến độ",
        deadline: "Hạn mục tiêu",
        noMatches: "Không có mục tiêu nào khớp với bộ lọc."
      },
      board: {
        title: "Bảng mục tiêu",
        emptyColumn: "Chưa có mục tiêu ở cột này.",
        moveTo: "Chuyển sang"
      },
      milestones: {
        title: "Cột mốc",
        add: "Thêm cột mốc",
        placeholder: "Thêm bước tiếp theo",
        empty: "Chưa có cột mốc.",
        next: "Bước tiếp theo",
        dueDate: "Hạn",
        todo: "Cần làm",
        inProgress: "Đang làm",
        completed: "Hoàn thành",
        confirmDelete: "Xóa cột mốc này?"
      },
      empty: {
        title: "Chưa có mục tiêu",
        description: "Tạo mục tiêu đầu tiên để bắt đầu theo dõi tiến độ có ý nghĩa."
      },
      card: {
        targetDate: "Ngày mục tiêu",
        progress: "Tiến độ",
        delete: "Xóa"
      },
      actions: {
        edit: "Sửa",
        save: "Lưu",
        cancel: "Hủy",
        confirmDelete: "Xóa mục tiêu này?"
      },
      labels: {
        categories: {
          academic: "Học tập",
          career: "Sự nghiệp",
          research: "Nghiên cứu",
          skill: "Kỹ năng",
          club: "Câu lạc bộ",
          portfolio: "Hồ sơ năng lực",
          personal: "Cá nhân"
        },
        priorities: {
          low: "Thấp",
          medium: "Trung bình",
          high: "Cao"
        },
        statuses: {
          planned: "Dự định",
          in_progress: "Đang thực hiện",
          completed: "Hoàn thành",
          paused: "Tạm dừng"
        }
      }
    }
  }
} as const;

export default async function GoalsPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = goalsCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/goals");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const { data: goals } = await supabase
    .from("goals")
    .select("id, user_id, title, description, category, target_date, progress, status, priority")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: milestones } = await supabase
    .from("goal_milestones")
    .select("id, user_id, goal_id, title, notes, due_date, status, sort_order")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (
    <main id="main-content" className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8">
          <WorkspaceHeader language={language} subtitle={t.subtitle} languageLabel={t.languageLabel} signOutLabel={t.signOut} />
        </div>

        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-coral-soft">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-tight text-brand-paper">
            {t.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{t.description}</p>
        </section>

        <GoalsManager userId={user.id} initialGoals={goals || []} initialMilestones={milestones || []} copy={t.manager} />
      </div>
    </main>
  );
}
