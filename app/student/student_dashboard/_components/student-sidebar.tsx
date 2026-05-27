"use client"

type StudentSidebarProps = {
  items: string[]
  activeItem: string
  onChange: (item: string) => void
}

import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

const StudentSidebar = ({ items, activeItem, onChange }: StudentSidebarProps) => {
  const logoutMutation = useLogout();
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-6 shadow-sm lg:block">
      <div className="mb-8 space-y-1 px-2">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          Student Hub
        </div>
        <div className="text-xl font-semibold text-slate-900">Bảng điều khiển</div>
      </div>

      <nav className="space-y-1">
  {items.map((item) => {
    const isActive = activeItem === item;

    return (
      <button
        key={item}
        type="button"
        onClick={() => onChange(item)}
        className={`
          group cursor-pointer relative flex w-full items-center rounded-xl px-4 py-3
          text-left text-sm transition-all duration-200
          ${
            isActive
              ? "bg-slate-100 text-slate-900"
              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          }
        `}
      >
        {/* Left indicator */}
        <span
          className={`
            absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all
            ${
              isActive
                ? "bg-slate-900"
                : "bg-transparent group-hover:bg-slate-300"
            }
          `}
        />

        {/* Label */}
        <span
          className={`truncate ${
            isActive ? "font-semibold" : "font-medium"
          }`}
        >
          {item}
        </span>
      </button>
    );
  })}
</nav>
      <div className="mt-6 px-2">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          Đăng xuất
        </Button>
      </div>
    </aside>
  )
}

export default StudentSidebar