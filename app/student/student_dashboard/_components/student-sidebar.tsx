"use client";

import type { LucideIcon } from "lucide-react";
import { BookOpen, LogOut, Menu } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

type StudentSidebarItem = {
  key: string;
  Icon: LucideIcon;
  label: string;
};

const sidebarItems: StudentSidebarItem[] = [
  { key: "menu", Icon: Menu, label: "Nội dung học tập" },
];

const logoutItem: StudentSidebarItem = {
  key: "logout",
  Icon: LogOut,
  label: "Đăng xuất",
};

type StudentSidebarProps = {
  activeKey: string;
  onNavigate: (key: string) => void;
};

const StudentSidebar = ({ activeKey, onNavigate }: StudentSidebarProps) => {
  const logoutMutation = useLogout();

  const handleClick = (key: string) => {
    if (key === "logout") {
      logoutMutation.mutate();
      return;
    }

    onNavigate(key);
  };

  const LogoutIcon = logoutItem.Icon;

  return (
    <aside className="flex w-14 flex-col border-r border-slate-200 bg-white py-3">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
          <BookOpen className="h-5 w-5" strokeWidth={2.5} />
        </div>

        {sidebarItems.map((item) => {
          const Icon = item.Icon;
          const isActive = activeKey === item.key;

          return (
            <button
              key={item.key}
              type="button"
              title={item.label}
              onClick={() => handleClick(item.key)}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition hover:bg-slate-100 ${
                isActive
                  ? "bg-sky-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-center pt-4">
        <button
          type="button"
          title={logoutItem.label}
          disabled={logoutMutation.isPending}
          onClick={() => handleClick(logoutItem.key)}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogoutIcon className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;
