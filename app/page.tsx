"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  BriefcaseBusiness,
  CalendarClock,
  ChevronRight,
  CircleCheck,
  Code2,
  Compass,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  LineChart,
  Medal,
  Network,
  Play,
  Sparkles,
  Target,
  Trophy,
  UsersRound,
  Zap
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const problems = [
  {
    title: "Missed opportunities",
    copy: "Scholarships, assistant roles, competitions, and research windows vanish without a living plan.",
    icon: Compass
  },
  {
    title: "Poor planning",
    copy: "Course prerequisites, credit loads, and graduation targets become painful when tracked too late.",
    icon: CalendarClock
  },
  {
    title: "Forgotten goals",
    copy: "Big ambitions get buried under weekly assignments when there is no operating rhythm.",
    icon: Target
  },
  {
    title: "Weak portfolios",
    copy: "Projects, clubs, leadership, and papers stay scattered instead of becoming a coherent story.",
    icon: FolderKanban
  },
  {
    title: "Last-minute careers",
    copy: "Internship preparation starts too close to deadline, with missing evidence and shallow practice.",
    icon: BriefcaseBusiness
  }
];

const solutionItems = [
  { label: "Academic Planning", value: "126 credits mapped", icon: BookOpenCheck },
  { label: "Research Tracking", value: "3 papers in motion", icon: FlaskConical },
  { label: "Club Participation", value: "2 leadership arcs", icon: UsersRound },
  { label: "Skill Development", value: "41 skills leveled", icon: BrainCircuit },
  { label: "Career Preparation", value: "86 readiness score", icon: Medal }
];

const roadmap = [
  {
    year: "Year 1",
    title: "Foundation",
    gpa: "3.55",
    focus: "Core courses, clubs, study rhythm",
    stats: ["32 credits", "2 clubs", "4 portfolio notes"]
  },
  {
    year: "Year 2",
    title: "Direction",
    gpa: "3.71",
    focus: "Research lab, skill stacks, first projects",
    stats: ["64 credits", "1 lab", "8 GitHub builds"]
  },
  {
    year: "Year 3",
    title: "Evidence",
    gpa: "3.82",
    focus: "Leadership, internships, papers",
    stats: ["96 credits", "2 internships", "1 publication"]
  },
  {
    year: "Year 4",
    title: "Launch",
    gpa: "3.88",
    focus: "Graduate school, capstone, career story",
    stats: ["128 credits", "9 applications", "94 career score"]
  }
];

const skillNodes = [
  { name: "Python", level: 96, x: "8%", y: "52%" },
  { name: "ML", level: 78, x: "29%", y: "24%" },
  { name: "Deep Learning", level: 64, x: "52%", y: "18%" },
  { name: "NLP", level: 58, x: "76%", y: "34%" },
  { name: "Vision", level: 46, x: "69%", y: "70%" },
  { name: "Papers", level: 72, x: "42%", y: "72%" },
  { name: "Kaggle", level: 61, x: "19%", y: "78%" },
  { name: "GitHub", level: 88, x: "88%", y: "58%" }
];

const features = [
  { title: "Academic Dashboard", icon: GraduationCap, text: "Courses, credits, GPA, prerequisites, and semester load in one command center." },
  { title: "Goal Management", icon: Target, text: "Turn graduation targets into weekly milestones with visible momentum." },
  { title: "Research Workspace", icon: FlaskConical, text: "Track papers, advisors, datasets, experiments, and submission deadlines." },
  { title: "Club Tracker", icon: UsersRound, text: "Map participation, leadership roles, events, and portfolio-worthy impact." },
  { title: "Skill Tree", icon: BrainCircuit, text: "Level up technical, academic, and career skills with evidence attached." },
  { title: "Achievement Portfolio", icon: Trophy, text: "Collect proof across courses, projects, research, and leadership." },
  { title: "Career Planner", icon: BriefcaseBusiness, text: "Prepare internship targets, resumes, interviews, and application sprints." },
  { title: "Analytics Dashboard", icon: BarChart3, text: "Spot trends before they become risks with clear progress intelligence." }
];

