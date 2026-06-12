import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  Play,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

import { ParticleBackground } from "@/components/particle-background";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Course Learning Platform",
  description:
    "Nền tảng quản lý lớp học, video bài giảng và tài liệu học tập.",
};

const featureTags = [
  "Video bài giảng",
  "Tài liệu theo buổi",
  "Quản lý lớp học",
];

const stats = [
  { label: "Video", value: "24/7", icon: Play },
  { label: "Tài liệu", value: "Theo buổi", icon: FileText },
  { label: "Lớp học", value: "1 nơi", icon: Users },
];

const features = [
  {
    icon: BookOpen,
    title: "Tài liệu",
    description: "Gom file theo từng buổi học.",
  },
  {
    icon: Play,
    title: "Video",
    description: "Xem lại bài giảng mọi lúc.",
  },
  {
    icon: Users,
    title: "Lớp học",
    description: "Dashboard lớp & lịch học.",
  },
  {
    icon: GraduationCap,
    title: "Giáo viên",
    description: "Upload & theo dõi nội dung.",
  },
];

const steps = [
  { num: "01", title: "Đăng nhập", desc: "Chọn vai trò học sinh hoặc giáo viên." },
  { num: "02", title: "Vào lớp", desc: "Truy cập lớp và buổi học của bạn." },
  { num: "03", title: "Học & xem lại", desc: "Video và tài liệu luôn sẵn sàng." },
];

const bokehOrbs = [
  { left: "5%", top: "10%", size: 200, delay: 0 },
  { left: "75%", top: "8%", size: 240, delay: -2 },
  { left: "50%", top: "60%", size: 280, delay: -4 },
  { left: "15%", top: "75%", size: 220, delay: -6 },
  { left: "90%", top: "50%", size: 180, delay: -3 },
];

