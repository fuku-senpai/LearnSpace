"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronRight, LogOut } from "lucide-react";

export type DashboardMenuItem<T extends string> = {
  key: T;
  label: string;
  hint: string;
  index: string;
  icon: LucideIcon;
  accent: string;
  activeGlow: string;
};

export type DashboardMenuGroup<T extends string> = {
  title: string;
  subtitle: string;
  items: DashboardMenuItem<T>[];
};

export type DashboardSidebarBranding = {
  title: string;
  tagline: string;
  icon: LucideIcon;
  iconColor: string;
  radialGradient: string;
  lineAccent: string;
  chevronActive: string;
};

type DashboardSidebarProps<T extends string> = {
  groups: DashboardMenuGroup<T>[];
  activeMenu: T;
  onMenuChange: (key: T) => void;
  onLogout: () => void;
  isLogoutPending?: boolean;
  branding: DashboardSidebarBranding;
};

export function DashboardSidebar<T extends string>({
  groups,
  activeMenu,
  onMenuChange,
  onLogout,
  isLogoutPending = false,
  branding,
}: DashboardSidebarProps<T>) {
  const BrandIcon = branding.icon;

  return (
    <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-[290px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0c0e14] shadow-[0_20px_50px_rgba(0,0,0,0.18)] lg:flex">
      <div
        className={`pointer-events-none absolute inset-0 rounded-3xl ${branding.radialGradient}`}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[repeating-linear-gradient(-12deg,transparent,transparent_18px,rgba(255,255,255,0.015)_18px,rgba(255,255,255,0.015)_19px)]" />

      <div className="relative border-b border-white/[0.06] px-6 py-7">
        <div className="flex items-center gap-3">
          <BrandIcon className={`h-6 w-6 shrink-0 ${branding.iconColor}`} />
          <div>
            <h2 className="text-[15px] font-semibold tracking-tight text-white">
              {branding.title}
            </h2>
            <p className="text-xs text-zinc-500">{branding.tagline}</p>
          </div>
        </div>
      </div>

      <nav className="relative min-h-0 flex-1 space-y-7 overflow-y-auto px-3 py-6">
        {groups.map((group) => (
          <div key={group.title} className="space-y-2">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                  {group.title}
                </p>
                <p className="font-mono text-[10px] text-zinc-600">
                  — {group.subtitle}
                </p>
              </div>
              <span
                className={`mb-0.5 h-px w-8 bg-gradient-to-r ${branding.lineAccent} to-transparent`}
              />
            </div>

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onMenuChange(item.key)}
                    className={`group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl px-2.5 py-2.5 text-left transition-all duration-300 ${
                      isActive
                        ? `bg-white/[0.07] text-white ${item.activeGlow}`
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span
                      className={`absolute inset-y-2 left-0 w-1 rounded-r-full bg-gradient-to-b transition-all duration-300 ${
                        isActive
                          ? `${item.accent} opacity-100`
                          : "from-zinc-600 to-zinc-700 opacity-0 group-hover:opacity-40"
                      }`}
                    />

                    <span className="w-7 shrink-0 text-center font-mono text-[10px] tracking-wider text-zinc-600 transition group-hover:text-zinc-400">
                      {item.index}
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 -rotate-3 items-center justify-center rounded-xl border transition-all duration-300 group-hover:rotate-0 ${
                        isActive
                          ? `border-white/10 bg-gradient-to-br ${item.accent} text-white shadow-lg`
                          : "border-white/[0.06] bg-white/[0.03] text-zinc-500 group-hover:border-white/10 group-hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {item.label}
                      </span>
                      <span
                        className={`block truncate font-mono text-[10px] transition ${
                          isActive ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {item.hint}
                      </span>
                    </span>

                    {isActive ? (
                      <ChevronRight
                        className={`mr-1 h-4 w-4 shrink-0 ${branding.chevronActive}`}
                      />
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
          onClick={onLogout}
          disabled={isLogoutPending}
          className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isLogoutPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
