"use client";

import { useState } from "react";
import VideoDocumentManagement from "../video-document/page";
import { logoutSidebarItem, sidebarItems } from "../sidebarItems";
import { GraduationCap } from "lucide-react";
import { useLogout } from "@/hooks/useLogout";

const TeacherDashboardLayout = () => {
  const [selectedKey, setSelectedKey] = useState<string>("home");
  const logoutMutation = useLogout();

  const handleSidebarClick = (key: string) => {
    if (key === "logout") {
      logoutMutation.mutate();
      return;
    }

    setSelectedKey(key);
  };

  const LogoutIcon = logoutSidebarItem.Icon;

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="flex w-14 flex-col border-r border-slate-200 bg-white py-3">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-sm">
              <GraduationCap className="h-5 w-5" strokeWidth={2.5} />
            </div>
            {sidebarItems.map((item) => {
              const Icon = item.Icon;
              const isActive = selectedKey === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  title={item.label}
                  onClick={() => handleSidebarClick(item.key)}
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
              title={logoutSidebarItem.label}
              disabled={logoutMutation.isPending}
              onClick={() => handleSidebarClick(logoutSidebarItem.key)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1">
          {selectedKey === "menu" && <VideoDocumentManagement />}
          {selectedKey !== "menu" && selectedKey !== "home" && (
            <div className="p-6">
              Nội dung cho {selectedKey} (chưa triển khai)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboardLayout;

