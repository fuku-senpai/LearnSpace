import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, MonitorPlay } from "lucide-react";

export type TeacherMenuKey = "overview" | "content";

export type TeacherMenuItem = {
  key: TeacherMenuKey;
  label: string;
  icon: LucideIcon;
};

export const teacherMenuGroups: {
  title: string;
  items: TeacherMenuItem[];
}[] = [
  {
    title: "Tổng quan",
    items: [
      { key: "overview", label: "Bảng điều khiển", icon: LayoutDashboard },
    ],
  },
  {
    title: "Giảng dạy",
    items: [
      { key: "content", label: "Video & Tài liệu", icon: MonitorPlay },
    ],
  },
];

export const teacherMenuLabels: Record<TeacherMenuKey, string> = {
  overview: "Bảng điều khiển",
  content: "Video & Tài liệu",
};
