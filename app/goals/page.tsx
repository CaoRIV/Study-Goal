import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { GoalsManager } from "@/components/goals/goals-manager";
import { LanguageSwitcher } from "@/components/language/language-switcher";
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
      empty: {
        title: "No goals yet",
        description: "Create your first goal to start tracking meaningful progress."
      },
      card: {
        targetDate: "Target date",
        progress: "Progress",
        delete: "Delete"
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
      empty: {
        title: "Chưa có mục tiêu",
        description: "Tạo mục tiêu đầu tiên để bắt đầu theo dõi tiến độ có ý nghĩa."
      },
      card: {
        targetDate: "Ngày mục tiêu",
        progress: "Tiến độ",
        delete: "Xóa"
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

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
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
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/grades">
              {t.grades}
            </a>
            <SignOutButton label={t.signOut} />
          </div>
        </header>

        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-display text-5xl font-semibold leading-tight text-white">
            {t.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{t.description}</p>
        </section>

        <GoalsManager userId={user.id} initialGoals={goals || []} copy={t.manager} />
      </div>
    </main>
  );
}
