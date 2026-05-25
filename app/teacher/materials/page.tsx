"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetClassesQuery } from "@/app/hooks/classes/useGetClasses";
import { useCreateMaterialMutation } from "@/app/hooks/materials/useCreateMaterial";
import { useGetMaterialsQuery } from "@/app/hooks/materials/useGetMaterials";
import type {
  MaterialItem,
  MaterialsFilter,
} from "@/app/service/material.service";
import type { Class } from "@/app/service/classroom.service";
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

type MaterialFormItem = {
  title: string;
  description: string;
};

type MaterialManagementProps = {
  classId?: string;
};

const MaterialManagement = ({ classId }: MaterialManagementProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const classLookupFilter = useMemo(
    () => ({ page: 0, size: 500, name: "", code: "" }),
    [],
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<MaterialFormItem[]>([]);
  const [materialsFilter, setMaterialsFilter] = useState<MaterialsFilter>({
    page: 0,
    size: 5,
  });
  const { mutateAsync, isPending, error } = useCreateMaterialMutation();
  const { data: classesResponse } = useGetClassesQuery(classLookupFilter);
  const {
    data: materialsResponse,
    isLoading: isMaterialsLoading,
    refetch: refetchMaterials,
  } = useGetMaterialsQuery(classId, materialsFilter);

  const materials = materialsResponse?.content ?? [];
  const totalPages = materialsResponse?.page?.totalPages ?? 0;
  const currentPage = materialsResponse?.page?.number ?? materialsFilter.page;
  const isLastPage = totalPages
    ? currentPage >= totalPages - 1
    : materials.length < materialsFilter.size;
  const className = useMemo(() => {
    if (!classId) return "";

    const classes = classesResponse?.items ?? [];
    const matchedClass = classes.find((item: Class) => item.id === classId);
    return matchedClass?.name ?? "";
  }, [classId, classesResponse?.items]);

  const canSubmit = useMemo(() => {
    if (!classId) return false;
    if (isPending) return false;
    return items.length > 0;
  }, [classId, isPending, items.length]);

  const handleAddItem = () => {
    if (!title.trim()) return;
    setItems((prev) => [
      ...prev,
      { title: title.trim(), description: description.trim() },
    ]);
    setTitle("");
    setDescription("");
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSubmit = async () => {
    if (!classId || items.length === 0) return;
    await mutateAsync({
      classroomId: classId,
      materials: items.map((item) => ({
        title: item.title,
        description: item.description || undefined,
      })),
    });
    setItems([]);
    await refetchMaterials();
  };

  const handleGoToSessions = (materialId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("menu", "lessons");
    params.set("materialId", materialId);
    params.delete("lessonId");
    params.delete("lessonTitle");
    const selectedMaterial = materials.find((item) => item.id === materialId);
    if (selectedMaterial?.title) {
      params.set("materialTitle", selectedMaterial.title);
    }
    if (className) {
      params.set("classTitle", className);
    }
    if (classId) params.set("classId", classId);
    router.push(`/teacher/dashboard_layout?${params.toString()}`);
  };

  const handlePageChange = (nextPage: number) => {
    setMaterialsFilter((prev) => ({
      ...prev,
      page: nextPage,
    }));
  };

  useEffect(() => {
    setMaterialsFilter((prev) => ({
      ...prev,
      page: 0,
    }));
  }, [classId]);

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Quản lý chủ đề    
            </h1>
            <p className="text-sm text-slate-600">
              Thêm đề tài cho lớp học đã chọn.
            </p>
            <p className="text-sm font-medium text-slate-900">
              Lớp học: {className || classId || "Chưa chọn lớp"}
            </p>
          </div>

        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            
            <CardContent className="space-y-3">
              <div className="space-y-1 w-[80%]">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Danh sách sẽ thêm
                </p>
                <div className="max-h-36 space-y-2 overflow-y-auto pr-1">
                  {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                      Chưa có tài liệu nào trong danh sách.
                    </div>
                  ) : (
                    items.map((item, index) => (
                      <div
                        key={`${item.title}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.description || "Không có mô tả"}
                          </p>
                        </div>
                        <Button
                          className="h-7 cursor-pointer rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-100"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Gỡ bỏ đề tài
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex w-[40%] items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-1.5">
                <span className="text-[11px] text-slate-500">
                  Tổng số: {items.length}
                </span>
                <Button
                  className="h-8 rounded-md cursor-pointer bg-slate-900 px-3 text-xs text-white hover:bg-slate-800"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isPending ? "Đang lưu..." : "Lưu"}
                </Button>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Đề tài hiện có
                </p>
                {!classId ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                    Chọn lớp để xem danh sách chủ đề.
                  </div>
                ) : isMaterialsLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    Đang tải chủ đề...
                  </div>
                ) : materials.length > 0 ? (
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="border-slate-200">
                            <TableHead className="w-55">Chủ đề học</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-20 text-center">
                              Số buổi học
                            </TableHead>
                            <TableHead className="w-40 text-center">
                              Hành động
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {materials.map((material: MaterialItem) => (
                            <TableRow
                              key={material.id}
                              className="border-slate-100 transition hover:bg-slate-50"
                            >
                              <TableCell className="font-semibold text-slate-900">
                                {material.title}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {material.description || "Không có mô tả"}
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-xs font-semibold text-slate-600">
                                  {material.totalLessons ?? 0}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className="h-7 cursor-pointer rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700 hover:bg-slate-100"
                                  type="button"
                                  onClick={() => handleGoToSessions(material.id)}
                                >
                                  Xem tài liệu từng buổi
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
                      <span>
                        Trang {currentPage + 1}
                        {totalPages ? ` / ${totalPages}` : ""}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                          onClick={() =>
                            handlePageChange(Math.max(0, currentPage - 1))
                          }
                          disabled={currentPage <= 0}
                        >
                          Trước
                        </Button>
                        <Button
                          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                          onClick={() =>
                            handlePageChange(
                              Math.min(totalPages - 1, currentPage + 1),
                            )
                          }
                          disabled={isLastPage}
                        >
                          Sau
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm text-slate-500">
                    Chưa có tài liệu nào cho lớp này.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Thêm chủ đề</CardTitle>
              <CardDescription>
                Điền tên chủ đề và mô tả ngắn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Tên chủ đề
                </label>
                <Input
                  placeholder="Ví dụ: Bộ bài tập chương 1"
                  className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Mô tả chủ đề
                </label>
                <textarea
                  className="min-h-30 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300/70 focus-visible:border-slate-300 focus-visible:outline-none"
                  placeholder="Mục tiêu, yêu cầu hoặc ghi chú cho học viên..."
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              {error?.response?.data?.message ? (
                <p className="text-xs text-rose-600">
                  {error.response.data.message}
                </p>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                className="h-10 w-full cursor-pointer rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                onClick={handleAddItem}
                disabled={!title.trim()}
              >
                Thêm vào danh sách
              </Button>
              <Button
                className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                onClick={() => {
                  setTitle("");
                  setDescription("");
                }}
              >
                Xóa nhập liệu
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaterialManagement;
