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
    <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col overflow-hidden border-r border-white/[0.08] bg-[#020f27] shadow-[4px_0_24px_rgba(0,0,0,0.12)] lg:flex">
      <div
        className={`pointer-events-none absolute inset-0 ${branding.radialGradient}`}
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
                    className={`group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden px-2.5 py-2.5 text-left transition-all duration-300 ${
                      isActive
                        ? `bg-white/[0.07] text-white ${item.activeGlow}`
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                  >
                    <span
                      className={`absolute inset-y-2 left-0 w-1 bg-gradient-to-b transition-all duration-300 ${
                        isActive
                          ? `${item.accent} opacity-100`
                          : "from-zinc-600 to-zinc-700 opacity-0 group-hover:opacity-40"
                      }`}
                    />

                    <span className="w-7 shrink-0 text-center font-mono text-[10px] tracking-wider text-zinc-600 transition group-hover:text-zinc-400">
                      {item.index}
                    </span>

                    <Icon
                      className={`h-[18px] w-[18px] shrink-0 transition-colors duration-300 ${
                        isActive
                          ? "text-sky-300"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />

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

      <div className="relative mt-auto shrink-0 border-t border-white/[0.08] bg-[#0c1e3a] p-4">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLogoutPending}
          className="flex h-10 w-full cursor-pointer items-center gap-3 px-3 text-sm font-medium text-rose-400 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isLogoutPending ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </aside>
  );
}
