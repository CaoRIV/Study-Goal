"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  FolderKanban,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Target
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { StudyGoalLogo } from "@/components/brand/study-goal-logo";
import { PublicFooter } from "@/components/navigation/public-footer";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register" | "forgot-password";

const copy = {
  login: {
    eyebrow: "Đăng nhập",
    title: "Tiếp tục xây dựng kế hoạch đại học của bạn.",
    description: "Truy cập bảng điều khiển cá nhân, lộ trình học tập, mục tiêu và hồ sơ phát triển.",
    submit: "Đăng nhập",
    google: "Tiếp tục với Google",
    footer: "Chưa có tài khoản?",
    footerLink: "Đăng ký miễn phí",
    footerHref: "/register",
    sideTitle: "Một không gian làm việc cho toàn bộ hành trình đại học.",
    sideCopy: "Từ GPA, tín chỉ, mục tiêu, nghiên cứu đến hồ sơ năng lực - mọi thứ được kết nối vào một kế hoạch tổng thể."
  },
  register: {
    eyebrow: "Tạo tài khoản",
    title: "Bắt đầu không gian Study Goal của bạn.",
    description: "Tạo tài khoản để lưu lộ trình, điểm số, mục tiêu và quá trình phát triển cá nhân.",
    submit: "Tạo tài khoản",
    google: "Đăng ký với Google",
    footer: "Đã có tài khoản?",
    footerLink: "Đăng nhập",
    footerHref: "/login",
    sideTitle: "Biến 4 năm đại học thành một hệ thống có chiến lược.",
    sideCopy: "Thiết lập hồ sơ một lần, sau đó Study Goal sẽ trở thành trung tâm điều khiển cho quá trình học tập."
  },
  "forgot-password": {
    eyebrow: "Khôi phục mật khẩu",
    title: "Lấy lại quyền truy cập tài khoản.",
    description: "Nhập email của bạn, Study Goal sẽ gửi link đặt lại mật khẩu an toàn.",
    submit: "Gửi link đặt lại",
    google: "",
    footer: "Nhớ mật khẩu rồi?",
    footerLink: "Quay lại đăng nhập",
    footerHref: "/login",
    sideTitle: "Không làm gián đoạn kế hoạch học tập của bạn.",
    sideCopy: "Khôi phục tài khoản nhanh để tiếp tục theo dõi học kỳ, GPA và mục tiêu."
  }
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const text = copy[mode];
  const nextPath = searchParams.get("next") || "/dashboard";

  async function redirectAfterAuth(userId: string) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_onboarded")
      .eq("user_id", userId)
      .maybeSingle();

    router.replace(profile?.is_onboarded ? nextPath : "/onboarding");
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    if (mode === "login") {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        await redirectAfterAuth(data.user.id);
      }
    }

    if (mode === "register") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.session && data.user) {
        await supabase.from("profiles").upsert(
          {
            user_id: data.user.id,
            full_name: fullName,
            is_onboarded: false
          },
          { onConflict: "user_id" }
        );
        router.replace("/onboarding");
        router.refresh();
        return;
      }

      setMessage("Hãy kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.");
    }

    if (mode === "forgot-password") {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
      });

      if (resetError) {
        setError(resetError.message);
        setIsLoading(false);
        return;
      }

      setMessage("Link đặt lại mật khẩu đã được gửi. Hãy kiểm tra hộp thư của bạn.");
    }

    setIsLoading(false);
  }

  async function handleGoogleAuth() {
    setIsLoading(true);
    setError("");

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
      }
    });

    if (googleError) {
      setError(googleError.message);
      setIsLoading(false);
    }
  }

  return (
    <main id="main-content" className="neo-auth min-h-screen px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between rounded-neo-lg border-neo-strong border-neo-ink bg-neo-paper px-4 py-3 shadow-neo-lg">
          <a href="/" className="flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
            <StudyGoalLogo priority />
            <span className="font-display text-base font-semibold text-ink">Study Goal</span>
          </a>
          <Button asChild variant="secondary">
            <a href="/">
              <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
              Trang chủ
            </a>
          </Button>
        </header>

        <section className="grid items-start gap-8 py-8 lg:min-h-[calc(100vh-104px)] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-10">
          <div className="neo-auth-showcase order-2 relative overflow-hidden rounded-neo-lg border-neo-strong border-neo-ink bg-neo-sky p-6 shadow-neo-xl sm:p-8 lg:order-1 lg:min-h-[640px]">
            <div className="absolute -right-12 -top-12 h-36 w-36 rotate-12 border-neo-strong border-neo-ink bg-neo-coral" />
            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-neo-sm border-2 border-neo-ink bg-neo-yellow px-4 py-2 text-sm font-black text-neo-ink shadow-neo-xs">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Không gian học tập an toàn
              </div>
              <h1 className="max-w-2xl font-display text-4xl font-black leading-[1.02] tracking-[-0.035em] text-neo-ink sm:text-5xl lg:text-6xl">
                {text.sideTitle}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-ink-muted">{text.sideCopy}</p>

              <div className="mt-10 hidden gap-4 sm:grid sm:grid-cols-3">
                {[
                  ["GPA", "3.82", BookOpenCheck],
                  ["Mục tiêu", "18", Target],
                  ["Hồ sơ năng lực", "38", FolderKanban]
                ].map(([label, value, Icon]) => (
                  <div key={label as string} className="neo-auth-stat rounded-neo border-2 border-neo-ink bg-neo-white p-4 shadow-neo-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-muted">{label as string}</span>
                      <Icon className="h-4 w-4 text-signal-cyan" aria-hidden="true" />
                    </div>
                    <div className="mt-4 font-display text-3xl font-semibold text-ink">{value as string}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 hidden rounded-neo border-2 border-neo-ink bg-neo-white p-5 shadow-neo-lg sm:block">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">Kế hoạch tổng thể</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Học kỳ xuân 2027</h2>
                  </div>
                  <span className="rounded-neo-sm border-2 border-neo-ink bg-neo-mint px-3 py-1.5 text-sm font-black text-neo-ink shadow-neo-xs">
                    Sẵn sàng 91%
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    ["Lộ trình học tập", 82],
                    ["Tiến độ nghiên cứu", 64],
                    ["Chuẩn bị thực tập", 76]
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-ink-muted">{label as string}</span>
                        <span className="text-ink">{value as number}%</span>
                      </div>
                      <div className="h-4 overflow-hidden rounded-neo-sm border-2 border-neo-ink bg-neo-paper">
                        <div className="h-full border-r-2 border-neo-ink bg-neo-primary" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="workspace-form order-1 mx-auto w-full max-w-xl p-6 sm:p-8 lg:order-2">
            <div className="mb-7">
              <p className="inline-flex rounded-neo-sm border-2 border-neo-ink bg-neo-yellow px-3 py-1.5 text-sm font-black uppercase tracking-[0.1em] text-neo-ink shadow-neo-xs">{text.eyebrow}</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-tight tracking-[-0.025em] text-neo-ink">
                {text.title}
              </h2>
              <p className="mt-3 leading-7 text-ink-muted">{text.description}</p>
            </div>

            {mode !== "forgot-password" ? (
              <Button
                type="button"
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-paper text-xs font-bold text-slate-950">
                  G
                </span>
                {text.google}
              </Button>
            ) : null}

            {mode !== "forgot-password" ? (
              <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.16em] text-ink-muted">
                <div className="h-px flex-1 bg-surface-warm" />
                hoặc dùng email
                <div className="h-px flex-1 bg-surface-warm" />
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <AuthField
                  label="Họ và tên"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Maya Tran"
                />
              ) : null}

              <AuthField
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@university.edu"
              />

              {mode !== "forgot-password" ? (
                <AuthField
                  label="Mật khẩu"
                  type="password"
                  minLength={6}
                  value={password}
                  onChange={setPassword}
                  placeholder="Tối thiểu 6 ký tự"
                />
              ) : null}

              {mode === "login" ? (
                <div className="text-right">
                  <a href="/forgot-password" className="text-sm text-signal-cyan transition-colors hover:text-ink">
                    Quên mật khẩu?
                  </a>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-neo border-neo-strong border-neo-ink bg-neo-coral px-4 py-3 text-sm font-semibold text-neo-ink shadow-neo-sm">
                  {error}
                </div>
              ) : null}

              {message ? (
                <div className="flex gap-3 rounded-neo border-neo-strong border-neo-ink bg-neo-mint px-4 py-3 text-sm font-semibold text-neo-ink shadow-neo-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {message}
                </div>
              ) : null}

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {text.submit}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-ink-muted">
              {text.footer}{" "}
              <a href={text.footerHref} className="font-semibold text-signal-cyan transition-colors hover:text-ink">
                {text.footerLink}
              </a>
            </p>
          </div>
        </section>
      </div>
      <PublicFooter language="vi" />
    </main>
  );
}

function AuthField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  minLength
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        required
        type={type}
        minLength={minLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input mt-2"
        placeholder={placeholder}
      />
    </label>
  );
}
