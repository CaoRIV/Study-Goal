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
    <header className="fixed left-3 right-3 top-3 z-50 mx-auto max-w-7xl rounded-full border border-white/12 bg-slate-950/72 px-3 py-2.5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:left-6 sm:right-6 sm:px-4">
      <nav className="flex items-center justify-between gap-3">
        <a
          href="/"
          className="flex min-w-0 items-center gap-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:gap-3"
        >
          <StudyGoalLogo className="h-10 w-10" priority />
          <span className="truncate font-display text-sm font-semibold text-brand-paper sm:text-base">
            Study Goal
          </span>
        </a>

        <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {sectionLinks.map(([href, label]) => (
            <a
              key={href}
              className="transition-colors hover:text-brand-paper"
              href={href}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <a
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full px-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-cyan-400/10 hover:text-cyan-800 sm:px-4"
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
        className="m-0 ml-auto h-dvh w-[min(90vw,400px)] max-w-none bg-transparent p-0 backdrop:bg-slate-950/30"
        onClose={() => setMenuOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className="flex h-full flex-col bg-brand-paper p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold text-slate-950">
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
                className="rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-brand-cream"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              {labels.languageLabel}
            </p>
            <div className="flex gap-2">
              {(["en", "vi"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={language === item}
                  onClick={() => setLanguage(item)}
                  className={`h-10 flex-1 rounded-xl text-sm font-semibold ${
                    language === item
                      ? "bg-brand-cyan text-white"
                      : "bg-cyan-700/10 text-slate-700"
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
