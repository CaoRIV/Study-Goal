import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LanguageSwitcher } from "@/components/language/language-switcher";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const onboardingCopy = {
  en: {
    languageLabel: "Change language",
    badge: "Your first master plan",
    title: "Set up your university operating system.",
    description:
      "This creates your profile so Study Goal can personalize your dashboard, GPA targets, and roadmap.",
    signedInAs: "Signed in as",
    submit: "Continue to dashboard",
    fields: {
      fullName: "Full name",
      university: "University",
      major: "Major",
      startYear: "Start year",
      currentYear: "Current year",
      targetGpa: "Target GPA",
      careerGoal: "Career goal"
    },
    placeholders: {
      fullName: "Maya Tran",
      university: "National University",
      major: "Computer Science",
      startYear: "2026",
      currentYear: "1",
      targetGpa: "3.80",
      careerGoal: "Become an AI engineer, publish research, and land a strong internship."
    }
  },
  vi: {
    languageLabel: "Đổi ngôn ngữ",
    badge: "Kế hoạch đầu tiên của bạn",
    title: "Thiết lập hệ điều hành đại học của bạn.",
    description:
      "Bước này tạo hồ sơ để Study Goal cá nhân hóa bảng điều khiển, mục tiêu GPA và lộ trình học tập.",
    signedInAs: "Đang đăng nhập với",
    submit: "Tiếp tục đến bảng điều khiển",
    fields: {
      fullName: "Họ và tên",
      university: "Trường đại học",
      major: "Ngành học",
      startYear: "Năm bắt đầu",
      currentYear: "Năm hiện tại",
      targetGpa: "GPA mục tiêu",
      careerGoal: "Mục tiêu nghề nghiệp"
    },
    placeholders: {
      fullName: "Maya Tran",
      university: "Đại học Quốc gia",
      major: "Khoa học máy tính",
      startYear: "2026",
      currentYear: "1",
      targetGpa: "3.80",
      careerGoal: "Trở thành kỹ sư AI, có nghiên cứu tốt và có kỳ thực tập nổi bật."
    }
  }
} as const;

export default async function OnboardingPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = onboardingCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, university, major, start_year, current_year, target_gpa, career_goal")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <>
      <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
        <LanguageSwitcher language={language} label={t.languageLabel} />
      </div>
      <OnboardingForm
        userId={user.id}
        email={user.email || "your account"}
        profile={profile}
        copy={t}
      />
    </>
  );
}