const testimonials = [
  {
    quote:
      "Study Goal turned my semester planning from guesswork into a clear roadmap. I finally saw which courses, projects, and research moves supported my transfer plan.",
    name: "Maya Tran",
    role: "Computer Science, sophomore",
    result: "GPA from 3.42 to 3.78"
  },
  {
    quote:
      "I used to keep research notes, club work, and internship prep in separate apps. Now my portfolio is building itself as I go.",
    name: "Jordan Ellis",
    role: "Data Science, junior",
    result: "2 internship offers"
  },
  {
    quote:
      "The four-year view changed how I think. I stopped reacting to deadlines and started designing the university story I wanted admissions teams to see.",
    name: "Ari Chen",
    role: "AI research track, senior",
    result: "Graduate applications ready 6 weeks early"
  }
];

export default function Home() {
  const [activeYear, setActiveYear] = useState(1);

  return (
    <main className="relative overflow-hidden">
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <Roadmap activeYear={activeYear} setActiveYear={setActiveYear} />
      <AiMode />
      <Features />
      <Analytics />
      <Testimonials />
      <FinalCta />
    </main>
  );
}

function Nav() {
  return (
    <header className="fixed left-3 right-3 top-3 z-50 mx-auto max-w-7xl rounded-full border border-white/12 bg-slate-950/64 px-4 py-3 shadow-2xl shadow-black/35 backdrop-blur-2xl sm:left-6 sm:right-6">
      <nav className="flex items-center justify-between gap-4">
        <a href="#" className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-300 via-indigo-400 to-emerald-300 text-slate-950 shadow-glow-blue">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-display text-base font-semibold tracking-normal">Study Goal</span>
        </a>
        <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          <a className="transition-colors hover:text-white" href="#roadmap">Roadmap</a>
          <a className="transition-colors hover:text-white" href="#ai-mode">AI Mode</a>
          <a className="transition-colors hover:text-white" href="#features">Features</a>
          <a className="transition-colors hover:text-white" href="#analytics">Analytics</a>
        </div>
        <Button asChild size="default" className="hidden sm:inline-flex">
          <a href="#start">Get Started</a>
        </Button>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/18 bg-emerald-300/8 px-4 py-2 text-sm font-medium text-emerald-100 shadow-glow-emerald">
            <Zap className="h-4 w-4" aria-hidden="true" />
            Turn Your University Journey Into a Master Plan.
          </div>
          <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[1.02] tracking-normal text-balance text-white sm:text-6xl lg:text-7xl">
            Your Entire University Journey, Visualized.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 text-pretty">
            Plan your courses, track your GPA, manage research projects, join clubs, build skills, and prepare for your dream career-all in one place.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#start">
                Get Started <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <a href="#demo">
                <Play className="h-4 w-4" aria-hidden="true" /> Watch Demo
              </a>
            </Button>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[
              ["4 years", "planned"],
              ["94%", "career ready"],
              ["41", "skills leveled"]
            ].map(([value, label]) => (
              <div key={label} className="glass-soft rounded-lg px-4 py-3">
                <div className="font-display text-2xl font-semibold text-white">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="relative"
          id="demo"
        >
          <DashboardVisual />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardVisual() {
  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-3 shadow-glow-blue">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-sky-400/18 to-transparent" />
      <div className="relative rounded-[1.5rem] border border-white/10 bg-slate-950/68 p-4 sm:p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-sky-200">Master Plan</p>
            <h2 className="font-display text-xl font-semibold text-white">University OS</h2>
          </div>
          <div className="rounded-full border border-emerald-300/24 bg-emerald-300/10 px-3 py-1.5 text-sm text-emerald-100">
            On track
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">4-year roadmap</span>
                <span className="text-xs text-slate-400">128 credits</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {roadmap.map((item, index) => (
                  <div key={item.year} className="rounded-xl bg-slate-900/80 p-3">
                    <div className="mb-3 h-1.5 rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300"
                        style={{ width: `${42 + index * 15}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-400">{item.year}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{item.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricPanel title="GPA tracker" value="3.82" accent="from-sky-300 to-indigo-300" />
              <MetricPanel title="Career readiness" value="86" accent="from-emerald-300 to-teal-200" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-200">AI skill tree</span>
                <Code2 className="h-4 w-4 text-sky-200" aria-hidden="true" />
              </div>
              <div className="relative h-44 overflow-hidden rounded-xl bg-slate-950/70">
                <div className="absolute left-[16%] top-[52%] h-px w-[66%] rotate-[-18deg] bg-sky-300/30" />
                <div className="absolute left-[22%] top-[50%] h-px w-[58%] rotate-[26deg] bg-emerald-300/30" />
                {skillNodes.slice(0, 6).map((node) => (
                  <div
                    key={node.name}
                    className="absolute flex h-12 w-12 items-center justify-center rounded-full border border-white/18 bg-gradient-to-br from-slate-800 to-slate-950 text-[10px] font-semibold text-white shadow-glow-blue"
                    style={{ left: node.x, top: node.y }}
                  >
                    {node.name.split(" ")[0]}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-200">Research progress</span>
                <span className="text-emerald-200">72%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-300 to-sky-300" />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-slate-300">
                <span className="rounded-lg bg-white/6 py-2">Dataset</span>
                <span className="rounded-lg bg-white/6 py-2">Draft</span>
                <span className="rounded-lg bg-white/6 py-2">Submit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricPanel({ title, value, accent }: { title: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-2 flex items-end justify-between">
        <div className="font-display text-4xl font-semibold text-white">{value}</div>
        <div className="flex h-16 items-end gap-1">
          {[42, 52, 48, 65, 74, 86].map((height, index) => (
            <div
              key={index}
              className={cn("w-2 rounded-full bg-gradient-to-t", accent)}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      variants={fadeIn}
      transition={{ duration: 0.55 }}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-sky-200">{eyebrow}</p>
      <h2 className="font-display text-4xl font-semibold tracking-normal text-balance text-white sm:text-5xl">
        {title}
      </h2>
      {copy ? <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300 text-pretty">{copy}</p> : null}
    </motion.div>
  );
}

function Problem() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="The hidden cost"
          title="Most Students Drift Through University."
          copy="The problem is rarely ambition. It is the absence of a system that connects today&apos;s choices to a four-year outcome."
        />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.055] p-5 transition-colors duration-200 hover:border-sky-300/30 hover:bg-white/[0.085]"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-sky-200 ring-1 ring-white/10 transition-colors group-hover:text-emerald-200">
                <problem.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{problem.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{problem.copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solution() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="A student operating system"
          title="Study Goal Helps You Stay Ahead."
          copy="Every academic, professional, and personal growth signal flows into one elegant dashboard."
        />
        <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-3">
            {solutionItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="glass-soft flex items-center justify-between rounded-2xl p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200 ring-1 ring-sky-200/16">
                    <item.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-white">{item.label}</span>
                </div>
                <span className="text-sm text-emerald-200">{item.value}</span>
              </motion.div>
            ))}
          </div>
          <div className="glass rounded-[2rem] p-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Command center</p>
                  <h3 className="font-display text-2xl font-semibold text-white">Spring 2027 Sprint</h3>
                </div>
                <div className="rounded-full bg-emerald-300/10 px-3 py-1.5 text-sm text-emerald-100 ring-1 ring-emerald-200/18">
                  91% aligned
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {["Courses", "Research", "Career"].map((label, index) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <div className="text-sm text-slate-400">{label}</div>
                    <div className="mt-3 h-28 rounded-xl bg-gradient-to-b from-slate-800 to-slate-950 p-3">
                      <div className="flex h-full items-end gap-2">
                        {[42, 68, 54, 83, 72].map((height, bar) => (
                          <div
                            key={bar}
                            className={cn(
                              "flex-1 rounded-t-md",
                              index === 0 && "bg-sky-300",
                              index === 1 && "bg-violet-300",
                              index === 2 && "bg-emerald-300"
                            )}
                            style={{ height: `${height}%`, opacity: 0.56 + bar * 0.08 }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Portfolio evidence collected</span>
                  <span className="text-white">38 artifacts</span>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 18 }).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        "h-7 rounded-md border border-white/8",
                        index % 3 === 0 && "bg-sky-300/40",
                        index % 3 === 1 && "bg-emerald-300/40",
                        index % 3 === 2 && "bg-violet-300/40"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Roadmap({
  activeYear,
  setActiveYear
}: {
  activeYear: number;
  setActiveYear: (year: number) => void;
}) {
  const active = roadmap[activeYear];

  return (
    <section id="roadmap" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Four-year roadmap"
          title="See Every Semester Before It Happens."
          copy="A long-range timeline for courses, GPA, research, leadership, internships, and the graduation story you are building."
        />
        <div className="glass rounded-[2rem] p-4 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/62 p-5">
              <div className="absolute left-8 right-8 top-1/2 h-px bg-gradient-to-r from-sky-300/20 via-emerald-300/55 to-violet-300/20" />
              <div className="relative grid h-full gap-4 sm:grid-cols-4">
                {roadmap.map((item, index) => (
                  <button
                    key={item.year}
                    type="button"
                    onClick={() => setActiveYear(index)}
                    className={cn(
                      "group flex min-h-72 cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                      activeYear === index
                        ? "border-sky-200/34 bg-sky-300/10 shadow-glow-blue"
                        : "border-white/10 bg-white/[0.045] hover:border-white/20 hover:bg-white/[0.075]"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-sky-100">{item.year}</span>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 ring-1 ring-white/12">
                          {index + 1}
                        </span>
                      </div>
                      <h3 className="mt-8 font-display text-2xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-400">{item.focus}</p>
                    </div>
                    <div className="space-y-2">
                      {item.stats.map((stat) => (
                        <div key={stat} className="flex items-center gap-2 text-sm text-slate-300">
                          <CircleCheck className="h-4 w-4 text-emerald-200" aria-hidden="true" />
                          {stat}
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <motion.div
              key={active.year}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6"
            >
              <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">Selected chapter</p>
              <h3 className="mt-3 font-display text-4xl font-semibold text-white">{active.year}: {active.title}</h3>
              <p className="mt-4 leading-7 text-slate-300">{active.focus}</p>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ["Courses", active.stats[0]],
                  ["GPA", active.gpa],
                  ["Research", active.stats[1]],
                  ["Career", active.stats[2]]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-950/52 p-4 ring-1 ring-white/10">
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
                    <div className="mt-2 font-display text-2xl font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AiMode() {
  return (
    <section id="ai-mode" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="AI student mode"
          title="Build Your Technical Arc Like a Skill Tree."
          copy="For AI and Computer Science students, Study Goal tracks the path from fundamentals to publishable research and career-grade proof."
        />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass relative min-h-[460px] overflow-hidden rounded-[2rem] p-5">
            <div className="absolute left-[12%] top-[57%] h-px w-[72%] rotate-[-19deg] bg-sky-300/35" />
            <div className="absolute left-[15%] top-[60%] h-px w-[66%] rotate-[18deg] bg-emerald-300/28" />
            <div className="absolute left-[28%] top-[52%] h-px w-[48%] rotate-[-49deg] bg-violet-300/24" />
            {skillNodes.map((node, index) => (
              <motion.div
                key={node.name}
                initial={{ opacity: 0, scale: 0.82 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.38 }}
                className="absolute w-28 -translate-x-1/2 -translate-y-1/2"
                style={{ left: node.x, top: node.y }}
              >
                <div className="rounded-2xl border border-white/14 bg-slate-950/82 p-3 text-center shadow-glow-blue backdrop-blur">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300/20 to-emerald-300/20 text-sky-100 ring-1 ring-white/12">
                    <Network className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="text-sm font-semibold text-white">{node.name}</div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-300" style={{ width: `${node.level}%` }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="space-y-3">
            {[
              "Programming Skills",
              "Machine Learning",
              "Deep Learning",
              "NLP",
              "Computer Vision",
              "Research Papers",
              "Kaggle Projects",
              "GitHub Portfolio"
            ].map((item, index) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-emerald-200 ring-1 ring-white/10">
                    <Code2 className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span className="font-medium text-white">{item}</span>
                </div>
                <span className="text-sm text-slate-400">Level {index + 4}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Feature system"
          title="Everything Ambitious Students Already Track, Rebuilt as One System."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.42 }}
              className="group rounded-2xl border border-white/10 bg-white/[0.055] p-5 transition-colors duration-200 hover:border-emerald-200/28 hover:bg-white/[0.085]"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-300/16 to-violet-300/14 text-sky-100 ring-1 ring-white/12 transition-colors group-hover:text-emerald-100">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{feature.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Analytics() {
  return (
    <section id="analytics" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Analytics"
          title="Beautiful Charts for the Decisions That Shape Your Future."
          copy="Study Goal transforms scattered student activity into clear academic, research, goal, and career signals."
        />
        <div className="grid gap-4 lg:grid-cols-5">
          <ChartCard title="GPA Growth" value="+0.33" className="lg:col-span-2" />
          <ChartCard title="Credit Completion" value="74%" className="lg:col-span-3" variant="wide" />
          <ChartCard title="Research Activity" value="18 logs" className="lg:col-span-2" variant="dots" />
          <div className="glass rounded-2xl p-5 lg:col-span-3">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-semibold text-white">Goal Progress</h3>
                <p className="mt-1 text-sm text-slate-400">Academic, portfolio, and career milestones</p>
              </div>
              <LineChart className="h-5 w-5 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Academic", 86, "from-sky-300 to-indigo-300"],
                ["Portfolio", 72, "from-violet-300 to-fuchsia-300"],
                ["Career", 94, "from-emerald-300 to-teal-200"]
              ].map(([label, value, color]) => (
                <div key={label as string} className="rounded-2xl bg-slate-950/60 p-4 ring-1 ring-white/10">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{label}</span>
                    <span className="text-white">{value}%</span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-800">
                    <div className={cn("h-full rounded-full bg-gradient-to-r", color as string)} style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-emerald-300/10 p-4 ring-1 ring-emerald-200/18">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-emerald-100">Career Readiness</span>
                <span className="font-display text-3xl font-semibold text-white">91</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChartCard({
  title,
  value,
  variant = "bars",
  className
}: {
  title: string;
  value: string;
  variant?: "bars" | "wide" | "dots";
  className?: string;
}) {
  return (
    <div className={cn("glass min-h-64 rounded-2xl p-5", className)}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">Live university signal</p>
        </div>
        <span className="font-display text-2xl font-semibold text-emerald-100">{value}</span>
      </div>
      {variant === "dots" ? (
        <div className="grid grid-cols-9 gap-2">
          {Array.from({ length: 54 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square rounded-md",
                index % 5 === 0 ? "bg-emerald-300/80" : index % 3 === 0 ? "bg-sky-300/60" : "bg-white/8"
              )}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-end gap-2">
          {[38, 44, 51, 48, 63, 70, 74, 81, 88, 92, 86, 95].map((height, index) => (
            <div key={index} className="flex flex-1 flex-col justify-end">
              <div
                className={cn(
                  "rounded-t-lg bg-gradient-to-t",
                  variant === "wide" ? "from-indigo-400 to-sky-300" : "from-emerald-300 to-sky-300"
                )}
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Testimonials() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Student outcomes"
          title="Designed for Students Who Want More Than a Transcript."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.07, duration: 0.45 }}
              className="glass-soft rounded-2xl p-6"
            >
              <div className="mb-6 flex items-center gap-1 text-emerald-200">
                {Array.from({ length: 5 }).map((_, star) => (
                  <Sparkles key={star} className="h-4 w-4" aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-lg leading-8 text-slate-200 text-pretty">&quot;{testimonial.quote}&quot;</blockquote>
              <figcaption className="mt-7 flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="mt-1 text-sm text-slate-400">{testimonial.role}</div>
                </div>
                <div className="rounded-full bg-sky-300/10 px-3 py-1.5 text-xs font-semibold text-sky-100 ring-1 ring-sky-200/16">
                  {testimonial.result}
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section id="start" className="px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="glass relative overflow-hidden rounded-[2rem] px-6 py-16 text-center sm:px-10 lg:py-24">
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-emerald-300/16 to-transparent" />
          <div className="relative mx-auto max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">Start the master plan</p>
            <h2 className="font-display text-5xl font-semibold leading-tight tracking-normal text-balance text-white sm:text-6xl">
              Don&apos;t Just Survive University.
              <span className="block text-sky-100">Master It.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Build the four-year operating system that turns classes, goals, skills, research, and career preparation into one extraordinary portfolio.
            </p>
            <Button asChild size="lg" className="mt-9">
              <a href="#">
                Start Building Your Future <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
