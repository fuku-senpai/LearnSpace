"use client"

import { Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLogout } from "@/hooks/useLogout"
import ClassesManagement from "../classes/page"
import MaterialManagement from "../materials/page"
import LessonManagement from "../lessons/page"
import LessonResource from "../lessonResource/page"
import RecordsManagement from "../records/page"

type MenuKey =
  | "overview"
  | "materials"
  | "classes"
  | "lessons"
  | "lessonResources"
  | "records"
  | "students"
  | "schedule"
  | "logout"

const menuGroups: { title: string; items: { key: MenuKey; label: string }[] }[] = [
  {
    title: "Tổng quan",
    items: [{ key: "overview", label: "Bảng điều khiển" }],
  },
  {
    title: "Quản lý lớp",
    items: [
      { key: "classes", label: "Lớp học" },
      { key: "students", label: "Học viên" },
      { key: "schedule", label: "Lịch dạy" },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { key: "materials", label: "Chủ đề" },
      { key: "lessons", label: "Buổi học" },
      { key: "lessonResources", label: "Tài liệu buổi học" },
      { key: "records", label: "Bản ghi âm" },
    ],
  },
  {
    title: "Hệ thống",
    items: [{ key: "logout", label: "Đăng xuất" }],
  },
]

const DashboardContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const logoutMutation = useLogout()
  const menuParam = searchParams.get("menu")
  const classId = searchParams.get("classId")
  const classTitle = searchParams.get("classTitle")
  const materialTitle = searchParams.get("materialTitle")
  const lessonTitle = searchParams.get("lessonTitle")
  const lessonId = searchParams.get("lessonId")

  const activeMenu = useMemo<MenuKey>(() => {
    const allItems = menuGroups.flatMap((group) => group.items)
    if (menuParam && allItems.some((item) => item.key === menuParam)) {
      return menuParam as MenuKey
    }
    return "overview"
  }, [menuParam])

  const handleMenuChange = (key: MenuKey) => {
    if (key === "logout") {
      logoutMutation.mutate()
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    params.set("menu", key)

    if (key === "overview" || key === "classes" || key === "schedule" || key === "students") {
      params.delete("classId")
      params.delete("classTitle")
      params.delete("materialId")
      params.delete("materialTitle")
      params.delete("lessonId")
      params.delete("lessonTitle")
    }

    if (key === "materials") {
      params.delete("materialId")
      params.delete("materialTitle")
      params.delete("lessonId")
      params.delete("lessonTitle")
    }

    if (key === "lessons") {
      params.delete("lessonId")
      params.delete("lessonTitle")
    }

    router.push(`/teacher/dashboard_layout?${params.toString()}`)
  }

  const handleSwitchLessonSection = (key: "lessonResources" | "records") => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("menu", key)
    router.push(`/teacher/dashboard_layout?${params.toString()}`)
  }

  const handleBackToLessons = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("menu", "lessons")
    params.delete("lessonId")
    params.delete("lessonTitle")
    router.push(`/teacher/dashboard_layout?${params.toString()}`)
  }


  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white px-5 py-6 shadow-sm lg:flex">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Giáo viên
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              Dashboard
            </h2>
          </div>
          <nav className="mt-6 space-y-4 text-sm">
            {menuGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <p className="px-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Button
                      key={item.key}
                      type="button"
                      variant={activeMenu === item.key ? "default" : "ghost"}
                      className={
                        activeMenu === item.key
                          ? "h-9 w-full justify-start cursor-pointer rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                          : "h-9 w-full justify-start cursor-pointer rounded-lg text-slate-600 hover:bg-slate-100"
                      }
                      onClick={() => handleMenuChange(item.key)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-auto rounded-xl border border-slate-200/70 bg-slate-50 p-3 text-xs text-slate-500">
            Hỗ trợ kỹ thuật 24/7
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#f4f6fb]/95 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
              {/* <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ngữ cảnh hiện tại
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium text-slate-900">
                    {classTitle || "Chưa chọn lớp"}
                  </span>
                  <span>•</span>
                  <span>{materialTitle || "Chưa chọn chủ đề"}</span>
                  <span>•</span>
                  <span>{lessonTitle || lessonId || "Chưa chọn buổi học"}</span>
                </div>
              </div> */}

              {lessonId ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant={activeMenu === "lessonResources" ? "default" : "outline"}
                    className={
                      activeMenu === "lessonResources"
                        ? "cursor-pointer rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        : "cursor-pointer rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }
                    onClick={() => handleSwitchLessonSection("lessonResources")}
                  >
                    Tài liệu buổi học
                  </Button>
                  <Button
                    type="button"
                    variant={activeMenu === "records" ? "default" : "outline"}
                    className={
                      activeMenu === "records"
                        ? "cursor-pointer rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                        : "cursor-pointer rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }
                    onClick={() => handleSwitchLessonSection("records")}
                  >
                    Records
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="cursor-pointer rounded-lg text-slate-600 hover:bg-slate-100"
                    onClick={handleBackToLessons}
                  >
                    Quay lại buổi học
                  </Button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="px-6 py-8">
          

            {activeMenu === "overview" && (
              <div className="mx-auto mt-6 grid max-w-7xl gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Thông tin buổi học</CardTitle>
                  <CardDescription>
                    Điền thông tin cơ bản trước khi tải lên video.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Tên buổi học
                    </label>
                    <Input
                      placeholder="Ví dụ: Chương 1 - Đại cương"
                      className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Lớp học
                    </label>
                    <Input
                      placeholder="Ví dụ: 12A1"
                      className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-medium text-slate-600">
                      Mô tả ngắn
                    </label>
                    <textarea
                      className="min-h-27.5 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300/70 focus-visible:border-slate-300 focus-visible:outline-none"
                      placeholder="Nội dung chính, mục tiêu buổi học..."
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-end border-t border-slate-100 bg-slate-50/70">
                  <Button className="h-10 rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800">
                    Lưu buổi học
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-slate-200/80 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>Video bài giảng</CardTitle>
                  <CardDescription>
                    Tải video lên buổi học đã tạo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
                    <div className="text-sm font-medium text-slate-700">
                      Kéo thả video vào đây
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      MP4, MOV tối đa 2GB
                    </p>
                    <Button className="mt-4 h-9 rounded-lg bg-white text-slate-700 shadow-sm hover:bg-slate-100">
                      Chọn tệp từ máy tính
                    </Button>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Chưa có tệp nào
                      </span>
                      <span className="text-xs text-slate-400">0%</span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-0 rounded-full bg-slate-900" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
            <div className={activeMenu === "materials" ? "" : "hidden"}>
              <MaterialManagement classId={classId ?? undefined} />
            </div>
            {activeMenu === "classes" && (
             <ClassesManagement/>)}
             {
              activeMenu === "lessons" && (
             <LessonManagement/>
            )}
            {activeMenu === "lessonResources" && (
              <LessonResource />
            )}
            {activeMenu === "records" && <RecordsManagement />}
          </div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-sm text-slate-500">
          Đang tải dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
