import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";

import type { DashboardMenuGroup } from "@/components/dashboard/DashboardSidebar";

export type AdminMenuKey =
  | "overview"
  | "materials"
  | "classes"
  | "lessons"
  | "students"
  | "accounts"
  | "schedule"
  | "teacher-assignment";

export const adminMenuGroups: DashboardMenuGroup<AdminMenuKey>[] = [
  {
    title: "Điểm neo",
    subtitle: "bắt đầu từ đây",
    items: [
      {
        key: "overview",
        label: "Tổng quan",
        hint: "nhìn nhanh",
        index: "01",
        icon: LayoutDashboard,
        accent: "from-amber-400 to-orange-500",
        activeGlow: "shadow-[0_0_20px_rgba(251,191,36,0.25)]",
      },
    ],
  },
  {
    title: "Vận hành",
    subtitle: "lớp & người",
    items: [
      {
        key: "classes",
        label: "Lớp học",
        hint: "danh sách lớp",
        index: "02",
        icon: GraduationCap,
        accent: "from-sky-400 to-cyan-500",
        activeGlow: "shadow-[0_0_20px_rgba(56,189,248,0.22)]",
      },
      {
        key: "students",
        label: "Học viên",
        hint: "theo lớp",
        index: "03",
        icon: Users,
        accent: "from-violet-400 to-indigo-500",
        activeGlow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
      },
      {
        key: "schedule",
        label: "Lịch dạy",
        hint: "theo tuần",
        index: "04",
        icon: CalendarDays,
        accent: "from-emerald-400 to-teal-500",
        activeGlow: "shadow-[0_0_20px_rgba(52,211,153,0.22)]",
      },
      {
        key: "teacher-assignment",
        label: "Gán giáo viên",
        hint: "phân công",
        index: "05",
        icon: UserCheck,
        accent: "from-rose-400 to-pink-500",
        activeGlow: "shadow-[0_0_20px_rgba(251,113,133,0.22)]",
      },
    ],
  },
  {
    title: "Hệ thống",
    subtitle: "quyền & tài khoản",
    items: [
      {
        key: "accounts",
        label: "Tài khoản",
        hint: "tạo & khóa",
        index: "06",
        icon: Shield,
        accent: "from-fuchsia-400 to-purple-500",
        activeGlow: "shadow-[0_0_20px_rgba(232,121,249,0.22)]",
      },
    ],
  },
  {
    title: "Nội dung",
    subtitle: "chủ đề & buổi",
    items: [
      {
        key: "materials",
        label: "Chủ đề",
        hint: "thư viện",
        index: "07",
        icon: BookOpen,
        accent: "from-amber-400 to-yellow-500",
        activeGlow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
      },
      {
        key: "lessons",
        label: "Buổi học",
        hint: "chi tiết",
        index: "08",
        icon: Layers,
        accent: "from-indigo-400 to-blue-500",
        activeGlow: "shadow-[0_0_20px_rgba(129,140,248,0.22)]",
      },
    ],
  },
];

export const adminMenuLabels: Record<AdminMenuKey, string> = {
  overview: "Tổng quan",
  materials: "Chủ đề",
  classes: "Lớp học",
  lessons: "Buổi học",
  students: "Học viên",
  accounts: "Tài khoản",
  schedule: "Lịch dạy",
  "teacher-assignment": "Gán giáo viên",
};

export const adminSidebarBranding = {
  title: "Course Admin",
  tagline: "Bảng quản trị hệ thống",
  icon: GraduationCap,
  iconColor: "text-amber-400",
  radialGradient:
    "bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(251,191,36,0.14),transparent_60%)]",
  lineAccent: "from-amber-500/40",
  chevronActive: "text-amber-300/90",
};
