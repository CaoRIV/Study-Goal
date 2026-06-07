import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { ProfileForm } from "@/components/profile/profile-form";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const profileCopy = {
  en: {
    subtitle: "Profile settings",
    dashboard: "Dashboard",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Profile",
    title: "Update your information so Study Goal can personalize your plan.",
    form: {
      active: "Profile active",
      fallbackName: "Study Goal student",
      fields: {
        fullName: "Full name",
        university: "University",
        major: "Major",
        startYear: "Start year",
        currentYear: "Current year",
        academicYearTarget: "Study duration",
        targetGpa: "Target GPA",
        graduationCreditTarget: "Graduation credits",
        careerGoal: "Career goal"
      },
      placeholders: {
        fullName: "Maya Tran",
        university: "Đại học Quốc gia",
        major: "Khoa học máy tính",
        startYear: "2026",
        currentYear: "1",
        academicYearTarget: "4",
        targetGpa: "3.80",
        graduationCreditTarget: "128",
        careerGoal: "Become an AI engineer, publish strong research, and build a standout portfolio."
      },
      saved: "Profile updated.",
      back: "Back to dashboard",
      save: "Save profile"
    }
  },
  vi: {
    subtitle: "Cài đặt hồ sơ",
    dashboard: "Bảng điều khiển",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Hồ sơ cá nhân",
    title: "Cập nhật thông tin để Study Goal cá nhân hóa kế hoạch của bạn.",
    form: {
      active: "Hồ sơ đang hoạt động",
      fallbackName: "Sinh viên Study Goal",
      fields: {
        fullName: "Họ và tên",
        university: "Trường đại học",
        major: "Ngành học",
        startYear: "Năm bắt đầu",
        currentYear: "Năm hiện tại",
        academicYearTarget: "Thời lượng học dự kiến",
        targetGpa: "GPA mục tiêu",
        graduationCreditTarget: "Tín chỉ tốt nghiệp",
        careerGoal: "Mục tiêu nghề nghiệp"
      },
      placeholders: {
        fullName: "Maya Tran",
        university: "National University",
        major: "Computer Science",
        startYear: "2026",
        currentYear: "1",
        academicYearTarget: "4",
        targetGpa: "3.80",
        graduationCreditTarget: "128",
        careerGoal: "Trở thành kỹ sư AI, có nghiên cứu tốt và hồ sơ năng lực nổi bật."
      },
      saved: "Hồ sơ đã được cập nhật.",
      back: "Quay lại bảng điều khiển",
      save: "Lưu hồ sơ"
    }
  }
} as const;

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = profileCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, university, major, start_year, current_year, academic_year_target, target_gpa, graduation_credit_target, career_goal")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
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
            <SignOutButton label={t.signOut} />
          </div>
        </header>

        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-white">
            {t.title}
          </h1>
        </section>

        <ProfileForm userId={user.id} email={user.email || "your account"} profile={profile} copy={t.form} />
      </div>
    </main>
  );
}
