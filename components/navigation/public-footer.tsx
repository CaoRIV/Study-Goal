import type { Language } from "@/lib/language";

export function PublicFooter({ language }: { language: Language }) {
  const year = new Date().getFullYear();
  const labels =
    language === "vi"
      ? {
          privacy: "Quyền riêng tư",
          terms: "Điều khoản",
          support: "Hỗ trợ",
          copy: `© ${year} Study Goal. Đồng hành cùng mọi hành trình đại học.`
        }
      : {
          privacy: "Privacy",
          terms: "Terms",
          support: "Support",
          copy: `© ${year} Study Goal. Built for every university journey.`
        };

  return (
    <footer className="border-t border-cyan-900/10 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{labels.copy}</p>
        <nav
          aria-label={language === "vi" ? "Liên kết pháp lý" : "Legal links"}
          className="flex flex-wrap gap-x-5 gap-y-2"
        >
          <a className="hover:text-cyan-800" href="/privacy">
            {labels.privacy}
          </a>
          <a className="hover:text-cyan-800" href="/terms">
            {labels.terms}
          </a>
          <a className="hover:text-cyan-800" href="/support">
            {labels.support}
          </a>
        </nav>
      </div>
    </footer>
  );
}
