"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

export type StudentMenuKey = "overview" | "content";

export type StudentMenuItem = {
  key: StudentMenuKey;
  label: string;
  icon: LucideIcon;
};

export const studentMenuGroups: {
  title: string;
  items: StudentMenuItem[];
}[] = [
  {
    title: "Tổng quan",
    items: [
      { key: "overview", label: "Bảng điều khiển", icon: LayoutDashboard },
    ],
  },
  {
    title: "Học tập",
    items: [
      { key: "content", label: "Nội dung học tập", icon: BookOpen },
    ],
  },
];

export const studentMenuLabels: Record<StudentMenuKey, string> = {
  overview: "Bảng điều khiển",
  content: "Nội dung học tập",
};

type StudentSidebarProps = {
  activeKey: StudentMenuKey;
  onNavigate: (key: StudentMenuKey | "logout") => void;
};

const StudentSidebar = ({ activeKey, onNavigate }: StudentSidebarProps) => {
  const logoutMutation = useLogout();

  const handleClick = (key: StudentMenuKey | "logout") => {
    if (key === "logout") {
      logoutMutation.mutate();
      return;
    }

    onNavigate(key);
  };

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[270px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0e14] shadow-[0_20px_50px_rgba(0,0,0,0.18)] lg:flex">
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,92,246,0.14),transparent_60%)]" />

      <div className="relative border-b border-white/[0.06] px-6 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 text-white shadow-[0_8px_24px_rgba(139,92,246,0.25)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              Course Student
            </h2>
            <p className="text-xs text-zinc-500">Không gian học tập</p>
          </div>
        </div>
      </div>

      <nav className="relative min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-6">
        {studentMenuGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <p className="px-3 text-[10px] font-semibold tracking-[0.16em] text-zinc-600 uppercase">
              {group.title}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeKey === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleClick(item.key)}
                    className={`group flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.08] text-white shadow-[inset_3px_0_0_0_#a78bfa]"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition ${
                        isActive
                          ? "bg-violet-400/15 text-violet-300"
                          : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                    {isActive ? (
                      <ChevronRight className="ml-auto h-4 w-4 text-violet-400/80" />
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
          onClick={() => handleClick("logout")}
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
  );
};

export default StudentSidebar;
