import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { GeistSans } from "geist/font/sans";

import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/language";

import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Study Goal | Plan your university journey",
    template: "%s | Study Goal"
  },
  description:
    "Study Goal helps students in every major plan courses, goals, projects, skills, campus activities, portfolios, and career preparation in one place.",
  keywords: [
    "student planner",
    "university roadmap",
    "academic goals",
    "student skills",
    "career readiness",
    "student portfolio"
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Study Goal",
    title: "Study Goal | Plan your university journey",
    description:
      "Connect courses, goals, projects, skills, activities, and career preparation in one clear university plan."
  },
  twitter: {
    card: "summary_large_image",
    title: "Study Goal | Plan your university journey",
    description:
      "Connect courses, goals, projects, skills, activities, and career preparation in one clear university plan."
  },
  icons: {
    icon: "/study-goal-logo.png",
    apple: "/study-goal-logo.png"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);

  return (
    <html lang={language} className={GeistSans.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0"
        >
          {language === "vi" ? "Bỏ qua đến nội dung chính" : "Skip to main content"}
        </a>
        {children}
      </body>
    </html>
  );
}
