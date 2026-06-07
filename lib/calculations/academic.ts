export type CourseForCalculation = {
  credits: number;
  target_grade?: number | null;
  final_grade: number | null;
  status: string;
};

export function calculateCompletedCredits(courses: CourseForCalculation[]) {
  return courses
    .filter((course) => course.status === "completed")
    .reduce((total, course) => total + Number(course.credits || 0), 0);
}

export function calculateGpa(courses: CourseForCalculation[]) {
  const completedCourses = courses.filter(
    (course) => course.status === "completed" && course.final_grade !== null
  );

  const totalCredits = completedCourses.reduce(
    (total, course) => total + Number(course.credits || 0),
    0
  );

  if (totalCredits === 0) {
    return null;
  }

  const totalPoints = completedCourses.reduce(
    (total, course) => total + Number(course.credits || 0) * Number(course.final_grade || 0),
    0
  );

  return Number((totalPoints / totalCredits).toFixed(2));
}

export function calculateCreditProgress(completedCredits: number, targetCredits: number) {
  if (targetCredits <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completedCredits / targetCredits) * 100));
}

export function calculateProjectedGpa(courses: CourseForCalculation[], fallbackGrade?: number | null) {
  const projectedCourses = courses.filter((course) => course.status !== "dropped");

  let gradedCredits = 0;
  const totalPoints = projectedCourses.reduce((total, course) => {
    const projectedGrade =
      course.status === "completed" && course.final_grade !== null
        ? Number(course.final_grade)
        : course.target_grade !== null && course.target_grade !== undefined
          ? Number(course.target_grade)
          : fallbackGrade !== null && fallbackGrade !== undefined
            ? Number(fallbackGrade)
            : null;

    if (projectedGrade === null) {
      return total;
    }

    gradedCredits += Number(course.credits || 0);
    return total + Number(course.credits || 0) * projectedGrade;
  }, 0);

  if (gradedCredits === 0) {
    return null;
  }

  return Number((totalPoints / gradedCredits).toFixed(2));
}

export function calculateRequiredAverageForTarget(
  courses: CourseForCalculation[],
  targetGpa: number | null | undefined
) {
  if (!targetGpa) {
    return null;
  }

  const completedCourses = courses.filter(
    (course) => course.status === "completed" && course.final_grade !== null
  );
  const remainingCourses = courses.filter(
    (course) => course.status !== "completed" && course.status !== "dropped"
  );
  const completedCredits = completedCourses.reduce(
    (total, course) => total + Number(course.credits || 0),
    0
  );
  const remainingCredits = remainingCourses.reduce(
    (total, course) => total + Number(course.credits || 0),
    0
  );

  if (remainingCredits === 0) {
    return null;
  }

  const completedPoints = completedCourses.reduce(
    (total, course) => total + Number(course.credits || 0) * Number(course.final_grade || 0),
    0
  );
  const requiredAverage = (Number(targetGpa) * (completedCredits + remainingCredits) - completedPoints) / remainingCredits;

  return Number(Math.max(0, Math.min(4.3, requiredAverage)).toFixed(2));
}
