"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateLessonMutation } from "@/app/hooks/lessons/useCreateLesson";
import { useGetLessonsQuery } from "@/app/hooks/lessons/useGetLessons";
import type { LessonItem } from "@/app/service/lesson.service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Video } from "lucide-react";

const LessonManagementContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialId = searchParams.get("materialId") ?? "";
  const materialTitle = searchParams.get("materialTitle") ?? "";
  const classTitle = searchParams.get("classTitle") ?? "";
  const [title, setTitle] = useState("");
  const [lessonOrder, setLessonOrder] = useState("1");
  const { mutateAsync, isPending, error } = useCreateLessonMutation();
  const { data: lessons, isLoading } = useGetLessonsQuery(
    materialId || undefined,
  );
  const handleGoToRecords = (lessonId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("menu", "records");
    params.set("lessonId", lessonId);
    router.push(`/teacher/dashboard_layout?${params.toString()}`);
  };
  const handleSubmit = async () => {
    if (!materialId || !title.trim()) return;
    const orderValue = Number(lessonOrder);
    if (!Number.isFinite(orderValue) || orderValue <= 0) return;

    await mutateAsync({
      title: title.trim(),
      lessonOrder: orderValue,
      materialId,
    });

    setTitle("");
    setLessonOrder("1");
  };
  const handleGoToLessonResources = (lessonId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("menu", "lessonResources");
    params.set("lessonId", lessonId);
    const selectedLesson = lessons?.find((item) => item.id === lessonId);
    if (selectedLesson?.title) {
      params.set("lessonTitle", selectedLesson.title);
    }
    if (classTitle) {
      params.set("classTitle", classTitle);
    }
    router.push(`/teacher/dashboard_layout?${params.toString()}`);
  };
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Quản lý buổi học
            </h1>
            <p className="text-sm text-slate-600">
              Thêm buổi học mới cho đề tài đã chọn.
            </p>
            <p className="text-sm font-medium text-slate-900">
              Lớp học: {classTitle || "Chưa chọn lớp"}
            </p>
            <p className="text-sm font-medium text-slate-900">
              Chủ đề: {materialTitle || materialId || "Chưa chọn chủ đề"}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Danh sách buổi học</CardTitle>
              <CardDescription>
                Theo dõi danh sách buổi học của đề tài.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!materialId ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Chọn tài liệu để xem danh sách buổi học.
                </div>
              ) : isLoading ? (
                <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
                  Đang tải danh sách buổi học...
                </div>
              ) : lessons && lessons.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow className="border-slate-200">
                        <TableHead className="w-28 text-center">
                          Tên buổi học
                        </TableHead>
                        <TableHead className="w-28 text-center">
                          Thứ tự
                        </TableHead>
                        <TableHead className="w-40 text-center">
                          Hành động
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson: LessonItem) => (
                        <TableRow
                          key={lesson.id}
                          className="border-slate-100 transition hover:bg-slate-50"
                        >
                          <TableCell className="font-semibold text-center    text-slate-900">
                            {lesson.title}
                          </TableCell>
                          <TableCell className="text-center text-slate-600">
                            {lesson.lessonOrder}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex justify-center gap-3">
                              <Button
                                onClick={() =>
                                  handleGoToLessonResources(lesson.id)
                                }
                                variant="outline"
                                size="sm"
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Eye className="h-4 w-4" />
                               Xem tài liệu
                              </Button>

                              <Button
                                onClick={() => handleGoToRecords(lesson.id)}
                                variant="secondary"
                                size="sm"
                                className="flex cursor-pointer items-center gap-2"
                              >
                                <Video className="h-4 w-4" />
                                Record
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  Chưa có buổi học nào.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Tạo buổi học</CardTitle>
              <CardDescription>
                Nhập tiêu đề và thứ tự hiển thị của buổi học.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Tên buổi học
                </label>
                <Input
                  placeholder="Ví dụ: Bài 1 - Giới thiệu"
                  className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Thứ tự buổi học
                </label>
                <Input
                  type="number"
                  min={1}
                  className="h-10 border-slate-200/70 bg-white text-slate-900"
                  value={lessonOrder}
                  onChange={(event) => setLessonOrder(event.target.value)}
                />
              </div>
              {error?.response?.data?.message ? (
                <p className="text-xs text-rose-600">
                  {error.response.data.message}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 bg-slate-50/70">
              <Button
                className="h-10 cursor-pointer rounded-xl bg-slate-900 px-5 text-white hover:bg-slate-800"
                onClick={handleSubmit}
                disabled={!materialId || !title.trim() || isPending}
              >
                {isPending ? "Đang lưu..." : "Lưu buổi học"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function LessonManagement() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-sm text-slate-500">
          Đang tải buổi học...
        </div>
      }
    >
      <LessonManagementContent />
    </Suspense>
  );
}
