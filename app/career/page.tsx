import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";

import { StudyGoalLogo } from "@/components/brand/study-goal-logo";
import { CareerReadinessManager } from "@/components/career/career-readiness-manager";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const careerCopy = {
  en: {
    subtitle: "Career readiness",
    languageLabel: "Change language",
    dashboard: "Dashboard",
    roadmap: "Roadmap",
    grades: "Academic planner",
    goals: "Goals",
    portfolio: "Portfolio",
    signOut: "Sign out",
    eyebrow: "Career Command Center",
    title: "Turn preparation into a repeatable career system.",
    description:
      "Strengthen your professional profile, practice interviews, build a target pipeline, and know exactly what to improve next.",
    insight:
      "Your score rewards completed career assets, deliberate practice, networking, and active applications. Every point has a clear action behind it.",
    manager: {
      score: {
        title: "Career readiness",
        label: "Readiness score",
        foundation: "Professional foundation",
        interviews: "Interview practice",
        networking: "Networking",
        pipeline: "Application pipeline",
        early: "Build your foundation",
        growing: "Preparation is taking shape",
        strong: "You are ready to compete"
      },
      profile: {
        title: "Career foundation",
        description: "Keep the four assets recruiters inspect first current and credible.",
        resume: "Resume",
        linkedin: "LinkedIn",
        github: "GitHub",
        portfolio: "Portfolio",
        targetRole: "Target role",
        targetRolePlaceholder: "Software Engineer Intern",
        targetIndustry: "Target industry",
        targetIndustryPlaceholder: "Technology, AI, Fintech",
        interviews: "Interview practice sessions",
        networking: "Professional contacts",
        nextReview: "Next review",
        notes: "Career notes",
        notesPlaceholder: "Key gaps, people to contact, or preparation priorities",
        save: "Save career profile",
        saved: "Career profile saved."
      },
      target: {
        title: "Add opportunity",
        company: "Company",
        companyPlaceholder: "Company or organization",
        role: "Role",
        rolePlaceholder: "AI Engineer Intern",
        stage: "Stage",
        deadline: "Deadline",
        url: "Job URL",
        urlPlaceholder: "Job description or application link",
        notes: "Notes",
        notesPlaceholder: "Requirements, referral, preparation plan",
        submit: "Add to pipeline"
      },
      pipeline: {
        title: "Opportunity pipeline",
        empty: "No opportunities yet. Add a role you want to pursue.",
        deadline: "Deadline",
        open: "Open role",
        delete: "Delete",
        confirmDelete: "Delete this opportunity?"
      },
      statuses: {
        not_started: "Not started",
        in_progress: "In progress",
        ready: "Ready"
      },
      stages: {
        interested: "Interested",
        preparing: "Preparing",
        applied: "Applied",
        interviewing: "Interviewing",
        offer: "Offer",
        rejected: "Rejected",
        withdrawn: "Withdrawn"
      }
    }
  },
  vi: {
    subtitle: "Sẵn sàng nghề nghiệp",
    languageLabel: "Đổi ngôn ngữ",
    dashboard: "Bảng điều khiển",
    roadmap: "Lộ trình",
    grades: "Kế hoạch học tập",
    goals: "Mục tiêu",
    portfolio: "Portfolio",
    signOut: "Đăng xuất",
    eyebrow: "Trung tâm sự nghiệp",
    title: "Biến quá trình chuẩn bị thành một hệ thống nghề nghiệp rõ ràng.",
    description:
      "Hoàn thiện hồ sơ chuyên nghiệp, luyện phỏng vấn, xây dựng danh sách cơ hội và biết chính xác điều cần cải thiện tiếp theo.",
    insight:
      "Điểm số phản ánh hồ sơ nghề nghiệp, mức độ luyện tập, kết nối chuyên môn và các đơn ứng tuyển đang hoạt động. Mỗi điểm đều gắn với một hành động cụ thể.",
    manager: {
      score: {
        title: "Mức độ sẵn sàng nghề nghiệp",
        label: "Điểm sẵn sàng",
        foundation: "Nền tảng hồ sơ",
        interviews: "Luyện phỏng vấn",
        networking: "Kết nối chuyên môn",
        pipeline: "Quy trình ứng tuyển",
        early: "Hãy xây dựng nền tảng",
        growing: "Quá trình chuẩn bị đang tiến triển",
        strong: "Bạn đã sẵn sàng cạnh tranh"
      },
      profile: {
        title: "Nền tảng nghề nghiệp",
        description: "Luôn cập nhật bốn tài sản mà nhà tuyển dụng thường xem đầu tiên.",
        resume: "CV",
        linkedin: "LinkedIn",
        github: "GitHub",
        portfolio: "Portfolio",
        targetRole: "Vị trí mục tiêu",
        targetRolePlaceholder: "Thực tập sinh Kỹ sư phần mềm",
        targetIndustry: "Ngành mục tiêu",
        targetIndustryPlaceholder: "Công nghệ, AI, Fintech",
        interviews: "Số buổi luyện phỏng vấn",
        networking: "Số kết nối chuyên môn",
        nextReview: "Ngày đánh giá tiếp theo",
        notes: "Ghi chú sự nghiệp",
        notesPlaceholder: "Điểm còn thiếu, người cần liên hệ hoặc ưu tiên chuẩn bị",
        save: "Lưu hồ sơ nghề nghiệp",
        saved: "Đã lưu hồ sơ nghề nghiệp."
      },
      target: {
        title: "Thêm cơ hội",
        company: "Công ty",
        companyPlaceholder: "Công ty hoặc tổ chức",
        role: "Vị trí",
        rolePlaceholder: "Thực tập sinh Kỹ sư AI",
        stage: "Giai đoạn",
        deadline: "Hạn ứng tuyển",
        url: "Đường dẫn tuyển dụng",
        urlPlaceholder: "Mô tả công việc hoặc đường dẫn ứng tuyển",
        notes: "Ghi chú",
        notesPlaceholder: "Yêu cầu, người giới thiệu hoặc kế hoạch chuẩn bị",
        submit: "Thêm vào quy trình"
      },
      pipeline: {
        title: "Quy trình cơ hội",
        empty: "Chưa có cơ hội nào. Hãy thêm một vị trí bạn muốn theo đuổi.",
        deadline: "Hạn ứng tuyển",
        open: "Mở vị trí",
        delete: "Xóa",
        confirmDelete: "Xóa cơ hội này?"
      },
      statuses: {
        not_started: "Chưa bắt đầu",
        in_progress: "Đang thực hiện",
        ready: "Sẵn sàng"
      },
      stages: {
        interested: "Quan tâm",
        preparing: "Đang chuẩn bị",
        applied: "Đã ứng tuyển",
        interviewing: "Đang phỏng vấn",
        offer: "Nhận đề nghị",
        rejected: "Không phù hợp",
        withdrawn: "Đã rút"
      }
    }
  }
} as const;

