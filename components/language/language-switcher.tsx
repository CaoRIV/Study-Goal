"use client";

import { useRouter } from "next/navigation";
import { Globe2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { LANGUAGE_COOKIE, type Language } from "@/lib/language";

export function LanguageSwitcher({
  language,
  label = "Change language"
}: {
  language: Language;
  label?: string;
}) {
  const router = useRouter();

  function setLanguage(nextLanguage: Language) {
    window.localStorage.setItem(LANGUAGE_COOKIE, nextLanguage);
    document.cookie = `${LANGUAGE_COOKIE}=${nextLanguage}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.lang = nextLanguage;
    router.refresh();
  }

  return (
    <div
      aria-label={label}
      className="flex items-center rounded-full border border-outline bg-surface-warm p-1 text-xs font-semibold text-ink-muted backdrop-blur-xl"
      role="group"
    >
      <Globe2 className="mx-2 hidden h-4 w-4 text-signal-cyan sm:block" aria-hidden="true" />
      {(["en", "vi"] as const).map((item) => (
        <button
          key={item}
          type="button"
          aria-pressed={language === item}
          onClick={() => setLanguage(item)}
          className={cn(
            "h-8 min-w-9 cursor-pointer rounded-full px-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300",
            language === item
              ? "bg-brand-bright text-slate-950 shadow-[0_10px_30px_rgba(6,182,212,0.2)]"
              : "text-ink-muted hover:bg-cyan-400/10 hover:text-signal-cyan"
          )}
        >
          {item.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
