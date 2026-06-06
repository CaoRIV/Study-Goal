import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
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
    <OnboardingForm
      userId={user.id}
      email={user.email || "your account"}
      profile={profile}
    />
  );
}
