import type { RecommendationInput } from "@/lib/recommendations/rules";
import { createClient } from "@/lib/supabase/server";

export async function loadRecommendationInput(userId: string): Promise<RecommendationInput> {
  const supabase = await createClient();
  const [
    { data: profile },
    { data: semesters },
    { data: courses },
    { data: goals },
    { data: milestones },
    { data: skills },
    { data: clubs },
    { data: portfolioItems },
    { data: careerReadiness },
    { data: careerTargets }
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, major, current_year, academic_year_target, target_gpa, graduation_credit_target, career_goal")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("semesters")
      .select("id, year_index, term")
      .eq("user_id", userId),
    supabase
      .from("courses")
      .select("id, name, credits, target_grade, final_grade, status")
      .eq("user_id", userId),
    supabase
      .from("goals")
      .select("id, title, category, progress, status, priority, target_date")
      .eq("user_id", userId),
    supabase
      .from("goal_milestones")
      .select("id, goal_id, title, due_date, status")
      .eq("user_id", userId),
    supabase
      .from("skills")
      .select("id, name, category, level, target_level, evidence_url, status")
      .eq("user_id", userId),
    supabase
      .from("clubs")
      .select("id, status, is_leadership")
      .eq("user_id", userId),
    supabase
      .from("portfolio_items")
      .select("id, status, type, url, related_course_id, related_goal_id, related_skill_id, related_club_id")
      .eq("user_id", userId),
    supabase
      .from("career_readiness")
      .select("resume_status, linkedin_status, github_status, portfolio_status, interview_practice_count, networking_contacts_count, target_role, target_industry, next_review_date")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("career_targets")
      .select("company, role, stage, deadline")
      .eq("user_id", userId)
  ]);

  return {
    profile: profile
      ? {
          ...profile,
          current_year: profile.current_year === null ? null : Number(profile.current_year),
          academic_year_target: profile.academic_year_target === null ? null : Number(profile.academic_year_target),
          target_gpa: profile.target_gpa === null ? null : Number(profile.target_gpa),
          graduation_credit_target:
            profile.graduation_credit_target === null ? null : Number(profile.graduation_credit_target)
        }
      : null,
    semesters: (semesters || []).map((semester) => ({
      ...semester,
      year_index: Number(semester.year_index || 1)
    })),
    courses: (courses || []).map((course) => ({
      ...course,
      credits: Number(course.credits || 0),
      target_grade: course.target_grade === null ? null : Number(course.target_grade),
      final_grade: course.final_grade === null ? null : Number(course.final_grade)
    })),
    goals: (goals || []).map((goal) => ({
      ...goal,
      progress: Number(goal.progress || 0)
    })),
    milestones: milestones || [],
    skills: (skills || []).map((skill) => ({
      ...skill,
      level: Number(skill.level || 0),
      target_level: Number(skill.target_level || 1)
    })),
    clubs: clubs || [],
    portfolioItems: portfolioItems || [],
    careerReadiness: careerReadiness
      ? {
          ...careerReadiness,
          interview_practice_count: Number(careerReadiness.interview_practice_count || 0),
          networking_contacts_count: Number(careerReadiness.networking_contacts_count || 0)
        }
      : null,
    careerTargets: careerTargets || []
  };
}