export default async function CareerPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = careerCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/career");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const [{ data: readiness }, { data: targets }] = await Promise.all([
    supabase
      .from("career_readiness")
      .select("id, user_id, resume_status, linkedin_status, github_status, portfolio_status, interview_practice_count, networking_contacts_count, target_role, target_industry, next_review_date, notes")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("career_targets")
      .select("id, user_id, company, role, stage, job_url, deadline, notes")
      .eq("user_id", user.id)
      .order("deadline", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
  ]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-8 flex flex-col gap-4 rounded-[2rem] border border-white/12 bg-slate-950/64 p-5 shadow-2xl shadow-black/35 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
          <a href="/dashboard" className="flex items-center gap-3">
            <StudyGoalLogo priority />
            <div>
              <p className="font-display text-lg font-semibold text-white">Study Goal</p>
              <p className="text-sm text-slate-400">{t.subtitle}</p>
            </div>
          </a>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Career navigation">
            <LanguageSwitcher language={language} label={t.languageLabel} />
            {[
              ["/dashboard", t.dashboard],
              ["/roadmap", t.roadmap],
              ["/grades", t.grades],
              ["/goals", t.goals],
              ["/portfolio", t.portfolio]
            ].map(([href, label]) => (
              <a key={href} href={href} className="inline-flex h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white">
                {label}
              </a>
            ))}
            <SignOutButton label={t.signOut} />
          </nav>
        </header>

        <section className="mb-8 grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">{t.eyebrow}</p>
            <h1 className="mt-4 max-w-5xl font-display text-5xl font-semibold leading-tight text-white">{t.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">{t.description}</p>
          </div>
          <aside className="rounded-[2rem] border border-emerald-300/16 bg-emerald-300/8 p-6 backdrop-blur-2xl">
            <BriefcaseBusiness className="h-7 w-7 text-emerald-200" aria-hidden="true" />
            <p className="mt-4 text-sm leading-6 text-emerald-50/85">{t.insight}</p>
          </aside>
        </section>

        <CareerReadinessManager
          userId={user.id}
          initialReadiness={readiness}
          initialTargets={targets || []}
          copy={t.manager}
        />
      </div>
    </main>
  );
}
