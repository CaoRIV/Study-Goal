"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Language } from "@/lib/language";

const copy = {
  en: {
    title: "AI Review",
    button: "Generate review",
    loading: "Asking Ollama...",
    model: "Model",
    empty: "Your AI review total will appear here.",
    errorHelp: "Ollama is already running if port 11434 is busy. Make sure `OLLAMA_MODEL=qwen2.5:3b`, then try again."
  },
  vi: {
    title: "AI Review",
    button: "Tạo review",
    loading: "Đang hỏi Ollama...",
    model: "Model",
    empty: "Bản review chung sẽ hiển thị tại đây.",
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
      <div className="relative grid gap-6 lg:grid-cols-[0.48fr_1.52fr]">
        <div className="flex flex-col justify-between gap-8">
          <div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700/10 text-signal-green ring-1 ring-emerald-700/16">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-6 font-display text-4xl font-semibold text-ink">{t.title}</h2>
          </div>
          <Button
            type="button"
            className="w-fit rounded-full bg-brand-green px-5 text-white shadow-glow-green hover:bg-emerald-600"
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
            <FormattedReview content={review} />
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

function FormattedReview({ content }: { content: string }) {
  const lines = content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const blocks: Array<
    | { type: "heading"; text: string }
    | { type: "paragraph"; text: string }
    | { type: "list"; items: string[] }
  > = [];
  let listItems: string[] = [];

  function flushList() {
    if (listItems.length > 0) {
      blocks.push({ type: "list", items: listItems });
      listItems = [];
    }
  }

  for (const line of lines) {
    const heading = line.match(/^#{1,4}\s+(.+)$/);
    const bullet = line.match(/^[-*]\s+(.+)$/);

    if (heading) {
      flushList();
      blocks.push({ type: "heading", text: cleanHeading(heading[1]) });
      continue;
    }

    if (bullet) {
      listItems.push(cleanLine(bullet[1]));
      continue;
    }

    flushList();
    blocks.push({ type: "paragraph", text: cleanLine(line) });
  }

  flushList();

  return (
    <div className="space-y-5 text-sm leading-7 text-slate-100">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3
              key={`${block.type}-${index}`}
              className="border-b border-white/10 pb-2 pt-1 font-display text-lg font-semibold text-emerald-100"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={`${block.type}-${index}`} className="space-y-3">
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-3 rounded-2xl bg-white/[0.04] p-3 ring-1 ring-white/8">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-slate-200">
            {renderInline(block.text)}
          </p>
        );
      })}
    </div>
  );
}

function cleanHeading(text: string) {
  return text
    .replace(/^#{1,4}\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function cleanLine(text: string) {
  return text.replace(/^#{1,4}\s+/, "").trim();
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`)/g).filter(Boolean);

  return parts.map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={`${part}-${index}`} className="rounded-md bg-white/10 px-1.5 py-0.5 text-emerald-100">
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
