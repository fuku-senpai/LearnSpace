"use client";

import type { LucideIcon } from "lucide-react";
import {
  Home,
  Menu,
  FileText,
  Link2,
  LogOut,
  NotebookText,
  Settings,
  Tag,
  User,
} from "lucide-react";

export type TeacherSidebarItem = {
  key: string;
  Icon: LucideIcon;
  path?: string;
  label?: string;
};

export const sidebarItems: TeacherSidebarItem[] = [
  { key: "home", Icon: Home, path: "/teacher" },
  { key: "menu", Icon: Menu, path: "/teacher/video-document" },
  { key: "file", Icon: FileText },
  { key: "link", Icon: Link2 },
  { key: "notebook", Icon: NotebookText },
  { key: "tag", Icon: Tag },
  { key: "settings", Icon: Settings },
  { key: "user", Icon: User },
];

export const logoutSidebarItem: TeacherSidebarItem = {
  key: "logout",
  Icon: LogOut,
  label: "Đăng xuất",
};