const floatingCards = [
  { title: "Video", icon: Play, position: "top-6 left-0", delay: "0s" },
  { title: "Tài liệu", icon: FileText, position: "top-16 right-0", delay: "1s" },
  { title: "Lịch học", icon: Calendar, position: "bottom-10 left-4", delay: "2s" },
  { title: "Giảng viên", icon: Users, position: "bottom-20 right-2", delay: "3s" },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <ParticleBackground variant="gold" />
      <div className="landing-grid-bg pointer-events-none absolute inset-0" />

      <div className="pointer-events-none absolute inset-0">
        {bokehOrbs.map((orb, index) => (
          <div
            key={index}
            className="bokeh-orb"
            style={{
              left: orb.left,
              top: orb.top,
              width: orb.size,
              height: orb.size,
              animationDuration: `${10 + index * 2}s`,
              animationDelay: `${orb.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,rgba(251,191,36,0.08),transparent_55%)]" />

      {/* Header */}
      <div className="relative mx-auto max-w-6xl px-6 pt-5 lg:px-8">
        <header className="sticky top-5 z-50">
          <div className="login-card-glow flex items-center justify-between rounded-2xl border border-white/10 bg-[#0c0c0c]/80 px-5 py-3.5 backdrop-blur-xl">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-400/10 text-amber-300 transition duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white">
                  Course Learning Platform 
                </h1>
                <p className="text-xs text-zinc-500">Student Learning Hub</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              <a
                href="#features"
                className="hidden text-sm text-zinc-400 transition hover:text-amber-300 sm:block"
              >
                Tính năng
              </a>
              <Button
                asChild
                className="login-btn-gold h-9 rounded-lg border-0 px-5 text-sm font-bold text-zinc-900"
              >
                <Link href="/login" className="inline-flex items-center gap-1.5">
                  Đăng nhập
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </header>
      </div>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-6 pb-20 pt-10 lg:px-8 lg:pb-28 lg:pt-14">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="space-y-7 motion-safe:animate-[fade-up_700ms_ease-out_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-[#0d0d0d]/80 px-3.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-amber-200/90 uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              Học trực tuyến
            </div>

            <div>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
                Học tập &amp; giảng dạy
              </h2>
              <p className="mt-1 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl lg:text-[2.75rem]">
                Smart Dashboard
              </p>
              <p className="mt-3 text-base font-medium text-sky-300/90">
                Video, tài liệu &amp; lớp học — một nơi.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {featureTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400 backdrop-blur-sm"
                >
                  <span className="size-1 rounded-full bg-amber-400" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="login-btn-gold h-10 rounded-lg border-0 px-6 text-sm font-bold text-zinc-900"
              >
                <Link href="/login" className="inline-flex items-center gap-2">
                  Bắt đầu ngay
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="h-10 rounded-lg border border-white/10 bg-white/5 px-5 text-sm text-zinc-300 hover:border-amber-400/30 hover:bg-white/10 hover:text-amber-300"
              >
                <a href="#features">Khám phá</a>
              </Button>
            </div>

            <div className="grid max-w-md grid-cols-3 gap-3 pt-2">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-[#0c0c0c]/70 px-3 py-3 backdrop-blur-sm"
                  >
                    <Icon className="mb-2 h-4 w-4 text-amber-400/80" />
                    <p className="text-sm font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] text-zinc-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative flex h-[440px] items-center justify-center motion-safe:animate-[fade-up_700ms_ease-out_both] motion-safe:[animation-delay:120ms] lg:h-[480px]">
            <div className="pointer-events-none absolute flex h-[300px] w-[300px] items-center justify-center">
              <div className="orbit-ring absolute h-full w-full rounded-full border border-dashed border-amber-400/15" />
              <div
                className="orbit-ring absolute h-[85%] w-[85%] rounded-full border border-sky-400/10"
                style={{ animationDirection: "reverse", animationDuration: "18s" }}
              />
              <div className="absolute h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
            </div>

            <div
              className="float-bob-slow login-card-glow landing-card-shine relative z-20 rounded-2xl border border-white/10 bg-[#0c0c0c]/90 px-10 py-8 backdrop-blur-md"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-amber-400 to-sky-400" />
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-900 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
                  <BookOpen className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  Learning Dashboard
                </h3>
                <p className="mt-1 text-xs text-zinc-500">
                  Tất cả trong một màn hình
                </p>
              </div>
            </div>

            {floatingCards.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`float-card landing-card-shine absolute ${item.position} z-10 rounded-xl border border-white/10 bg-[#0c0c0c]/95 px-3.5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-amber-400/30`}
                  style={{ animationDelay: item.delay }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/20 to-amber-600/10 text-amber-300 ring-1 ring-amber-400/20">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <p className="text-sm font-medium text-zinc-100">
                      {item.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="relative border-t border-white/5"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(251,191,36,0.05),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-[#0d0d0d]/80 px-3.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-amber-200/90 uppercase">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Tính năng
            </span>
            <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
              Mọi thứ bạn cần
            </h2>
          </div>

          <div className="relative mx-auto max-w-2xl">
            <div className="absolute top-3 bottom-3 left-[15px] w-px bg-gradient-to-b from-amber-400/60 via-amber-400/25 to-transparent sm:left-[19px]" />

            <div className="space-y-10">
              {features.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group relative flex gap-5 sm:gap-6"
                  >
                    <div className="relative z-10 flex shrink-0 flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/40 bg-[#0a0a0a] text-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.15)] transition duration-300 group-hover:border-amber-400/70 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                      </div>
                      <span className="mt-2 text-[10px] font-bold tracking-widest text-zinc-600">
                        0{index + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
                      <div className="mb-3 h-px w-full max-w-[120px] bg-gradient-to-r from-amber-400/50 to-transparent" />
                      <h3 className="text-base font-semibold text-white sm:text-lg">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative border-t border-white/5 bg-[#080808]/50">
        <div className="mx-auto max-w-6xl px-6 py-14 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Bắt đầu trong 3 bước
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.num}
                className="landing-card-shine group relative rounded-2xl border border-white/10 bg-[#0c0c0c]/80 p-5 backdrop-blur-sm transition hover:border-amber-400/20"
              >
                {index < steps.length - 1 ? (
                  <div className="absolute top-1/2 -right-2 hidden h-px w-4 bg-gradient-to-r from-amber-400/40 to-transparent md:block lg:w-6" />
                ) : null}
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/10 text-xs font-bold text-amber-400 ring-1 ring-amber-400/20">
                    {step.num}
                  </span>
                  <Zap className="h-4 w-4 text-amber-400/60 opacity-0 transition group-hover:opacity-100" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-6xl px-6 py-14 lg:px-8">
        <div className="login-card-glow relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-[#111111] via-[#0c0c0c] to-[#111111] px-8 py-10 text-center sm:px-12">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-400/15 blur-3xl" />

          <h2 className="relative text-xl font-bold text-white sm:text-2xl">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="relative mt-2 text-sm text-zinc-500">
            Đăng nhập và truy cập lớp học ngay hôm nay.
          </p>
          <Button
            asChild
            className="login-btn-gold relative mt-6 h-10 rounded-lg border-0 px-8 text-sm font-bold text-zinc-900"
          >
            <Link href="/login" className="inline-flex items-center gap-2">
              Đăng nhập ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative border-t border-white/10 bg-[#060606]">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-xs font-bold text-amber-300">
                CL
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Course Learning Platform
                </div>
                <div className="text-xs text-zinc-500">
                  Nền tảng học tập trực tuyến
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
              <a className="transition hover:text-amber-300" href="#features">
                Tính năng
              </a>
              <Link className="transition hover:text-amber-300" href="/login">
                Đăng nhập
              </Link>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5 text-xs text-zinc-600">
            © 2026 Course Learning Platform
          </div>
        </div>
      </footer>
    </main>
  );
}
