import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Study Goal | Turn Your University Journey Into a Master Plan",
  description:
    "Study Goal is a premium student operating system for planning courses, research, goals, skills, clubs, internships, and graduate school readiness."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
