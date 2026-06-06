import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { ProfileForm } from "@/components/profile/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, university, major, start_year, current_year, target_gpa, career_goal")
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
              <p className="text-sm text-slate-400">Profile settings</p>
            </div>
          </a>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a className="inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/8 hover:text-white" href="/dashboard">
              Dashboard
            </a>
            <SignOutButton />
          </div>
        </header>

        <section className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">Hồ sơ cá nhân</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-white">
            Cập nhật thông tin để Study Goal cá nhân hóa kế hoạch của bạn.
          </h1>
        </section>

        <ProfileForm userId={user.id} email={user.email || "your account"} profile={profile} />
      </div>
    </main>
  );
}
