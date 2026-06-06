"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, CalendarDays, Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { calculateCompletedCredits, calculateGpa } from "@/lib/calculations/academic";
import { createClient } from "@/lib/supabase/client";

type Semester = {
  id: string;
  user_id: string;
  name: string;
  year_index: number;
  term: string;
};

type Course = {
  id: string;
  user_id: string;
  semester_id: string;
  code: string | null;
  name: string;
  credits: number;
  target_grade: number | null;
  final_grade: number | null;
  status: string;
};

type AcademicPlannerCopy = {
  summary: {
    currentGpa: string;
    completedCredits: string;
    coursesTracked: string;
    unavailable: string;
  };
  semesterForm: {
    title: string;
    name: string;
    namePlaceholder: string;
    yearIndex: string;
    term: string;
    submit: string;
  };
  courseForm: {
    title: string;
    semester: string;
    semesterEmpty: string;
    code: string;
    codePlaceholder: string;
    name: string;
    namePlaceholder: string;
    credits: string;
    targetGrade: string;
    finalGrade: string;
    status: string;
    submit: string;
  };
  terms: Record<string, string>;
  statuses: Record<string, string>;
  table: {
    year: string;
    course: string;
    credits: string;
    target: string;
    final: string;
    status: string;
    delete: string;
    noCode: string;
    noCourses: string;
  };
  empty: {
    title: string;
    description: string;
  };
};

const termOptions = ["fall", "spring", "summer", "winter", "other"];
const statusOptions = ["planned", "in_progress", "completed", "dropped"];

