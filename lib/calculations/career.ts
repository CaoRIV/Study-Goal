export type CareerReadinessInput = {
  resume_status?: string | null;
  linkedin_status?: string | null;
  github_status?: string | null;
  portfolio_status?: string | null;
  interview_practice_count?: number | null;
  networking_contacts_count?: number | null;
};

export type CareerTargetInput = {
  stage: string;
};

const statusPoints: Record<string, number> = {
  not_started: 0,
  in_progress: 0.5,
  ready: 1
};

export function calculateCareerReadiness(
  readiness: CareerReadinessInput | null,
  targets: CareerTargetInput[] = []
) {
  if (!readiness) {
    return 0;
  }

  const profileScore =
    ["resume_status", "linkedin_status", "github_status", "portfolio_status"].reduce(
      (total, key) => total + (statusPoints[String(readiness[key as keyof CareerReadinessInput] || "not_started")] || 0),
      0
    ) * 12.5;
  const interviewScore = Math.min(Number(readiness.interview_practice_count || 0) / 5, 1) * 20;
  const networkingScore = Math.min(Number(readiness.networking_contacts_count || 0) / 10, 1) * 10;
  const activeApplications = targets.filter((target) =>
    ["applied", "interviewing", "offer"].includes(target.stage)
  ).length;
  const pipelineScore = Math.min(activeApplications / 3, 1) * 20;

  return Math.min(100, Math.round(profileScore + interviewScore + networkingScore + pipelineScore));
}
