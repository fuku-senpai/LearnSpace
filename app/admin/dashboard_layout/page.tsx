"use client";

import { Suspense, useMemo, type ComponentType } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";

import { useGetClassesQuery } from "@/app/hooks/classes/useGetClasses";
import { useGetALLMaterialsQuery } from "@/app/hooks/materials/useGetAllMaterials";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";
import AssignTeacherToClass from "../assign_teacher/page";
import ClassesManagement from "../classes/page";
import LessonManagement from "../lessons/page";
import MaterialManagement from "../materials/page";

type MenuKey =
  | "overview"
  | "materials"
  | "classes"
  | "lessons"
  | "students"
  | "schedule"
  | "teacher-assignment"
  | "logout";

type MenuItem = {
  key: MenuKey;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const menuGroups: {
  title: string;
  items: MenuItem[];
}[] = [
  {
    title: "Tổng quan",
    items: [{ key: "overview", label: "Bảng điều khiển", icon: LayoutDashboard }],
  },
  {
    title: "Quản lý lớp",
    items: [
      { key: "classes", label: "Lớp học", icon: GraduationCap },
      { key: "students", label: "Học viên", icon: Users },
      { key: "schedule", label: "Lịch dạy", icon: CalendarDays },
      {
        key: "teacher-assignment",
        label: "Gán giáo viên",
        icon: UserCheck,
      },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { key: "materials", label: "Chủ đề", icon: BookOpen },
      { key: "lessons", label: "Buổi học", icon: Layers },
    ],
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Tạo lớp học",
    description: "Khởi tạo lớp, thời gian và thông tin cơ bản.",
    key: "classes" as MenuKey,
  },
  {
    step: "02",
    title: "Gán chủ đề",
    description: "Đưa chủ đề vào lớp và sắp xếp thứ tự.",
    key: "materials" as MenuKey,
  },
  {
    step: "03",
    title: "Thêm buổi học",
    description: "Tạo buổi học theo từng chủ đề đã gán.",
    key: "lessons" as MenuKey,
  },
  {
    step: "04",
    title: "Gán giáo viên",
    description: "Phân công giáo viên phụ trách lớp.",
    key: "teacher-assignment" as MenuKey,
  },
];

const quickActions: {
  key: MenuKey;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  lineColor: string;
}[] = [
  {
    key: "classes",
    title: "Lớp học",
    description: "Quản lý danh sách lớp và lịch học.",
    icon: GraduationCap,
    lineColor: "bg-sky-400",
  },
  {
    key: "materials",
    title: "Chủ đề",
    description: "Gán và sắp xếp chủ đề trong lớp.",
    icon: BookOpen,
    lineColor: "bg-amber-400",
  },
  {
    key: "lessons",
    title: "Buổi học",
    description: "Tạo buổi học theo chủ đề đã chọn.",
    icon: Layers,
    lineColor: "bg-violet-400",
  },
  {
    key: "teacher-assignment",
    title: "Gán giáo viên",
    description: "Phân công giáo viên cho từng lớp.",
    icon: UserCheck,
    lineColor: "bg-emerald-400",
  },
];

const menuLabels: Record<MenuKey, string> = {
  overview: "Bảng điều khiển",
  materials: "Chủ đề",
  classes: "Lớp học",
  lessons: "Buổi học",
  students: "Học viên",
  schedule: "Lịch dạy",
  "teacher-assignment": "Gán giáo viên",
  logout: "Đăng xuất",
};

const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const logoutMutation = useLogout();
  const menuParam = searchParams.get("menu");
  const classId = searchParams.get("classId");

  const { data: classResponse, isLoading: isClassesLoading } =
    useGetClassesQuery({ page: 0, size: 1, code: "", name: "" });
  const { data: materialsResponse, isLoading: isMaterialsLoading } =
    useGetALLMaterialsQuery({ page: 0, size: 1, title: "" });

  const activeMenu = useMemo<MenuKey>(() => {
    const allItems = menuGroups.flatMap((group) => group.items);
    if (menuParam && allItems.some((item) => item.key === menuParam)) {
      return menuParam as MenuKey;
    }
    return "overview";
  }, [menuParam]);

  const handleMenuChange = (key: MenuKey) => {
    if (key === "logout") {
      logoutMutation.mutate();
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("menu", key);
    if (
      key === "overview" ||
      key === "classes" ||
      key === "schedule" ||
      key === "students" ||
      key === "teacher-assignment"
    ) {
      params.delete("classId");
      params.delete("classTitle");
      params.delete("materialId");
      params.delete("materialTitle");
      params.delete("lessonId");
      params.delete("lessonTitle");
    }

    if (key === "materials") {
      params.delete("materialId");
      params.delete("materialTitle");
      params.delete("lessonId");
      params.delete("lessonTitle");
    }

    if (key === "lessons") {
      params.delete("lessonId");
      params.delete("lessonTitle");
    }

    router.push(`/admin/dashboard_layout?${params.toString()}`);
  };

  const totalClasses = classResponse?.totalElements ?? 0;
  const totalMaterials = materialsResponse?.totalElements ?? 0;

  return (
    <div className="flex min-h-screen gap-4 bg-[#f3f5f9] p-4">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[270px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0e14] shadow-[0_20px_50px_rgba(0,0,0,0.18)] lg:flex">
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.12),transparent_60%)]" />

        <div className="relative border-b border-white/[0.06] px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_8px_24px_rgba(251,191,36,0.25)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-white">
                Course Admin
              </h2>
              <p className="text-xs text-zinc-500">Bảng quản trị hệ thống</p>
            </div>
          </div>
        </div>

        <nav className="relative min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-6">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-zinc-600 uppercase">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleMenuChange(item.key)}
                      className={`group flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-white/[0.08] text-white shadow-[inset_3px_0_0_0_#fbbf24]"
                          : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                          isActive
                            ? "bg-amber-400/15 text-amber-300"
                            : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="truncate font-medium">{item.label}</span>
                      {isActive ? (
                        <ChevronRight className="ml-auto h-4 w-4 text-amber-400/80" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="relative mt-auto shrink-0 border-t border-white/[0.06] bg-[#0c0e14] p-4">
          <button
            type="button"
            onClick={() => handleMenuChange("logout")}
            disabled={logoutMutation.isPending}
            className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10">
              <LogOut className="h-4 w-4" />
            </span>
            {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
          </button>
        </div>
      </aside>

      <main className="flex min-h-[calc(100vh-2rem)] min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/90 px-6 py-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Admin Panel
              </p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                {menuLabels[activeMenu]}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-2 text-right sm:block">
                <p className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                  Hôm nay
                </p>
                <p className="text-sm font-medium text-slate-700">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-xs font-bold text-white shadow-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="relative flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[length:32px_32px]" />

          {activeMenu === "overview" && (
            <div className="relative mx-auto max-w-5xl space-y-10">
              <section className="space-y-5 border-b border-slate-200 pb-8">
                <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-amber-600 uppercase">
                  <Sparkles className="h-3.5 w-3.5" />
                  Tổng quan hệ thống
                </span>
                <div className="h-px w-full max-w-[120px] bg-gradient-to-r from-amber-400 to-transparent" />
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="max-w-xl space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                      Quản lý nội dung học tập
                    </h2>
                    <p className="text-sm leading-relaxed text-slate-500">
                      Theo dõi lớp học, chủ đề và buổi học theo quy trình thống
                      nhất từ tạo lớp đến gán giáo viên.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    className="h-10 shrink-0 cursor-pointer gap-2 rounded-none border-b-2 border-slate-900 px-0 text-slate-900 hover:bg-transparent hover:text-slate-700"
                    onClick={() => handleMenuChange("classes")}
                  >
                    Bắt đầu quản lý lớp
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>

              <section className="flex flex-col divide-y divide-slate-200 border-y border-slate-200 sm:flex-row sm:divide-x sm:divide-y-0">
                {[
                  {
                    label: "Tổng lớp học",
                    value: isClassesLoading ? "—" : totalClasses,
                    hint: "Lớp đang quản lý",
                    icon: GraduationCap,
                  },
                  {
                    label: "Tổng chủ đề",
                    value: isMaterialsLoading ? "—" : totalMaterials,
                    hint: "Chủ đề trong thư viện",
                    icon: BookOpen,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex flex-1 items-center gap-4 py-6 sm:px-8 sm:first:pl-0 sm:last:pr-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">
                          {stat.label}
                        </p>
                        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                          {stat.value}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {stat.hint}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </section>

              <section>
                <div className="mb-6 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Quy trình vận hành
                  </h3>
                  <div className="h-px w-full max-w-[80px] bg-gradient-to-r from-amber-400/70 to-transparent" />
                  <p className="text-sm text-slate-500">
                    Thực hiện theo thứ tự để thiết lập lớp học hoàn chỉnh.
                  </p>
                </div>

                <div className="relative mx-auto max-w-3xl">
                  <div className="absolute top-3 bottom-3 left-[15px] w-px bg-gradient-to-b from-amber-400/70 via-amber-400/30 to-transparent sm:left-[19px]" />

                  <div className="space-y-8">
                    {workflowSteps.map((step) => (
                      <button
                        key={step.step}
                        type="button"
                        onClick={() => handleMenuChange(step.key)}
                        className="group relative flex w-full cursor-pointer gap-5 text-left sm:gap-6"
                      >
                        <div className="relative z-10 flex shrink-0 flex-col items-center">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/50 bg-white text-xs font-bold text-amber-600 shadow-sm transition group-hover:border-amber-500 group-hover:bg-amber-50 sm:h-10 sm:w-10">
                            {step.step}
                          </div>
                        </div>
                        <div className="min-w-0 flex-1 border-b border-slate-100 pb-6 group-last:border-b-0 group-hover:border-slate-200">
                          <div className="mb-2 h-px w-full max-w-[100px] bg-gradient-to-r from-slate-300 to-transparent transition group-hover:from-amber-400/60" />
                          <p className="font-semibold text-slate-900 transition group-hover:text-amber-700">
                            {step.title}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed text-slate-500">
                            {step.description}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition group-hover:text-amber-600">
                            Mở mô-đun
                            <ArrowRight className="h-3 w-3" />
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-5 space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Truy cập nhanh
                  </h3>
                  <div className="h-px w-full max-w-[80px] bg-gradient-to-r from-slate-300 to-transparent" />
                </div>

                <div className="divide-y divide-slate-200 border-t border-slate-200">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => handleMenuChange(action.key)}
                        className="group flex w-full cursor-pointer items-center gap-4 py-5 text-left transition hover:bg-slate-50/80 sm:gap-5"
                      >
                        <div
                          className={`h-10 w-1 shrink-0 rounded-full ${action.lineColor} opacity-70 transition group-hover:opacity-100`}
                        />
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition group-hover:border-slate-300 group-hover:text-slate-900">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-slate-900">
                            {action.title}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-500">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="mr-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" />
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {(activeMenu === "students" || activeMenu === "schedule") && (
            <div className="relative mx-auto max-w-md space-y-6 pt-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 text-slate-500">
                {activeMenu === "students" ? (
                  <Users className="h-6 w-6" />
                ) : (
                  <CalendarDays className="h-6 w-6" />
                )}
              </div>
              <div className="space-y-2">
                <div className="mx-auto h-px w-16 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {menuLabels[activeMenu]}
                </h3>
                <p className="text-sm text-slate-500">
                  Mô-đun đang được phát triển. Bạn có thể quay lại bảng điều
                  khiển để tiếp tục các tác vụ khác.
                </p>
              </div>
              <Button
                variant="ghost"
                className="cursor-pointer border-b border-slate-300 rounded-none px-0 hover:bg-transparent"
                onClick={() => handleMenuChange("overview")}
              >
                Về bảng điều khiển
              </Button>
            </div>
          )}

          <div className={`relative ${activeMenu === "materials" ? "" : "hidden"}`}>
            <MaterialManagement classId={classId ?? undefined} />
          </div>
          {activeMenu === "classes" && (
            <div className="relative">
              <ClassesManagement />
            </div>
          )}
          {activeMenu === "lessons" && (
            <div className="relative">
              <LessonManagement />
            </div>
          )}
          {activeMenu === "teacher-assignment" && (
            <div className="relative">
              <AssignTeacherToClass />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f3f5f9] text-sm text-slate-500">
          Đang tải dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