export function AcademicPlanner({
  userId,
  initialSemesters,
  initialCourses,
  copy
}: {
  userId: string;
  initialSemesters: Semester[];
  initialCourses: Course[];
  copy: AcademicPlannerCopy;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [semesterName, setSemesterName] = useState("");
  const [yearIndex, setYearIndex] = useState("1");
  const [term, setTerm] = useState("fall");
  const [selectedSemesterId, setSelectedSemesterId] = useState(initialSemesters[0]?.id || "");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [credits, setCredits] = useState("3");
  const [targetGrade, setTargetGrade] = useState("3.70");
  const [finalGrade, setFinalGrade] = useState("");
  const [status, setStatus] = useState("planned");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const gpa = calculateGpa(initialCourses);
  const completedCredits = calculateCompletedCredits(initialCourses);

  async function createSemester(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("semesters").insert({
      user_id: userId,
      name: semesterName,
      year_index: Number(yearIndex),
      term
    });

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    setSemesterName("");
    setIsLoading(false);
    router.refresh();
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("courses").insert({
      user_id: userId,
      semester_id: selectedSemesterId,
      code: courseCode || null,
      name: courseName,
      credits: Number(credits),
      target_grade: targetGrade ? Number(targetGrade) : null,
      final_grade: finalGrade ? Number(finalGrade) : null,
      status
    });

    if (insertError) {
      setError(insertError.message);
      setIsLoading(false);
      return;
    }

    setCourseCode("");
    setCourseName("");
    setFinalGrade("");
    setIsLoading(false);
    router.refresh();
  }

  async function deleteCourse(courseId: string) {
    setError("");
    const { error: deleteError } = await supabase.from("courses").delete().eq("id", courseId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
  }

  async function deleteSemester(semesterId: string) {
    setError("");
    const { error: deleteError } = await supabase.from("semesters").delete().eq("id", semesterId);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={copy.summary.currentGpa} value={gpa === null ? copy.summary.unavailable : String(gpa)} />
        <SummaryCard label={copy.summary.completedCredits} value={String(completedCredits)} />
        <SummaryCard label={copy.summary.coursesTracked} value={String(initialCourses.length)} />
      </section>

      {error ? (
        <div className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="space-y-6">
          <form className="glass rounded-[2rem] p-5" onSubmit={createSemester}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200 ring-1 ring-sky-200/16">
                <CalendarDays className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white">{copy.semesterForm.title}</h2>
            </div>
            <div className="space-y-3">
              <Input label={copy.semesterForm.name} value={semesterName} onChange={setSemesterName} placeholder={copy.semesterForm.namePlaceholder} />
              <Input label={copy.semesterForm.yearIndex} type="number" value={yearIndex} onChange={setYearIndex} placeholder="1" />
              <Select label={copy.semesterForm.term} value={term} onChange={setTerm} options={termOptions} labels={copy.terms} />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {copy.semesterForm.submit}
              </Button>
            </div>
          </form>

          <form className="glass rounded-[2rem] p-5" onSubmit={createCourse}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-300/10 text-emerald-200 ring-1 ring-emerald-200/16">
                <BookOpenCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display text-xl font-semibold text-white">{copy.courseForm.title}</h2>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-200">{copy.courseForm.semester}</span>
                <select required className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none focus:border-sky-300/50" value={selectedSemesterId} onChange={(event) => setSelectedSemesterId(event.target.value)}>
                  <option value="" disabled>{copy.courseForm.semesterEmpty}</option>
                  {initialSemesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>{semester.name}</option>
                  ))}
                </select>
              </label>
              <Input label={copy.courseForm.code} value={courseCode} onChange={setCourseCode} placeholder={copy.courseForm.codePlaceholder} required={false} />
              <Input label={copy.courseForm.name} value={courseName} onChange={setCourseName} placeholder={copy.courseForm.namePlaceholder} />
              <Input label={copy.courseForm.credits} type="number" step="0.5" value={credits} onChange={setCredits} placeholder="3" />
              <Input label={copy.courseForm.targetGrade} type="number" step="0.01" value={targetGrade} onChange={setTargetGrade} placeholder="3.70" required={false} />
              <Input label={copy.courseForm.finalGrade} type="number" step="0.01" value={finalGrade} onChange={setFinalGrade} placeholder="4.00" required={false} />
              <Select label={copy.courseForm.status} value={status} onChange={setStatus} options={statusOptions} labels={copy.statuses} />
              <Button type="submit" className="w-full" disabled={isLoading || !selectedSemesterId}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {copy.courseForm.submit}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          {initialSemesters.length === 0 ? (
            <div className="glass rounded-[2rem] p-8 text-center">
              <h2 className="font-display text-2xl font-semibold text-white">{copy.empty.title}</h2>
              <p className="mt-3 text-slate-400">{copy.empty.description}</p>
            </div>
          ) : null}

          {initialSemesters.map((semester) => {
            const courses = initialCourses.filter((course) => course.semester_id === semester.id);

            return (
              <section key={semester.id} className="glass rounded-[2rem] p-5">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-sky-200">{copy.table.year} {semester.year_index} / {copy.terms[semester.term] || semester.term}</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-white">{semester.name}</h2>
                  </div>
                  <button type="button" onClick={() => deleteSemester(semester.id)} className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-white/10 px-4 text-sm font-semibold text-slate-300 transition-colors hover:bg-red-400/10 hover:text-red-100">
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {copy.table.delete}
                  </button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid grid-cols-[1fr_0.7fr_0.6fr_0.6fr_0.7fr_44px] gap-2 bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    <span>{copy.table.course}</span>
                    <span>{copy.table.credits}</span>
                    <span>{copy.table.target}</span>
                    <span>{copy.table.final}</span>
                    <span>{copy.table.status}</span>
                    <span />
                  </div>
                  {courses.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-400">{copy.table.noCourses}</div>
                  ) : null}
                  {courses.map((course) => (
                    <div key={course.id} className="grid grid-cols-[1fr_0.7fr_0.6fr_0.6fr_0.7fr_44px] gap-2 border-t border-white/10 px-4 py-4 text-sm text-slate-200">
                      <div>
                        <div className="font-semibold text-white">{course.name}</div>
                        <div className="mt-1 text-xs text-slate-500">{course.code || copy.table.noCode}</div>
                      </div>
                      <span>{course.credits}</span>
                      <span>{course.target_grade ?? "-"}</span>
                      <span>{course.final_grade ?? "-"}</span>
                      <span>{copy.statuses[course.status] || course.status}</span>
                      <button type="button" onClick={() => deleteCourse(course.id)} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-red-400/10 hover:text-red-100" aria-label={copy.table.delete}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 font-display text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  step,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        required={required}
        type={type}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
        placeholder={placeholder}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  labels
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels: Record<string, string>;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <select className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-white outline-none focus:border-sky-300/50" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>{labels[option] || option}</option>
        ))}
      </select>
    </label>
  );
}
