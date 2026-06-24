import { NextResponse } from "next/server";

import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";
import { buildOllamaStudyContext, createRuleRecommendations } from "@/lib/recommendations/rules";
import { loadRecommendationInput } from "@/lib/recommendations/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieLanguage = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LANGUAGE_COOKIE}=`))
    ?.split("=")[1];
  const language = normalizeLanguage(body.language || cookieLanguage);
  const input = await loadRecommendationInput(user.id);
  const recommendations = createRuleRecommendations(input, language);
  const context = buildOllamaStudyContext(input, recommendations, language);
  const prompt = createPrompt(context, language);
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
  const model = process.env.OLLAMA_MODEL || "qwen2.5:3b";
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    const controller = new AbortController();
    timeout = setTimeout(() => controller.abort(), 120_000);
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: 0.35,
          num_ctx: 4096,
          num_predict: 420
        }
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const details = await response.text().catch(() => "");
      return NextResponse.json(
        {
          error:
            language === "vi"
              ? `Ollama đã phản hồi nhưng chưa tạo được review. Hãy kiểm tra model ${model}.`
              : `Ollama responded but could not generate a review. Check model ${model}.`,
          details
        },
        { status: 502 }
      );
    }

    const data = (await response.json()) as { response?: string };
    return NextResponse.json({
      model,
      response: data.response?.trim() || ""
    });
  } catch (error) {
    if (timeout) {
      clearTimeout(timeout);
    }

    const isTimeout = error instanceof Error && error.name === "AbortError";

    return NextResponse.json(
      {
        error:
          language === "vi"
            ? isTimeout
              ? `Ollama đang chạy nhưng model ${model} phản hồi quá lâu. Hãy thử bấm tạo lại hoặc giảm dữ liệu đầu vào.`
              : `Không gọi được Ollama tại ${baseUrl}. Hãy kiểm tra Ollama đang chạy và model ${model} đã có.`
            : isTimeout
              ? `Ollama is running, but model ${model} took too long to respond. Try again or reduce the input.`
              : `Could not call Ollama at ${baseUrl}. Check that Ollama is running and model ${model} exists.`
      },
      { status: 503 }
    );
  }
}

function createPrompt(context: string, language: "en" | "vi") {
  if (language === "vi") {
    return `Bạn là cố vấn học tập và nghề nghiệp cho sinh viên đại học. Dựa trên dữ liệu sau, hãy viết một bản phân tích ngắn, thực tế, không sáo rỗng.

Yêu cầu:
- Trả lời hoàn toàn bằng tiếng Việt.
- Chia thành 3 phần: "Ưu tiên tuần này", "Lý do", "Kế hoạch 7 ngày".
- Không dùng Markdown heading dạng ###. Có thể dùng gạch đầu dòng ngắn nếu cần.
- Không bịa dữ liệu ngoài context.
- Đưa ra 3 hành động cụ thể, có thể làm ngay.
- Giọng văn chuyên nghiệp, rõ ràng, giống cố vấn sản phẩm Study Goal.

Context:
${context}`;
  }

  return `You are an academic and career advisor for an ambitious university student. Based on the data below, write a concise, practical weekly review.

Requirements:
- Answer fully in English.
- Use 3 sections: "This week's priority", "Why it matters", "7-day plan".
- Do not use Markdown headings such as ###. Short bullet points are fine.
- Do not invent data outside the context.
- Give 3 concrete actions the student can do now.
- Keep the tone professional, clear, and product-advisor like.

Context:
${context}`;
}
