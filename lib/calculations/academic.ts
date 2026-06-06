export type CourseForCalculation = {
  credits: number;
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
