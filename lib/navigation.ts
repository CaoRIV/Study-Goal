import type { Language } from "@/lib/language";

export type NavigationItem = {
  href: string;
  labelKey:
    | "dashboard"
    | "grades"
    | "roadmap"
    | "goals"
    | "skills"
    | "clubs"
    | "portfolio"
    | "career"
    | "profile";
  match: "exact" | "prefix";
};

export const workspaceNavigation: NavigationItem[] = [
  { href: "/dashboard", labelKey: "dashboard", match: "exact" },
  { href: "/grades", labelKey: "grades", match: "prefix" },
  { href: "/roadmap", labelKey: "roadmap", match: "prefix" },
  { href: "/goals", labelKey: "goals", match: "prefix" },
  { href: "/skills", labelKey: "skills", match: "prefix" },
  { href: "/clubs", labelKey: "clubs", match: "prefix" },
  { href: "/portfolio", labelKey: "portfolio", match: "prefix" },
  { href: "/career", labelKey: "career", match: "prefix" },
  { href: "/profile", labelKey: "profile", match: "prefix" }
];

export const workspaceNavigationLabels: Record<
  Language,
  Record<NavigationItem["labelKey"], string>
> = {
  en: {
    dashboard: "Dashboard",
    grades: "Academic planner",
    roadmap: "Roadmap",
    goals: "Goals",
    skills: "Skills",
    clubs: "Clubs",
    portfolio: "Portfolio",
    career: "Career",
    profile: "Profile"
  },
  vi: {
    dashboard: "Bảng điều khiển",
    grades: "Kế hoạch học tập",
    roadmap: "Lộ trình",
    goals: "Mục tiêu",
    skills: "Kỹ năng",
    clubs: "Câu lạc bộ",
    portfolio: "Hồ sơ năng lực",
    career: "Sự nghiệp",
    profile: "Hồ sơ"
  }
};

export const workspaceNavigationCompactLabels: Record<
  Language,
  Record<NavigationItem["labelKey"], string>
> = {
  en: {
    dashboard: "Overview",
    grades: "Academics",
    roadmap: "Roadmap",
    goals: "Goals",
    skills: "Skills",
    clubs: "Clubs",
    portfolio: "Portfolio",
    career: "Career",
    profile: "Profile"
  },
  vi: {
    dashboard: "Tổng quan",
    grades: "Học tập",
    roadmap: "Lộ trình",
    goals: "Mục tiêu",
    skills: "Kỹ năng",
    clubs: "CLB",
    portfolio: "Năng lực",
    career: "Sự nghiệp",
    profile: "Hồ sơ"
  }
};
