export type CheckInState = "completed" | "rescheduled" | "blocked";
export type TodayEntityType = "goal" | "milestone";
export type TodayUrgency = "overdue" | "today" | "soon" | "later" | "undated";

export type TodayPriorityItem = {
  id: string;
  entityType: TodayEntityType;
  title: string;
  context: string;
  dueDate: string | null;
  urgency: TodayUrgency;
  progress: number;
  checkInState: CheckInState | null;
};

export type TodayDeadlineItem = {
  id: string;
  title: string;
  context: string;
  dueDate: string;
  href: string;
  kind: "goal" | "milestone" | "career";
};

export type TodayRiskItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  severity: "high" | "medium" | "clear";
};

type Goal = {
  id: string;
  title: string;
  category: string;
  progress: number;
  status: string;
  priority: string;
  target_date: string | null;
};

type Milestone = {
  id: string;
  goal_id: string;
  title: string;
  due_date: string | null;
  status: string;
};

type CareerTarget = {
  id: string;
  company: string;
  role: string;
  stage: string;
  deadline: string | null;
};

type DailyCheckIn = {
  entity_type: TodayEntityType;
  entity_id: string;
  state: CheckInState;
};

const DAY_IN_MS = 86_400_000;

function dateValue(date: string) {
  return Date.parse(`${date}T00:00:00Z`);
}

function daysBetween(date: string, today: string) {
  return Math.round((dateValue(date) - dateValue(today)) / DAY_IN_MS);
}

function getUrgency(date: string | null, today: string): TodayUrgency {
  if (!date) return "undated";

  const days = daysBetween(date, today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 3) return "soon";
  return "later";
}

function urgencyScore(urgency: TodayUrgency) {
  return {
    overdue: 110,
    today: 95,
    soon: 72,
    later: 34,
    undated: 8
  }[urgency];
}

function priorityScore(priority: string) {
  return {
    high: 32,
    medium: 16,
    low: 4
  }[priority] ?? 0;
}

