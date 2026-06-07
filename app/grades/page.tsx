import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { AcademicPlanner } from "@/components/grades/academic-planner";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { createClient } from "@/lib/supabase/server";

const gradesCopy = {
  en: {
    subtitle: "Academic planner",
    dashboard: "Dashboard",
    goals: "Goals",
    signOut: "Sign out",
    languageLabel: "Change language",
    eyebrow: "Academic planner",
    title: "Plan semesters, track credits, and calculate GPA.",
    description:
      "Create your semester structure, add courses, and keep GPA progress connected to your Study Goal dashboard.",
    planner: {
      summary: {
        currentGpa: "Current GPA",
        completedCredits: "Completed credits",
        coursesTracked: "Courses tracked",
        unavailable: "N/A"
      },
      intelligence: {
        creditProgress: "Credit progress",
        graduationTarget: "Based on your graduation credit target.",
        projectedGpa: "Projected GPA",
        simulator: "GPA simulator",
        simulatorLabel: "Assumed grade",
        requiredAverage: "Average needed for target GPA",
        targetGpa: "Target GPA",
        remainingCredits: "remaining credits",
        onTrack: "On track",
        needsFocus: "Needs focus",
        noRemainingCourses: "Add planned or in-progress courses to calculate the needed average."
      },
      semesterForm: {
        title: "Create semester",
        name: "Semester name",
        namePlaceholder: "Fall 2026",
        yearIndex: "Year index",
        term: "Term",
        submit: "Add semester"
      },
      courseForm: {
        title: "Add course",
        semester: "Semester",
        semesterEmpty: "Create a semester first",
        code: "Course code",
        codePlaceholder: "CS101",
        name: "Course name",
        namePlaceholder: "Introduction to Programming",
        credits: "Credits",
        targetGrade: "Target grade",
        finalGrade: "Final grade",
        status: "Status",
        submit: "Add course"
      },
      terms: {
        fall: "Fall",
        spring: "Spring",
        summer: "Summer",
        winter: "Winter",
        other: "Other"
      },
      statuses: {
        planned: "Planned",
        in_progress: "In progress",
        completed: "Completed",
        dropped: "Dropped"
      },
      table: {
        year: "Year",
        course: "Course",
        credits: "Credits",
        target: "Target",
        final: "Final",
        status: "Status",
        delete: "Delete",
        noCode: "No code",
        noCourses: "No courses in this semester yet."
      },
      actions: {
        edit: "Edit",
        save: "Save",
        cancel: "Cancel",
        confirmDeleteSemester: "Delete this semester and all courses inside it?",
        confirmDeleteCourse: "Delete this course?"
      },
      empty: {
        title: "No semesters yet",
        description: "Create your first semester to start tracking courses and GPA."
      }
    }
  },
  vi: {
    subtitle: "Kế hoạch học tập",
    dashboard: "Bảng điều khiển",
    goals: "Mục tiêu",
    signOut: "Đăng xuất",
    languageLabel: "Đổi ngôn ngữ",
    eyebrow: "Kế hoạch học tập",
    title: "Lập kế hoạch học kỳ, theo dõi tín chỉ và tính GPA.",
    description:
      "Tạo cấu trúc học kỳ, thêm môn học và kết nối tiến độ GPA với bảng điều khiển Study Goal của bạn.",
    planner: {
      summary: {
        currentGpa: "GPA hiện tại",
        completedCredits: "Tín chỉ hoàn thành",
        coursesTracked: "Môn học đã theo dõi",
        unavailable: "Chưa có"
      },
      intelligence: {
        creditProgress: "Tiến độ tín chỉ",
        graduationTarget: "Dựa trên mục tiêu tín chỉ tốt nghiệp của bạn.",
        projectedGpa: "GPA dự kiến",
        simulator: "Mô phỏng GPA",
        simulatorLabel: "Điểm giả định",
        requiredAverage: "Điểm trung bình cần đạt để chạm GPA mục tiêu",
        targetGpa: "GPA mục tiêu",
        remainingCredits: "tín chỉ còn lại",
        onTrack: "Đúng hướng",
        needsFocus: "Cần tập trung",
        noRemainingCourses: "Thêm môn dự định hoặc đang học để tính điểm trung bình cần đạt."
      },
      semesterForm: {
        title: "Tạo học kỳ",
        name: "Tên học kỳ",
        namePlaceholder: "Học kỳ 1 năm 2026",
        yearIndex: "Năm học",
        term: "Kỳ học",
        submit: "Thêm học kỳ"
      },
      courseForm: {
        title: "Thêm môn học",
        semester: "Học kỳ",
        semesterEmpty: "Hãy tạo học kỳ trước",
        code: "Mã môn học",
        codePlaceholder: "CS101",
        name: "Tên môn học",
        namePlaceholder: "Nhập môn lập trình",
        credits: "Tín chỉ",
        targetGrade: "Điểm mục tiêu",
        finalGrade: "Điểm cuối kỳ",
        status: "Trạng thái",
        submit: "Thêm môn học"
      },
      terms: {
        fall: "Kỳ thu",
        spring: "Kỳ xuân",
        summer: "Kỳ hè",
        winter: "Kỳ đông",
        other: "Khác"
      },
      statuses: {
        planned: "Dự định",
        in_progress: "Đang học",
        completed: "Hoàn thành",
        dropped: "Đã hủy"
      },
      table: {
        year: "Năm",
        course: "Môn học",
        credits: "Tín chỉ",
        target: "Mục tiêu",
        final: "Cuối kỳ",
        status: "Trạng thái",
        delete: "Xóa",
        noCode: "Chưa có mã",
        noCourses: "Chưa có môn học trong học kỳ này."
      },
      actions: {
        edit: "Sửa",
        save: "Lưu",
        cancel: "Hủy",
        confirmDeleteSemester: "Xóa học kỳ này và toàn bộ môn học bên trong?",
        confirmDeleteCourse: "Xóa môn học này?"
      },
      empty: {
        title: "Chưa có học kỳ",
        description: "Tạo học kỳ đầu tiên để bắt đầu theo dõi môn học và GPA."
      }
    }
  }
} as const;

export default async function GradesPage() {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const t = gradesCopy[language];
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/grades");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded, target_gpa, graduation_credit_target")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_onboarded) {
    redirect("/onboarding");
  }

  const { data: semesters } = await supabase
    .from("semesters")
    .select("id, user_id, name, year_index, term")
    .eq("user_id", user.id)
    .order("year_index", { ascending: true })
    .order("created_at", { ascending: true });

  const { data: courses } = await supabase
    .from("courses")
    .select("id, user_id, semester_id, code, name, credits, target_grade, final_grade, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

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
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/goals">
              {t.goals}
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

        <AcademicPlanner
          userId={user.id}
          initialSemesters={semesters || []}
          initialCourses={courses || []}
          targetGpa={profile.target_gpa === null ? null : Number(profile.target_gpa)}
          graduationCreditTarget={Number(profile.graduation_credit_target || 128)}
          copy={t.planner}
        />
      </div>
    </main>
  );
}
