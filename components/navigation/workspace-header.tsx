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
  workspaceNavigationCompactLabels,
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
  const compactLabels = workspaceNavigationCompactLabels[language];
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
    <header className="workspace-header workspace-panel sticky top-4 z-40 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-4">
        <a
          href="/dashboard"
          className="flex min-w-0 shrink-0 items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <StudyGoalLogo priority />
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold text-ink">
              Study Goal
            </p>
            <p className="truncate text-sm text-ink-muted">{subtitle}</p>
          </div>
        </a>

        <nav
          aria-label={
            language === "vi"
              ? "Điều hướng không gian học tập"
              : "Study workspace navigation"
          }
          className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-0.5 xl:flex"
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
                    "bg-slate-950 text-white shadow-[0_12px_30px_rgba(8,47,73,0.18)] ring-1 ring-slate-900/5 hover:bg-slate-900 hover:text-white"
                )}
              >
                {compactLabels[item.labelKey]}
              </a>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
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
