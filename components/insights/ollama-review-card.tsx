"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/language";

const copy = {
  en: {
    eyebrow: "Local AI advisor",
    title: "Generate a weekly review with Ollama",
    description:
      "Study Goal sends your current academic snapshot to your local Ollama model through the Next.js server. Nothing is sent to a cloud AI provider.",
    button: "Generate review",
    loading: "Asking Ollama...",
    model: "Model",
    empty: "Your local AI review will appear here.",
    errorHelp: "Ollama is already running if port 11434 is busy. Make sure `OLLAMA_MODEL=qwen2.5:3b`, then try again."
  },
  vi: {
    eyebrow: "Cố vấn AI local",
    title: "Tạo review hằng tuần bằng Ollama",
    description:
      "Study Goal gửi bản tóm tắt học tập hiện tại tới model Ollama local thông qua server Next.js. Dữ liệu không gửi tới nhà cung cấp AI cloud.",
    button: "Tạo review",
    loading: "Đang hỏi Ollama...",
    model: "Model",
    empty: "Bản review AI local sẽ hiển thị tại đây.",
    errorHelp: "Nếu port 11434 đang bận thì Ollama đã chạy. Hãy đảm bảo `OLLAMA_MODEL=qwen2.5:3b`, rồi thử lại."
  }
} as const;

export function OllamaReviewCard({ language }: { language: Language }) {
  const t = copy[language];
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");

  async function generateReview() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/insights/ollama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ language })
      });
      const data = (await response.json()) as {
        response?: string;
        model?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Ollama request failed");
      }

      setReview(data.response || "");
      setModel(data.model || "");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Ollama request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-emerald-700/14 bg-white/90 p-6 shadow-[0_24px_80px_rgba(16,185,129,0.1)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-green via-brand-cyan to-brand-orange" />
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-emerald-300/18 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-cyan-300/12 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700/10 text-signal-green ring-1 ring-emerald-700/16">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-signal-green">
            {t.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">{t.title}</h2>
          <p className="mt-3 max-w-xl leading-7 text-ink-muted">{t.description}</p>
          <Button
            type="button"
            className="mt-7 rounded-full bg-brand-green px-5 text-white shadow-glow-green hover:bg-emerald-600"
            onClick={generateReview}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
            {loading ? t.loading : t.button}
          </Button>
        </div>

        <div className="min-h-72 rounded-[1.5rem] border border-slate-800 bg-brand-navy p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_22px_60px_rgba(15,23,42,0.18)]">
          {model ? (
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
              {t.model}: {model}
            </p>
          ) : null}
          {error ? (
            <div className="rounded-2xl border border-red-300/25 bg-red-500/14 p-4 text-sm leading-6 text-red-50">
              <p className="font-medium">{error}</p>
              <p className="mt-2 text-red-50/76">{t.errorHelp}</p>
            </div>
          ) : review ? (
            <div className="whitespace-pre-wrap text-sm leading-7 text-slate-100">{review}</div>
          ) : (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-cyan-100/14 bg-white/[0.03] px-6 text-center text-sm leading-6 text-slate-300">
              {t.empty}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
