export type Language = "en" | "vi";

export const LANGUAGE_COOKIE = "study-goal-language";

export function normalizeLanguage(value: string | undefined | null): Language {
  return value === "vi" ? "vi" : "en";
}
