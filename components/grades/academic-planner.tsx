"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck, CalendarDays, Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  calculateCompletedCredits,
  calculateCreditProgress,
  calculateGpa,
  calculateProjectedGpa,
  calculateRequiredAverageForTarget
} from "@/lib/calculations/academic";
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
  intelligence: {
    creditProgress: string;
    graduationTarget: string;
    projectedGpa: string;
    simulator: string;
    simulatorLabel: string;
    requiredAverage: string;
    targetGpa: string;
    remainingCredits: string;
    onTrack: string;
    needsFocus: string;
    noRemainingCourses: string;
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
  actions: {
    edit: string;
    save: string;
    cancel: string;
    confirmDeleteSemester: string;
    confirmDeleteCourse: string;
  };
  empty: {
    title: string;
    description: string;
  };
};

type SemesterDraft = {
  name: string;
  yearIndex: string;
  term: string;
};

type CourseDraft = {
  semesterId: string;
  code: string;
  name: string;
  credits: string;
  targetGrade: string;
  finalGrade: string;
  status: string;
};

const termOptions = ["fall", "spring", "summer", "winter", "other"];
const statusOptions = ["planned", "in_progress", "completed", "dropped"];

export function AcademicPlanner({
  userId,
  initialSemesters,
  initialCourses,
  targetGpa,
  graduationCreditTarget,
  copy
}: {
  userId: string;
  initialSemesters: Semester[];
  initialCourses: Course[];
  targetGpa: number | null;
  graduationCreditTarget: number;
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
  const [simulatedGrade, setSimulatedGrade] = useState(String(targetGpa || "3.70"));
  const [editingSemesterId, setEditingSemesterId] = useState("");
  const [semesterDraft, setSemesterDraft] = useState<SemesterDraft>({ name: "", yearIndex: "1", term: "fall" });
  const [editingCourseId, setEditingCourseId] = useState("");
  const [courseDraft, setCourseDraft] = useState<CourseDraft>({
    semesterId: "",
    code: "",
    name: "",
    credits: "3",
    targetGrade: "",
    finalGrade: "",
    status: "planned"
  });
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

  const gpa = calculateGpa(initialCourses);
  const completedCredits = calculateCompletedCredits(initialCourses);
  const targetCredits = graduationCreditTarget || 128;
  const creditProgress = calculateCreditProgress(completedCredits, targetCredits);
  const projectedGpa = calculateProjectedGpa(initialCourses, null);
  const simulatedGpa = calculateProjectedGpa(initialCourses, Number(simulatedGrade || 0));
  const requiredAverage = calculateRequiredAverageForTarget(initialCourses, targetGpa);
  const remainingCredits = initialCourses
    .filter((course) => course.status !== "completed" && course.status !== "dropped")
    .reduce((total, course) => total + Number(course.credits || 0), 0);
  const isOnTrack = targetGpa && (simulatedGpa || gpa || 0) >= targetGpa;
  const isBusy = Boolean(pendingAction);

  async function createSemester(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("create-semester");
    setError("");

    const { error: insertError } = await supabase.from("semesters").insert({
      user_id: userId,
      name: semesterName,
      year_index: Number(yearIndex),
      term
    });

    if (insertError) {
      setError(insertError.message);
      setPendingAction("");
      return;
    }

    setSemesterName("");
    setPendingAction("");
    router.refresh();
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingAction("create-course");
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
      setPendingAction("");
      return;
    }

    setCourseCode("");
    setCourseName("");
    setFinalGrade("");
    setPendingAction("");
    router.refresh();
  }

  function startEditingSemester(semester: Semester) {
    setEditingSemesterId(semester.id);
    setSemesterDraft({
      name: semester.name,
      yearIndex: String(semester.year_index),
      term: semester.term
    });
  }

  async function updateSemester(semesterId: string) {
    setPendingAction(`semester-${semesterId}`);
    setError("");

    const { error: updateError } = await supabase
      .from("semesters")
      .update({
        name: semesterDraft.name,
        year_index: Number(semesterDraft.yearIndex),
        term: semesterDraft.term
      })
      .eq("id", semesterId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    setEditingSemesterId("");
    setPendingAction("");
    router.refresh();
  }

  async function deleteSemester(semesterId: string) {
    if (!window.confirm(copy.actions.confirmDeleteSemester)) {
      return;
    }

    setPendingAction(`delete-semester-${semesterId}`);
    setError("");
    const { error: deleteError } = await supabase.from("semesters").delete().eq("id", semesterId).eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      setPendingAction("");
      return;
    }

    setPendingAction("");
    router.refresh();
  }

  function startEditingCourse(course: Course) {
    setEditingCourseId(course.id);
    setCourseDraft({
      semesterId: course.semester_id,
      code: course.code || "",
      name: course.name,
      credits: String(course.credits),
      targetGrade: course.target_grade === null ? "" : String(course.target_grade),
      finalGrade: course.final_grade === null ? "" : String(course.final_grade),
      status: course.status
    });
  }

  async function updateCourse(courseId: string) {
    setPendingAction(`course-${courseId}`);
    setError("");

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        semester_id: courseDraft.semesterId,
        code: courseDraft.code || null,
        name: courseDraft.name,
        credits: Number(courseDraft.credits),
        target_grade: courseDraft.targetGrade ? Number(courseDraft.targetGrade) : null,
        final_grade: courseDraft.finalGrade ? Number(courseDraft.finalGrade) : null,
        status: courseDraft.status
      })
      .eq("id", courseId)
      .eq("user_id", userId);

    if (updateError) {
      setError(updateError.message);
      setPendingAction("");
      return;
    }

    setEditingCourseId("");
    setPendingAction("");
    router.refresh();
  }

  async function deleteCourse(courseId: string) {
    if (!window.confirm(copy.actions.confirmDeleteCourse)) {
      return;
    }

    setPendingAction(`delete-course-${courseId}`);
    setError("");
    const { error: deleteError } = await supabase.from("courses").delete().eq("id", courseId).eq("user_id", userId);

    if (deleteError) {
      setError(deleteError.message);
      setPendingAction("");
      return;
    }

    setPendingAction("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={copy.summary.currentGpa} value={gpa === null ? copy.summary.unavailable : String(gpa)} />
        <SummaryCard label={copy.summary.completedCredits} value={String(completedCredits)} />
        <SummaryCard label={copy.summary.coursesTracked} value={String(initialCourses.length)} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-400">{copy.intelligence.creditProgress}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-white">{creditProgress}%</p>
            </div>
            <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-200/16">
              {completedCredits}/{targetCredits}
            </span>
          </div>
          <div className="mt-5 h-2 rounded-full bg-slate-800">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" style={{ width: `${creditProgress}%` }} />
          </div>
          <p className="mt-3 text-sm text-slate-500">{copy.intelligence.graduationTarget}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <p className="text-sm text-slate-400">{copy.intelligence.projectedGpa}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-white">
            {projectedGpa === null ? copy.summary.unavailable : projectedGpa}
          </p>
          <p className="mt-3 text-sm text-slate-500">{copy.intelligence.targetGpa}: {targetGpa || copy.summary.unavailable}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
          <p className="text-sm text-slate-400">{copy.intelligence.simulator}</p>
          <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
            <Input label={copy.intelligence.simulatorLabel} type="number" step="0.01" min="0" max="4.3" value={simulatedGrade} onChange={setSimulatedGrade} placeholder="3.70" />
            <p className="pb-2 font-display text-3xl font-semibold text-white">
              {simulatedGpa === null ? copy.summary.unavailable : simulatedGpa}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-950/52 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">{copy.intelligence.requiredAverage}</p>
            <p className="mt-2 text-lg text-slate-200">
              {remainingCredits > 0 && requiredAverage !== null
                ? `${requiredAverage} / ${copy.intelligence.remainingCredits}: ${remainingCredits}`
                : copy.intelligence.noRemainingCourses}
            </p>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ${isOnTrack ? "bg-emerald-300/10 text-emerald-100 ring-emerald-200/16" : "bg-amber-300/10 text-amber-100 ring-amber-200/16"}`}>
            {isOnTrack ? copy.intelligence.onTrack : copy.intelligence.needsFocus}
          </span>
        </div>
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
              <Button type="submit" className="w-full" disabled={isBusy}>
                {pendingAction === "create-semester" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
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
              <Select label={copy.courseForm.semester} value={selectedSemesterId} onChange={setSelectedSemesterId} options={initialSemesters.map((semester) => semester.id)} labels={Object.fromEntries(initialSemesters.map((semester) => [semester.id, semester.name]))} placeholder={copy.courseForm.semesterEmpty} required />
              <Input label={copy.courseForm.code} value={courseCode} onChange={setCourseCode} placeholder={copy.courseForm.codePlaceholder} required={false} />
              <Input label={copy.courseForm.name} value={courseName} onChange={setCourseName} placeholder={copy.courseForm.namePlaceholder} />
              <Input label={copy.courseForm.credits} type="number" step="0.5" value={credits} onChange={setCredits} placeholder="3" />
              <Input label={copy.courseForm.targetGrade} type="number" step="0.01" value={targetGrade} onChange={setTargetGrade} placeholder="3.70" required={false} />
              <Input label={copy.courseForm.finalGrade} type="number" step="0.01" value={finalGrade} onChange={setFinalGrade} placeholder="4.00" required={false} />
              <Select label={copy.courseForm.status} value={status} onChange={setStatus} options={statusOptions} labels={copy.statuses} />
              <Button type="submit" className="w-full" disabled={isBusy || !selectedSemesterId}>
                {pendingAction === "create-course" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
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
            const isEditingSemester = editingSemesterId === semester.id;

            return (
              <section key={semester.id} className="glass rounded-[2rem] p-5">
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {isEditingSemester ? (
                    <div className="grid w-full gap-3 sm:grid-cols-[1fr_120px_150px]">
                      <Input label={copy.semesterForm.name} value={semesterDraft.name} onChange={(value) => setSemesterDraft((draft) => ({ ...draft, name: value }))} placeholder={copy.semesterForm.namePlaceholder} />
                      <Input label={copy.semesterForm.yearIndex} type="number" value={semesterDraft.yearIndex} onChange={(value) => setSemesterDraft((draft) => ({ ...draft, yearIndex: value }))} placeholder="1" />
                      <Select label={copy.semesterForm.term} value={semesterDraft.term} onChange={(value) => setSemesterDraft((draft) => ({ ...draft, term: value }))} options={termOptions} labels={copy.terms} />
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-sky-200">{copy.table.year} {semester.year_index} / {copy.terms[semester.term] || semester.term}</p>
                      <h2 className="mt-1 font-display text-2xl font-semibold text-white">{semester.name}</h2>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {isEditingSemester ? (
                      <>
                        <IconButton label={copy.actions.save} disabled={isBusy} onClick={() => updateSemester(semester.id)} icon={Save} />
                        <IconButton label={copy.actions.cancel} disabled={isBusy} onClick={() => setEditingSemesterId("")} icon={X} />
                      </>
                    ) : (
                      <>
                        <IconButton label={copy.actions.edit} disabled={isBusy} onClick={() => startEditingSemester(semester)} icon={Pencil} />
                        <IconButton label={copy.table.delete} disabled={isBusy} onClick={() => deleteSemester(semester.id)} icon={Trash2} danger />
                      </>
                    )}
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid min-w-[760px] grid-cols-[1fr_0.55fr_0.55fr_0.55fr_0.75fr_92px] gap-2 bg-white/8 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
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
                  {courses.map((course) => {
                    const isEditingCourse = editingCourseId === course.id;

                    return (
                      <div key={course.id} className="grid min-w-[760px] grid-cols-[1fr_0.55fr_0.55fr_0.55fr_0.75fr_92px] gap-2 border-t border-white/10 px-4 py-4 text-sm text-slate-200">
                        {isEditingCourse ? (
                          <>
                            <div className="space-y-2">
                              <Select label={copy.courseForm.semester} value={courseDraft.semesterId} onChange={(value) => setCourseDraft((draft) => ({ ...draft, semesterId: value }))} options={initialSemesters.map((item) => item.id)} labels={Object.fromEntries(initialSemesters.map((item) => [item.id, item.name]))} />
                              <Input label={copy.courseForm.code} value={courseDraft.code} onChange={(value) => setCourseDraft((draft) => ({ ...draft, code: value }))} placeholder={copy.courseForm.codePlaceholder} required={false} />
                              <Input label={copy.courseForm.name} value={courseDraft.name} onChange={(value) => setCourseDraft((draft) => ({ ...draft, name: value }))} placeholder={copy.courseForm.namePlaceholder} />
                            </div>
                            <Input label={copy.table.credits} type="number" step="0.5" value={courseDraft.credits} onChange={(value) => setCourseDraft((draft) => ({ ...draft, credits: value }))} placeholder="3" />
                            <Input label={copy.table.target} type="number" step="0.01" value={courseDraft.targetGrade} onChange={(value) => setCourseDraft((draft) => ({ ...draft, targetGrade: value }))} placeholder="3.70" required={false} />
                            <Input label={copy.table.final} type="number" step="0.01" value={courseDraft.finalGrade} onChange={(value) => setCourseDraft((draft) => ({ ...draft, finalGrade: value }))} placeholder="4.00" required={false} />
                            <Select label={copy.table.status} value={courseDraft.status} onChange={(value) => setCourseDraft((draft) => ({ ...draft, status: value }))} options={statusOptions} labels={copy.statuses} />
                            <div className="flex items-start gap-2 pt-7">
                              <IconButton label={copy.actions.save} disabled={isBusy} onClick={() => updateCourse(course.id)} icon={Save} />
                              <IconButton label={copy.actions.cancel} disabled={isBusy} onClick={() => setEditingCourseId("")} icon={X} />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <div className="font-semibold text-white">{course.name}</div>
                              <div className="mt-1 text-xs text-slate-500">{course.code || copy.table.noCode}</div>
                            </div>
                            <span>{course.credits}</span>
                            <span>{course.target_grade ?? "-"}</span>
                            <span>{course.final_grade ?? "-"}</span>
                            <span>{copy.statuses[course.status] || course.status}</span>
                            <div className="flex gap-2">
                              <IconButton label={copy.actions.edit} disabled={isBusy} onClick={() => startEditingCourse(course)} icon={Pencil} />
                              <IconButton label={copy.table.delete} disabled={isBusy} onClick={() => deleteCourse(course.id)} icon={Trash2} danger />
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
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
  min,
  max,
  required = true
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <input
        required={required}
        type={type}
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition-colors placeholder:text-slate-600 focus:border-sky-300/50"
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
  labels,
  placeholder,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels: Record<string, string>;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <select required={required} className="mt-2 h-11 w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none focus:border-sky-300/50" value={value} onChange={(event) => onChange(event.target.value)}>
        {placeholder ? <option value="" disabled>{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option} value={option}>{labels[option] || option}</option>
        ))}
      </select>
    </label>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  disabled,
  danger = false
}: {
  label: string;
  icon: typeof Pencil;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors disabled:pointer-events-none disabled:opacity-50 ${
        danger ? "text-slate-500 hover:bg-red-400/10 hover:text-red-100" : "text-slate-400 hover:bg-white/8 hover:text-white"
      }`}
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
