"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { StudyGoalLogo } from "@/components/brand/study-goal-logo";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { LanguageSwitcher } from "@/components/language/language-switcher";
import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/language";
import {
  workspaceNavigation,
  workspaceNavigationLabels
} from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function WorkspaceHeader({
  language,
  subtitle,
  languageLabel,
  signOutLabel
}: {
  language: Language;
  subtitle: string;
  languageLabel: string;
  signOutLabel: string;
}) {
  const pathname = usePathname();
  const labels = workspaceNavigationLabels[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

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

  function isActive(href: string, match: "exact" | "prefix") {
    return match === "exact" ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="rounded-[2rem] border border-white/12 bg-slate-950/72 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-4">
        <a
          href="/dashboard"
          className="flex min-w-0 items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <StudyGoalLogo priority />
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-brand-paper">
              Study Goal
            </p>
            <p className="truncate text-sm text-slate-400">{subtitle}</p>
          </div>
        </a>

        <nav
          aria-label={
            language === "vi"
              ? "Điều hướng không gian học tập"
              : "Study workspace navigation"
          }
          className="hidden flex-1 flex-wrap items-center justify-center gap-1 xl:flex"
        >
          {workspaceNavigation.map((item) => {
            const active = isActive(item.href, item.match);
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "workspace-nav-link",
                  active &&
                    "bg-cyan-400/12 text-cyan-50 ring-1 ring-cyan-300/20"
                )}
              >
                {labels[item.labelKey]}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          <LanguageSwitcher language={language} label={languageLabel} />
          <SignOutButton label={signOutLabel} />
        </div>

        <Button
          ref={triggerRef}
          type="button"
          variant="secondary"
          size="icon"
          className="xl:hidden"
          aria-expanded={menuOpen}
          aria-controls="workspace-mobile-menu"
          aria-label={language === "vi" ? "Mở menu" : "Open menu"}
          onClick={() => setMenuOpen(true)}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <dialog
        ref={dialogRef}
        id="workspace-mobile-menu"
        className="m-0 ml-auto h-dvh w-[min(90vw,420px)] max-w-none bg-transparent p-0 backdrop:bg-slate-950/30"
        onClose={() => setMenuOpen(false)}
        onCancel={(event) => {
          event.preventDefault();
          closeMenu();
        }}
      >
        <div className="flex h-full flex-col bg-brand-paper p-5 shadow-2xl">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold text-slate-950">
              {language === "vi" ? "Điều hướng" : "Navigation"}
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
            {workspaceNavigation.map((item) => {
              const active = isActive(item.href, item.match);
              return (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-base font-semibold transition-colors",
                    active
                      ? "bg-cyan-700/10 text-cyan-800"
                      : "text-slate-700 hover:bg-brand-cream"
                  )}
                >
                  {labels[item.labelKey]}
                </a>
              );
            })}
          </nav>

          <div className="mt-auto grid gap-3 border-t border-cyan-900/10 pt-5">
            <LanguageSwitcher language={language} label={languageLabel} />
            <SignOutButton label={signOutLabel} />
          </div>
        </div>
      </dialog>
    </header>
  );
}