export function buildTodayCommandCenter({
  goals,
  milestones,
  careerTargets,
  checkIns,
  today,
  projectedGpa,
  targetGpa,
  language
}: {
  goals: Goal[];
  milestones: Milestone[];
  careerTargets: CareerTarget[];
  checkIns: DailyCheckIn[];
  today: string;
  projectedGpa: number | null;
  targetGpa: number | null;
  language: "en" | "vi";
}) {
  const isVi = language === "vi";
  const goalById = new Map(goals.map((goal) => [goal.id, goal]));
  const checkInByEntity = new Map(
    checkIns.map((checkIn) => [
      `${checkIn.entity_type}:${checkIn.entity_id}`,
      checkIn.state
    ])
  );
  const activeGoals = goals.filter(
    (goal) => !["completed", "paused"].includes(goal.status)
  );
  const openMilestones = milestones.filter(
    (milestone) => {
      const sourceGoal = goalById.get(milestone.goal_id);
      return (
        milestone.status !== "completed" &&
        Boolean(sourceGoal) &&
        !["completed", "paused"].includes(sourceGoal?.status || "")
      );
    }
  );

  const candidates = [
    ...openMilestones.map((milestone) => {
      const sourceGoal = goalById.get(milestone.goal_id);
      const urgency = getUrgency(milestone.due_date, today);
      const progress = Number(sourceGoal?.progress || 0);

      return {
        item: {
          id: milestone.id,
          entityType: "milestone" as const,
          title: milestone.title,
          context:
            sourceGoal?.title ||
            (isVi ? "Mục tiêu chưa xác định" : "Unassigned goal"),
          dueDate: milestone.due_date,
          urgency,
          progress,
          checkInState:
            checkInByEntity.get(`milestone:${milestone.id}`) || null
        },
        score:
          urgencyScore(urgency) +
          priorityScore(sourceGoal?.priority || "medium") +
          (milestone.status === "in_progress" ? 12 : 6) +
          (progress < 40 ? 5 : 0)
      };
    }),
    ...activeGoals
      .filter(
        (goal) =>
          !openMilestones.some((milestone) => milestone.goal_id === goal.id)
      )
      .map((goal) => {
      const urgency = getUrgency(goal.target_date, today);
      const progress = Number(goal.progress || 0);

      return {
        item: {
          id: goal.id,
          entityType: "goal" as const,
          title: goal.title,
          context: isVi
            ? `Mục tiêu ${goal.category}`
            : `${goal.category} goal`,
          dueDate: goal.target_date,
          urgency,
          progress,
          checkInState: checkInByEntity.get(`goal:${goal.id}`) || null
        },
        score:
          urgencyScore(urgency) +
          priorityScore(goal.priority) +
          (goal.status === "in_progress" ? 10 : 0) +
          (progress < 35 ? 6 : 0)
      };
      })
  ]
    .filter(
      ({ item }) =>
        !["completed", "rescheduled"].includes(item.checkInState || "")
    )
    .sort((first, second) => second.score - first.score);

  const priorities = candidates
    .slice(0, 3)
    .map(({ item }) => item) satisfies TodayPriorityItem[];

  const deadlineLimit = dateValue(today) + DAY_IN_MS * 7;
  const deadlines = [
    ...openMilestones.map((milestone) => ({
      id: `milestone-${milestone.id}`,
      title: milestone.title,
      context:
        goalById.get(milestone.goal_id)?.title ||
        (isVi ? "Cột mốc mục tiêu" : "Goal milestone"),
      dueDate: milestone.due_date,
      href: "/goals",
      kind: "milestone" as const
    })),
    ...activeGoals.map((goal) => ({
      id: `goal-${goal.id}`,
      title: goal.title,
      context: isVi ? `Mục tiêu ${goal.category}` : `${goal.category} goal`,
      dueDate: goal.target_date,
      href: "/goals",
      kind: "goal" as const
    })),
    ...careerTargets
      .filter(
        (target) =>
          !["offer", "rejected", "withdrawn"].includes(target.stage)
      )
      .map((target) => ({
        id: `career-${target.id}`,
        title: `${target.role} · ${target.company}`,
        context: isVi ? "Cơ hội nghề nghiệp" : "Career opportunity",
        dueDate: target.deadline,
        href: "/career",
        kind: "career" as const
      }))
  ]
    .filter(
      (item): item is TodayDeadlineItem =>
        Boolean(item.dueDate) &&
        dateValue(item.dueDate as string) >= dateValue(today) &&
        dateValue(item.dueDate as string) <= deadlineLimit
    )
    .sort((first, second) => dateValue(first.dueDate) - dateValue(second.dueDate))
    .slice(0, 6);

  const overdueMilestones = openMilestones.filter(
    (milestone) =>
      milestone.due_date && daysBetween(milestone.due_date, today) < 0
  );
  const overdueGoals = activeGoals.filter(
    (goal) => goal.target_date && daysBetween(goal.target_date, today) < 0
  );
  const slippingGoals = activeGoals.filter((goal) => {
    if (!goal.target_date || goal.priority !== "high" || goal.progress >= 50) {
      return false;
    }

    const remainingDays = daysBetween(goal.target_date, today);
    return remainingDays >= 0 && remainingDays <= 14;
  });
  const goalsWithoutNextStep = activeGoals.filter(
    (goal) =>
      goal.priority === "high" &&
      !openMilestones.some((milestone) => milestone.goal_id === goal.id)
  );

  const risks: TodayRiskItem[] = [];
  const overdueCount = overdueMilestones.length + overdueGoals.length;
  if (overdueCount > 0) {
    risks.push({
      id: "overdue-work",
      title: isVi
        ? `${overdueCount} việc đã quá hạn`
        : `${overdueCount} overdue item${overdueCount > 1 ? "s" : ""}`,
      detail: isVi
        ? "Chốt việc, dời lịch hoặc đánh dấu bị chặn để làm sạch kế hoạch."
        : "Finish, reschedule, or mark them blocked to clean up the plan.",
      href: "/goals",
      severity: "high"
    });
  }

  const blockedCount = checkIns.filter(
    (checkIn) => checkIn.state === "blocked"
  ).length;
  if (blockedCount > 0) {
    risks.push({
      id: "blocked-work",
      title: isVi
        ? `${blockedCount} việc đang bị chặn`
        : `${blockedCount} blocked item${blockedCount > 1 ? "s" : ""}`,
      detail: isVi
        ? "Gỡ phụ thuộc hoặc đổi bước tiếp theo trước khi bắt đầu việc mới."
        : "Clear the dependency or change the next step before starting new work.",
      href: "/goals",
      severity: "high"
    });
  }

  if (
    projectedGpa !== null &&
    targetGpa !== null &&
    projectedGpa < targetGpa
  ) {
    risks.push({
      id: "gpa-gap",
      title: isVi
        ? `GPA dự kiến thấp hơn mục tiêu ${(targetGpa - projectedGpa).toFixed(2)}`
        : `Projected GPA is ${(targetGpa - projectedGpa).toFixed(2)} below target`,
      detail: isVi
        ? "Ưu tiên các môn đang học có khoảng cách điểm lớn nhất."
        : "Prioritize in-progress courses with the largest grade gap.",
      href: "/grades",
      severity: "high"
    });
  }

  if (slippingGoals.length > 0) {
    risks.push({
      id: "slipping-goals",
      title: isVi
        ? `${slippingGoals.length} mục tiêu ưu tiên cao có nguy cơ trễ`
        : `${slippingGoals.length} high-priority goal${slippingGoals.length > 1 ? "s are" : " is"} at risk`,
      detail: isVi
        ? "Còn dưới 14 ngày nhưng tiến độ chưa đạt 50%."
        : "Less than 14 days remain and progress is still below 50%.",
      href: "/goals",
      severity: "medium"
    });
  }

  if (goalsWithoutNextStep.length > 0 && risks.length < 3) {
    risks.push({
      id: "missing-next-step",
      title: isVi
        ? `${goalsWithoutNextStep.length} mục tiêu quan trọng chưa có bước tiếp theo`
        : `${goalsWithoutNextStep.length} important goal${goalsWithoutNextStep.length > 1 ? "s have" : " has"} no next step`,
      detail: isVi
        ? "Thêm một cột mốc nhỏ, có ngày hoàn thành rõ ràng."
        : "Add one small milestone with a clear due date.",
      href: "/goals",
      severity: "medium"
    });
  }

  if (risks.length === 0) {
    risks.push({
      id: "all-clear",
      title: isVi ? "Chưa có rủi ro nổi bật" : "No major risk detected",
      detail: isVi
        ? "Kế hoạch hiện tại đang sạch. Hãy bảo vệ ba ưu tiên hôm nay."
        : "Your plan is clean. Protect the three priorities for today.",
      href: "/goals",
      severity: "clear"
    });
  }

  return {
    priorities,
    deadlines,
    risks: risks.slice(0, 3)
  };
}
