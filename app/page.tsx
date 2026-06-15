import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  KeyRound,
  Play,
  Sparkles,
  Users,
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

const roleBranches = [
  {
    role: "Giáo viên",
    icon: GraduationCap,
    accent: "amber" as const,
    items: [
      {
        icon: Play,
        title: "Upload video",
        description: "Đăng video bài giảng theo từng buổi học.",
      },
      {
        icon: BookOpen,
        title: "Tài liệu",
        description: "Đính kèm slide, PDF cho mỗi buổi.",
      },
      {
        icon: ClipboardList,
        title: "Bài tập",
        description: "Tạo quiz trắc nghiệm hoặc tự luận.",
      },
      {
        icon: Calendar,
        title: "Quản lý lớp",
        description: "Sắp xếp buổi học và nội dung lớp.",
      },
    ],
  },
  {
    role: "Học sinh",
    icon: Users,
    accent: "sky" as const,
    items: [
      {
        icon: KeyRound,
        title: "Nhập mã lớp",
        description: "Tham gia lớp bằng mã admin cung cấp.",
      },
      {
        icon: Play,
        title: "Học video",
        description: "Xem lại hoặc học trước theo buổi.",
      },
      {
        icon: ClipboardList,
        title: "Làm bài tập",
        description: "Làm bài theo dạng cây từng buổi.",
      },
      {
        icon: BookOpen,
        title: "Xem kết quả",
        description: "Theo dõi điểm và tiến độ học tập.",
      },
    ],
  },
];

const branchAccent = {
  amber: {
    node: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    line: "from-amber-400/45 via-amber-400/20",
    lineH: "bg-amber-400/35",
    dot: "border-amber-400/45",
    icon: "text-amber-400/85",
  },
  sky: {
    node: "border-sky-400/30 bg-sky-400/10 text-sky-300",
    line: "from-sky-400/45 via-sky-400/20",
    lineH: "bg-sky-400/35",
    dot: "border-sky-400/45",
    icon: "text-sky-400/85",
  },
};

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
      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#050505]/80 backdrop-blur-2xl">
        <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-zinc-900 shadow-[0_2px_12px_rgba(251,191,36,0.25)] transition duration-300 group-hover:shadow-[0_4px_18px_rgba(251,191,36,0.35)]">
              <GraduationCap className="h-[18px] w-[18px]" strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold tracking-tight text-white">
                Course Learning
              </p>
              <p className="hidden truncate text-[11px] font-medium text-zinc-500 sm:block">
                Nền tảng học tập trực tuyến
              </p>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href="#features"
              className="rounded-lg px-2.5 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              Tính năng
            </a>
            <Button
              asChild
              className="login-btn-gold h-9 rounded-full border-0 px-5 text-[13px] font-semibold text-zinc-900 shadow-none"
            >
              <Link href="/login" className="inline-flex items-center gap-1.5">
                Đăng nhập
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

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
              Hệ thống học tập trực tuyến
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Hai nhánh vai trò — giáo viên quản lý nội dung, học sinh học tập
              và làm bài trên cùng một nền tảng.
            </p>
          </div>

          <div className="relative mx-auto max-w-4xl">
            <div className="flex flex-col items-center">
              <div className="flex h-11 items-center gap-2 rounded-full border border-white/10 bg-[#0c0c0c]/90 px-5 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Nền tảng học tập
              </div>
              <div className="h-9 w-px bg-gradient-to-b from-amber-400/55 to-amber-400/25" />
            </div>

            <div className="relative mx-auto mb-1 h-7 max-w-lg px-6">
              <div className="absolute left-[20%] right-[20%] top-0 h-px bg-gradient-to-r from-amber-400/15 via-amber-400/40 to-sky-400/15" />
              <div className="absolute left-[20%] top-0 h-7 w-px bg-gradient-to-b from-amber-400/40 to-amber-400/15" />
              <div className="absolute right-[20%] top-0 h-7 w-px bg-gradient-to-b from-sky-400/40 to-sky-400/15" />
            </div>

            <div className="grid gap-12 md:grid-cols-2 md:gap-10">
              {roleBranches.map((branch) => {
                const BranchIcon = branch.icon;
                const accent = branchAccent[branch.accent];

                return (
                  <div key={branch.role} className="relative">
                    <div className="mb-5 flex justify-center">
                      <div
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 ${accent.node}`}
                      >
                        <BranchIcon className="h-4 w-4" />
                        <span className="text-sm font-semibold text-white">
                          {branch.role}
                        </span>
                      </div>
                    </div>

                    <div className="relative ml-3 sm:ml-4">
                      <div
                        className={`absolute bottom-3 left-[7px] top-3 w-px bg-gradient-to-b ${accent.line} to-transparent`}
                      />

                      <ul className="space-y-3">
                        {branch.items.map((item) => {
                          const ItemIcon = item.icon;

                          return (
                            <li key={item.title} className="relative pl-7">
                              <span
                                className={`absolute left-0 top-[1.15rem] h-px w-4 ${accent.lineH}`}
                              />
                              <span
                                className={`absolute left-[5px] top-[0.95rem] h-1.5 w-1.5 rounded-full border bg-[#0a0a0a] ${accent.dot}`}
                              />
                              <div className="rounded-xl border border-white/8 bg-[#0c0c0c]/55 px-3.5 py-3 transition hover:border-white/12">
                                <div className="flex items-start gap-2.5">
                                  <ItemIcon
                                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${accent.icon}`}
                                  />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-200">
                                      {item.title}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/8 bg-[#060606]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/35 to-transparent" />
        <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.35fr_0.85fr_1fr] md:items-start">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-zinc-900 shadow-[0_2px_12px_rgba(251,191,36,0.2)]">
                  <GraduationCap className="h-[18px] w-[18px]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Course Learning
                  </p>
                  <p className="text-xs text-zinc-500">
                    Nền tảng học tập trực tuyến
                  </p>
                </div>
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
                Hệ thống quản lý lớp học — video bài giảng, tài liệu theo buổi
                và bài tập trắc nghiệm / tự luận cho học sinh, giáo viên và
                quản trị viên.
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                Liên kết
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <a
                    className="text-zinc-400 transition hover:text-amber-300"
                    href="#features"
                  >
                    Tính năng
                  </a>
                </li>
                <li>
                  <Link
                    className="text-zinc-400 transition hover:text-amber-300"
                    href="/login"
                  >
                    Đăng nhập
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm font-semibold text-white">
                Bắt đầu học ngay
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
                Đăng nhập với tài khoản được cấp, nhập mã lớp và vào học.
              </p>
              <Button
                asChild
                className="login-btn-gold mt-4 h-9 w-full rounded-lg border-0 text-sm font-bold text-zinc-900"
              >
                <Link href="/login" className="inline-flex items-center justify-center gap-1.5">
                  Đăng nhập
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-white/8 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Course Learning Platform</p>
            <p>Video · Tài liệu · Bài tập — một nền tảng</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
