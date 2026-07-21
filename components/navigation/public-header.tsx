"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import { StudyGoalLogo } from "@/components/brand/study-goal-logo";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/language";

export function PublicHeader({
  language,
  setLanguage,
  labels
}: {
  language: Language;
  setLanguage: (language: Language) => void;
  labels: {
    roadmap: string;
    skills: string;
    features: string;
    analytics: string;
    login: string;
    register: string;
    languageLabel: string;
    english: string;
    vietnamese: string;
  };
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sectionLinks = [
    ["#roadmap", labels.roadmap],
    ["#skills", labels.skills],
    ["#features", labels.features],
    ["#analytics", labels.analytics]
  ] as const;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <header className="fixed left-3 right-3 top-3 z-50 mx-auto max-w-7xl rounded-neo-lg border-neo-strong border-neo-ink bg-neo-paper px-3 py-2.5 shadow-neo-lg sm:left-6 sm:right-6 sm:px-4">
      <nav className="flex items-center justify-between gap-3">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-neo-sm focus-visible:outline-none focus-visible:shadow-neo-focus sm:gap-3"
        >
          <StudyGoalLogo className="h-10 w-10" priority />
          <span className="truncate font-neo-display text-sm font-neo-heavy tracking-neo text-neo-ink sm:text-base">
            Study Goal
          </span>
        </a>

        <div className="hidden items-center gap-5 text-sm font-bold text-neo-ink md:flex">
          {sectionLinks.map(([href, label]) => (
            <a
              key={href}
              className="border-b-2 border-transparent transition-colors duration-neo-fast hover:border-neo-ink"
              href={href}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-neo-sm border-2 border-transparent px-2.5 text-sm font-extrabold text-neo-ink transition-colors duration-neo-fast hover:border-neo-ink hover:bg-neo-yellow sm:px-4"
          >
            {labels.login}
          </a>
          <Button asChild className="hidden sm:inline-flex">
            <a href="/register">{labels.register}</a>
          </Button>
          <Button
            ref={triggerRef}
            type="button"
            variant="secondary"
            size="icon"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            aria-label={language === "vi" ? "Mở menu" : "Open menu"}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </nav>

      <dialog
        ref={dialogRef}
        id="public-mobile-menu"
        className="m-0 ml-auto h-dvh w-[min(90vw,400px)] max-w-none bg-transparent p-0 backdrop:bg-black/55"
        onClose={() => setMenuOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className="flex h-full flex-col border-l-neo-strong border-neo-ink bg-neo-paper p-5 shadow-neo-xl">
          <div className="flex items-center justify-between">
            <p className="font-neo-display text-lg font-neo-heavy tracking-neo text-neo-ink">
              Study Goal
            </p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={language === "vi" ? "Đóng menu" : "Close menu"}
              onClick={closeMenu}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          <nav className="mt-6 grid gap-2">
            {sectionLinks.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                className="rounded-neo border-2 border-transparent px-4 py-3 text-base font-extrabold text-neo-ink transition-colors duration-neo-fast hover:border-neo-ink hover:bg-neo-yellow"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="mt-6">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-neo-wide text-neo-ink-muted">
              {labels.languageLabel}
            </p>
            <div className="flex gap-2">
              {(["en", "vi"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={language === item}
                  onClick={() => setLanguage(item)}
                  className={`h-10 flex-1 rounded-neo-sm border-2 border-neo-ink text-sm font-extrabold shadow-neo-xs ${
                    language === item
                      ? "bg-neo-primary text-neo-white"
                      : "bg-neo-white text-neo-ink"
                  }`}
                >
                  {item === "en" ? labels.english : labels.vietnamese}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto grid gap-3">
            <Button asChild variant="secondary">
              <a href="/login">{labels.login}</a>
            </Button>
            <Button asChild>
              <a href="/register">{labels.register}</a>
            </Button>
          </div>
        </div>
      </dialog>
    </header>
  );
}
