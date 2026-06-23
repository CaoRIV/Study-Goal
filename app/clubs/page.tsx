import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClubsManager } from "@/components/clubs/clubs-manager";
import { WorkspaceHeader } from "@/components/navigation/workspace-header";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const clubsCopy = {
  en: {
    subtitle: "Club tracker",
    dashboard: "Dashboard",
    roadmap: "Roadmap",
    grades: "Academic planner",
    goals: "Goals",
    skills: "Skills",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Club Tracker",
    title: "Turn campus involvement into portfolio evidence.",
    description:
      "Track clubs, roles, leadership, events, achievements, and impact notes so your university story is visible beyond grades.",
    manager: {
      summary: {
        tracked: "Clubs tracked",
        active: "Active",
        leadership: "Leadership roles",
        achievements: "Achievement notes"
      },
      form: {
        title: "Add club activity",
        nameLabel: "Club name",
        namePlaceholder: "AI Research Club, Debate Society, Student Union",
        roleLabel: "Role",
        rolePlaceholder: "Member, Mentor, Event Lead, Vice President",
        startDateLabel: "Start date",
        endDateLabel: "End date",
        statusLabel: "Status",
        leadershipLabel: "Leadership role",
        impactLabel: "Impact notes",
        impactPlaceholder: "What did you organize, improve, mentor, or contribute?",
        achievementsLabel: "Achievements",
        achievementsPlaceholder: "Awards, events shipped, members supported, measurable outcomes",
        submit: "Add club"
      },
      filters: {
        title: "Focus clubs",
        search: "Search clubs, roles, or impact",
        allStatuses: "All statuses",
        leadershipOnly: "Leadership",
        noMatches: "No club activities match this view."
      },
      list: {
        title: "Campus portfolio",
        empty: "No club activities yet. Add one to start building your campus story.",
        period: "Period",
        present: "Present",
        leadership: "Leadership",
        impact: "Impact",
        achievements: "Achievements"
      },
      actions: {
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        confirmDelete: "Delete this club activity?"
      },
      labels: {
        statuses: {
          planned: "Planned",
          active: "Active",
          completed: "Completed",
          paused: "Paused"
        }
      }
    }
  },
  vi: {
    subtitle: "Theo dõi câu lạc bộ",
    dashboard: "Bảng điều khiển",
    roadmap: "Lộ trình",
    grades: "Kế hoạch học tập",
    goals: "Mục tiêu",
    skills: "Kỹ năng",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Theo dõi câu lạc bộ",
    title: "Biến hoạt động trong trường thành minh chứng portfolio.",
    description:
      "Theo dõi câu lạc bộ, vai trò, lãnh đạo, sự kiện, thành tựu và ghi chú tác động để câu chuyện đại học của bạn rõ ràng hơn ngoài điểm số.",
    manager: {
      summary: {
        tracked: "CLB đã theo dõi",
        active: "Đang tham gia",
        leadership: "Vai trò lãnh đạo",
        achievements: "Ghi chú thành tựu"
      },
      form: {
        title: "Thêm hoạt động CLB",
        nameLabel: "Tên câu lạc bộ",
        namePlaceholder: "CLB Nghiên cứu AI, CLB Tranh biện, Hội Sinh viên",
        roleLabel: "Vai trò",
        rolePlaceholder: "Thành viên, Mentor, Trưởng sự kiện, Phó chủ nhiệm",
        startDateLabel: "Ngày bắt đầu",
        endDateLabel: "Ngày kết thúc",
        statusLabel: "Trạng thái",
        leadershipLabel: "Vai trò lãnh đạo",
        impactLabel: "Ghi chú tác động",
        impactPlaceholder: "Bạn đã tổ chức, cải thiện, hướng dẫn hoặc đóng góp điều gì?",
        achievementsLabel: "Thành tựu",
        achievementsPlaceholder: "Giải thưởng, sự kiện đã tổ chức, thành viên đã hỗ trợ, kết quả đo được",
        submit: "Thêm CLB"
      },
      filters: {
        title: "Góc tập trung",
        search: "Tìm CLB, vai trò hoặc tác động",
        allStatuses: "Tất cả trạng thái",
        leadershipOnly: "Lãnh đạo",
        noMatches: "Không có hoạt động CLB nào khớp với chế độ xem này."
      },
      list: {
        title: "Portfolio hoạt động",
        empty: "Chưa có hoạt động CLB. Hãy thêm một hoạt động để bắt đầu xây câu chuyện trong trường.",
        period: "Thời gian",
        present: "Hiện tại",
        leadership: "Lãnh đạo",
        impact: "Tác động",
        achievements: "Thành tựu"
      },
      actions: {
        edit: "Sửa",
        save: "Lưu",
        cancel: "Hủy",
        delete: "Xóa",
        confirmDelete: "Xóa hoạt động CLB này?"
      },
      labels: {
        statuses: {
          planned: "Dự định",
          active: "Đang tham gia",
          completed: "Hoàn thành",
          paused: "Tạm dừng"
        }
      }
    }
  }
} as const;

export default async function ClubsPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = clubsCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/clubs");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const { data: clubs } = await supabase
    .from("clubs")
    .select("id, user_id, name, role, start_date, end_date, status, is_leadership, impact_notes, achievements")
    .eq("user_id", user.id)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  return (
    <main id="main-content" className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-8">
          <WorkspaceHeader language={language} subtitle={t.subtitle} languageLabel={t.languageLabel} signOutLabel={t.signOut} />
        </div>

        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-red">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-5xl font-display text-5xl font-semibold leading-tight text-ink">
            {t.title}
          </h1>
        </section>

        <ClubsManager userId={user.id} initialClubs={clubs || []} copy={t.manager} />
      </div>
    </main>
  );
}
