import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CalendarRange,
  CheckCircle2,
  FileText,
  GraduationCap,
  Heart,
  Layers3,
  Play,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
export const metadata = {
  title: "Course Learning Platform",
  description: "Nền tảng quản lý lớp học, video bài giảng và tài liệu học tập.",
};

const features = [
  {
    icon: BookOpen,
    title: "Tài liệu theo buổi",
    description: "Chủ đề, file và ghi chú được gom đúng theo từng buổi học.",
    accent: "from-sky-400 to-cyan-500",
  },
  {
    icon: Play,
    title: "Video xem lại",
    description:
      "Phát video trực tiếp trong hệ thống để học viên xem lại dễ hơn.",
    accent: "from-amber-300 to-amber-500",
  },

  {
    icon: Users,
    title: "Lớp học rõ ràng",
    description: "Quản lý buổi học, học viên và lịch học trong một dashboard.",
    accent: "from-sky-400 to-indigo-500",
  },
  {
    icon: GraduationCap,
    title: "Dành cho giáo viên",
    description:
      "Tạo lớp, đăng buổi học và theo dõi nội dung theo thời gian thực.",
    accent: "from-amber-300 to-orange-500",
  },
];

const highlights = [
  "Quản lý lớp học, buổi học và tài liệu ở một nơi",
  "Học viên xem lại bài giảng ngay trong hệ thống",
  "Lịch học và bản ghi video luôn đi cùng lớp",
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f9fbfe_0%,#eef4fb_55%,#f8fafc_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.12),transparent_25%),radial-gradient(circle_at_center,rgba(255,255,255,0.92),transparent_48%)]" />
        <div className="absolute inset-0 hero-glow opacity-70" />

        <div className="relative mx-auto max-w-7xl px-6 py-5 lg:px-8">
          <header className="sticky top-5 z-50 max-w-3xl mx-auto">
            <div className="flex items-center justify-between rounded-[1.8rem] border border-white/60 bg-white/70 px-5 py-4 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
              {/* Logo */}
              <Link href="/" className="group flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white shadow-md transition duration-300 group-hover:scale-105">
                  <BookOpen className="h-5 w-5" />
                </div>

                <div>
                  <h1 className="text-sm font-semibold tracking-tight text-slate-900">
                    Course Learning Platform
                  </h1>

                  <p className="text-xs text-slate-400">Student Learning Hub</p>
                </div>

              </Link>

              {/* Right action */}
              <Button
                asChild
                variant="ghost"
                className="rounded-full border border-slate-200 bg-white px-5 text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Link href="/login">Đăng nhập</Link>
              </Button>
            </div>
          </header>

          <div className="grid items-center gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
            <div className="relative flex h-[520px] items-center justify-center">
              {/* center card */}
              <div className="relative z-20 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg">
                    <BookOpen className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-xl font-semibold text-slate-900">
                    Learning Dashboard
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Video, tài liệu và lịch học trong một nơi
                  </p>
                </div>
              </div>

              {/* floating cards */}
              {[
                {
                  title: "Video bài giảng",
                  icon: Play,
                  position: "top-10 left-0",
                },
                {
                  title: "Tài liệu học",
                  icon: FileText,
                  position: "top-24 right-0",
                },
                {
                  title: "Lịch học theo tuần",
                  icon: Calendar,
                  position: "bottom-10 left-10",
                },
                {
                  title: "Giảng viên",
                  icon: Users,
                  position: "bottom-20 right-8",
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={`absolute ${item.position} float-card rounded-[1.8rem] border border-white/70 bg-white/80 px-5 py-4 shadow-xl backdrop-blur-xl`}
                    style={{
                      animationDelay: `${index * 0.4}s`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                        <Icon className="h-5 w-5 text-slate-700" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {item.title}
                        </p>

                        <span className="text-xs text-slate-500">
                          Truy cập nhanh
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="relative"
              style={{ animation: "fade-up 0.9s ease-out both" }}
            >
              <div className="hero-glow absolute -left-8 top-10 h-28 w-28 rounded-full bg-sky-200/50 blur-3xl" />
              <div className="hero-glow float-slower absolute -right-8 bottom-10 h-32 w-32 rounded-full bg-slate-300/50 blur-3xl" />

              <div className="relative mt-12 h-[250px] w-full max-w-lg">
                {[
                  {
                    title: "Slide & tài liệu",
                    desc: "Xem trước PDF hoặc mở link bài giảng",
                    icon: <BookOpen className="h-5 w-5" />,
                    color: "bg-amber-100 text-amber-700",
                    position: "top-0 left-0",
                    className: "float-video",
                  },
                    //   {
                    //     title: "Dành cho Phương Dung 💙",
                    //     desc: "Mỗi bài giảng, mỗi dòng code và từng điều nhỏ bé đều mang theo sự yêu thương dành cho em.",
                    //     icon: <Heart className="h-5 w-5" />,
                    //     color: "bg-pink-100 text-pink-600",
                    //     position: "top-0 left-0",
                    //     className: "float-video",
                    //   },
                  {
                    title: "Video xem lại",
                    desc: "Recording sau mỗi buổi học",
                    icon: <Play className="h-5 w-5" />,
                    color: "bg-sky-100 text-sky-700",
                    position: "top-8 right-0",
                    className: "float-doc",
                  },
                  {
                    title: "Lịch học",
                    desc: "Theo dõi thời khoá biểu hàng tuần",
                    icon: <CalendarRange className="h-5 w-5" />,
                    color: "bg-emerald-100 text-emerald-700",
                    position: "bottom-0 left-10",
                    className: "float-teacher",
                  },
                  {
                    title: "Giảng viên",
                    desc: "Biết ai đang phụ trách lớp học",
                    icon: <Users className="h-5 w-5" />,
                    color: "bg-cyan-100 text-cyan-700",
                    position: "bottom-6 right-6",
                    className: "float-video",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`absolute ${item.position} ${item.className} group rounded-[1.8rem] border border-white/70 bg-white/90 p-4 shadow-xl backdrop-blur transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.color}`}
                      >
                        {item.icon}
                      </div>

                      <div className="max-w-[180px]">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </h4>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        {/* heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-sky-50 px-4 py-1 text-sm font-medium text-sky-700">
            Learning Platform
          </span>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900">
            Một nền tảng cho học tập hiện đại
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Quản lý lớp học, video bài giảng và tài liệu trong một không gian
            học tập tập trung.
          </p>
        </div>

        {/* Bento grid */}
        <div className="mt-16 grid gap-5 lg:grid-cols-12">
          {features.map((item, index) => {
            const Icon = item.icon;

            const layouts = [
              "lg:col-span-5 lg:row-span-2",
              "lg:col-span-7",
              "lg:col-span-3",
              "lg:col-span-4",
            ];

            return (
              <div
                key={item.title}
                className={`group relative overflow-hidden rounded-[2.5rem] bg-white/70 p-7 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_60px_rgba(15,23,42,0.08)] ${layouts[index]}`}
              >
                {/* soft background */}
                <div
                  className={`absolute right-[-40px] top-[-40px] h-40 w-40 rounded-full bg-gradient-to-br opacity-10 blur-3xl ${item.accent}`}
                />

                {/* icon */}
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-white shadow-lg transition duration-500 group-hover:scale-110`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                {/* content */}
                <div className="mt-8 max-w-sm">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>

                {/* floating decoration */}
                <div className="absolute bottom-6 right-6 opacity-10 transition duration-500 group-hover:scale-110">
                  <Icon className="h-24 w-24 text-slate-900" />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {/* 
      <section
        id="how-it-works"
        className="border-y border-slate-200/70 bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "Tạo lớp", "Khởi tạo lớp, chủ đề và lịch học."],
              [
                "02",
                "Đăng nội dung",
                "Thêm tài liệu, video và bản ghi buổi học.",
              ],
              [
                "03",
                "Học và xem lại",
                "Học viên vào lớp, xem lại bài giảng ngay.",
              ],
            ].map(([step, title, desc]) => (
              <div
                key={step}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="text-sm font-semibold text-slate-500">
                  {step}
                </div>
                <div className="mt-2 text-lg font-semibold text-slate-900">
                  {title}
                </div>
                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <footer id="contact" className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    Course Learning Platform
                  </div>
                  <div className="text-xs text-slate-500">
                    Nền tảng quản lý lớp học và video học tập
                  </div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
                Hệ thống giúp giáo viên quản lý lớp học, tài liệu, buổi học và
                video xem lại trong một dashboard rõ ràng.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                Hỗ trợ
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div>Quản lý lớp học và video theo buổi.</div>
                <div>Tài liệu đính kèm và lịch học rõ ràng.</div>
                <div>Thiết kế nhẹ, dễ dùng, phù hợp dashboard học tập.</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <div>© 2026 Course Learning Platform</div>
            <div className="flex flex-wrap gap-4">
              <a className="transition hover:text-slate-900" href="#features">
                Tính năng
              </a>
              <a className="transition hover:text-slate-900" href="#contact">
                Liên hệ
              </a>
              <Link className="transition hover:text-slate-900" href="/login">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
