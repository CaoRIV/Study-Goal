import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { WorkspaceHeader } from "@/components/navigation/workspace-header";
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
    <main id="main-content" className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <WorkspaceHeader language={language} subtitle={t.subtitle} languageLabel={t.languageLabel} signOutLabel={t.signOut} />
        </div>

        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-brand-paper">
            {t.title}
          </h1>
        </section>

        <ProfileForm userId={user.id} email={user.email || "your account"} profile={profile} copy={t.form} />
      </div>
    </main>
  );
}
