"use client";

import { Suspense, useEffect, useState, type UIEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetClassesQuery } from "@/app/hooks/classes/useGetClasses";
import { useDeleteClassroomMaterials } from "@/app/hooks/classroom-materials/useDeleteClassroomMaterials";
import { useUpdateClassroomMaterials } from "@/app/hooks/classroom-materials/useUpdateClassroomMaterials";
import { useAssignMaterialsToClassroom } from "@/app/hooks/materials/useAssignMaterialsToClassroom";
import { useDeleteMaterialMutation } from "@/app/hooks/materials/useDeleteMaterial";
import { useCreateNewMaterialMutation } from "@/app/hooks/materials/useCreateNewMaterial";
import { useGetALLMaterialsQuery } from "@/app/hooks/materials/useGetAllMaterials";
import { useGetMaterialsQuery } from "@/app/hooks/materials/useGetMaterialsByClassroomID";
import { useUpdateMaterialMutation } from "@/app/hooks/materials/useUpdateMaterial";
import type {
  Class,
  GetAllClassesFilter,
} from "@/app/service/classroom.service";
import type {
  AllMaterialsFilter,
  ClassroomMaterialItem,
  Item,
} from "@/app/service/material.service";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
type MaterialManagementProps = {
  classId?: string;
};

const MaterialManagementContent = ({ classId }: MaterialManagementProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [assignMessage, setAssignMessage] = useState("");
  const [selectedDescription, setSelectedDescription] = useState<string | null>(
    null,
  );
  const [isEditClassroomMaterialOpen, setIsEditClassroomMaterialOpen] =
    useState(false);
  const [editingClassroomMaterialId, setEditingClassroomMaterialId] = useState<
    string | null
  >(null);
  const [editingDisplayOrder, setEditingDisplayOrder] = useState<number>(1);
  const [isDeleteClassroomMaterialOpen, setIsDeleteClassroomMaterialOpen] =
    useState(false);
  const [deletingClassroomMaterialId, setDeletingClassroomMaterialId] =
    useState<string | null>(null);
  const [isDeleteMaterialOpen, setIsDeleteMaterialOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<Item | null>(null);
  const [isEditMaterialOpen, setIsEditMaterialOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Item | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [selectedMaterials, setSelectedMaterials] = useState<
    Record<string, Item>
  >({});
  const [orderById, setOrderById] = useState<Record<string, number>>({});
  const [classFilter, setClassFilter] = useState<GetAllClassesFilter>({
    page: 0,
    size: 8,
    code: "",
    name: "",
  });
  const [classOptions, setClassOptions] = useState<Class[]>([]);
  const [materialsFilter, setMaterialsFilter] = useState<AllMaterialsFilter>({
    page: 0,
    size: 5,
    title: "",
  });
  const {
    data: classResponse,
    isLoading: isClassesLoading,
    refetch: refetchClasses,
  } = useGetClassesQuery(classFilter);
  const {
    mutateAsync: assignMaterials,
    isPending: isAssigning,
    error: assignError,
    reset: resetAssignError,
  } = useAssignMaterialsToClassroom();
  const {
    mutateAsync,
    isPending,
    error,
    reset: resetCreateError,
  } = useCreateNewMaterialMutation();
  const {
    mutateAsync: updateClassroomMaterial,
    isPending: isUpdatingClassroomMaterial,
    error: updateClassroomMaterialError,
    reset: resetUpdateClassroomMaterialError,
  } = useUpdateClassroomMaterials();
  const {
    mutateAsync: deleteClassroomMaterial,
    isPending: isDeletingClassroomMaterial,
  } = useDeleteClassroomMaterials();
  const {
    mutateAsync: deleteMaterial,
    isPending: isDeletingMaterial,
    error: deleteMaterialError,
    reset: resetDeleteMaterialError,
  } = useDeleteMaterialMutation();
  const {
    mutateAsync: updateMaterial,
    isPending: isUpdatingMaterial,
    error: updateMaterialError,
    reset: resetUpdateMaterialError,
  } = useUpdateMaterialMutation();
  const {
    data: materialsResponse,
    isLoading: isMaterialsLoading,
    refetch: refetchMaterials,
  } = useGetALLMaterialsQuery(materialsFilter);
  const {
    data: classMaterialsResponse,
    isLoading: isClassMaterialsLoading,
    refetch: refetchClassMaterials,
  } = useGetMaterialsQuery(selectedClassId);

  const materials = materialsResponse?.items ?? [];
  const classMaterials = classMaterialsResponse?.materials ?? [];
  const totalPages = materialsResponse?.totalPages ?? 0;
  const currentPage = materialsResponse?.page ?? materialsFilter.page;
  const isLastPage = totalPages
    ? currentPage >= totalPages - 1
    : materials.length < materialsFilter.size;
  const isAllSelected =
    materials.length > 0 &&
    materials.every((item) => selectedMaterialIds.includes(item.id));
  const canAssign =
    selectedClassId && selectedMaterialIds.length > 0 && !isAssigning;
  const hasMoreClasses = classResponse
    ? classFilter.page < classResponse.totalPages - 1
    : false;

  const handleAddItem = async () => {
    if (!title.trim() || isPending) return;
    await mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
    });
    setTitle("");
    setDescription("");
    await refetchMaterials();
  };

  const handleToggleMaterial = (materialId: string) => {
    const material = materials.find((item) => item.id === materialId);
    setSelectedMaterialIds((prev) => {
      const isSelected = prev.includes(materialId);
      if (isSelected) {
        setSelectedMaterials((materialsPrev) => {
          const next = { ...materialsPrev };
          delete next[materialId];
          return next;
        });
        setOrderById((ordersPrev) => {
          const next = { ...ordersPrev };
          delete next[materialId];
          return next;
        });
        return prev.filter((id) => id !== materialId);
      }
      if (material) {
        setSelectedMaterials((materialsPrev) => ({
          ...materialsPrev,
          [materialId]: material,
        }));
      }
      setOrderById((ordersPrev) => {
        if (ordersPrev[materialId] != null) return ordersPrev;
        return {
          ...ordersPrev,
          [materialId]: Object.keys(ordersPrev).length + 1,
        };
      });
      return [...prev, materialId];
    });
  };

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const pageIds = materials.map((item) => item.id);
      setSelectedMaterialIds((prev) =>
        Array.from(new Set([...prev, ...pageIds])),
      );
      setSelectedMaterials((prev) => {
        const next = { ...prev };
        materials.forEach((item) => {
          next[item.id] = item;
        });
        return next;
      });
      setOrderById((prev) => {
        const next = { ...prev };
        materials.forEach((item, index) => {
          if (next[item.id] != null) return;
          next[item.id] = Object.keys(next).length + index + 1;
        });
        return next;
      });
      return;
    }
    setSelectedMaterialIds((prev) =>
      prev.filter((id) => !materials.some((item) => item.id === id)),
    );
    setSelectedMaterials((prev) => {
      const next = { ...prev };
      materials.forEach((item) => {
        delete next[item.id];
      });
      return next;
    });
    setOrderById((prev) => {
      const next = { ...prev };
      materials.forEach((item) => {
        delete next[item.id];
      });
      return next;
    });
  };

  const handleEditClassroomMaterial = (classroomMaterialId: string) => {
    const selected = classMaterials.find(
      (item) => item.id === classroomMaterialId,
    );
    setEditingClassroomMaterialId(classroomMaterialId);
    setEditingDisplayOrder(selected?.materialOrder ?? 1);
    resetUpdateClassroomMaterialError();
    setIsEditClassroomMaterialOpen(true);
  };

  const handleConfirmUpdateClassroomMaterial = async () => {
    if (!editingClassroomMaterialId) return;
    await updateClassroomMaterial({
      classroomMaterialId: editingClassroomMaterialId,
      displayOrder: editingDisplayOrder,
    });
    setIsEditClassroomMaterialOpen(false);
    setEditingClassroomMaterialId(null);
    await refetchClassMaterials();
  };

  const handleDeleteClassroomMaterial = (classroomMaterialId: string) => {
    if (!classroomMaterialId) return;
    setDeletingClassroomMaterialId(classroomMaterialId);
    setIsDeleteClassroomMaterialOpen(true);
  };

  const handleConfirmDeleteClassroomMaterial = async () => {
    if (!deletingClassroomMaterialId || isDeletingClassroomMaterial) return;
    await deleteClassroomMaterial({
      classroomMaterialId: deletingClassroomMaterialId,
    });
    setIsDeleteClassroomMaterialOpen(false);
    setDeletingClassroomMaterialId(null);
    await refetchClassMaterials();
  };

  const handleDelete = (material: Item) => {
    setDeletingMaterial(material);
    resetDeleteMaterialError();
    setIsDeleteMaterialOpen(true);
  };

  const handleConfirmDeleteMaterial = async () => {
    if (!deletingMaterial || isDeletingMaterial) return;
    await deleteMaterial({ materialId: deletingMaterial.id });
    setIsDeleteMaterialOpen(false);
    setDeletingMaterial(null);
    await refetchMaterials();
  };

  const handleEdit = (material: Item) => {
    setEditingMaterial(material);
    setEditingTitle(material.title || "");
    setEditingDescription(material.description || "");
    resetUpdateMaterialError();
    setIsEditMaterialOpen(true);
  };

  const handleConfirmUpdateMaterial = async () => {
    if (!editingMaterial || isUpdatingMaterial) return;
    await updateMaterial({
      materialId: editingMaterial.id,
      title: editingTitle.trim(),
      description: editingDescription.trim() || undefined,
    });
    setIsEditMaterialOpen(false);
    setEditingMaterial(null);
    await refetchMaterials();
  };

  const handleAssignMaterials = () => {
    if (!canAssign) return;
    setAssignMessage("");
    setOrderById((prev) => {
      const next = { ...prev };
      selectedMaterialIds.forEach((id, index) => {
        if (next[id] == null) {
          next[id] = index + 1;
        }
      });
      return next;
    });
    setIsOrderDialogOpen(true);
  };

  const handleConfirmAssign = async () => {
    if (!canAssign) return;
    const materialOrders = selectedMaterialIds.map((materialId, index) => {
      const rawOrder = orderById[materialId];
      const order =
        Number.isFinite(rawOrder) && rawOrder > 0 ? rawOrder : index + 1;
      return {
        materialId,
        order,
      };
    });
    const response = await assignMaterials({
      classroomId: selectedClassId,
      materialOrders,
    });
    const className =
      classOptions.find((item) => item.id === selectedClassId)?.name || "lớp";
    setAssignMessage(
      response?.message ||
        `Đã chọn ${selectedMaterialIds.length} đề tài cho ${className}.`,
    );
    setIsOrderDialogOpen(false);
    await refetchClassMaterials();
  };

  const handleClassScroll = (event: UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 16;
    if (!isBottom || isClassesLoading || !hasMoreClasses) return;
    setClassFilter((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  const handleGoToSessions = (materialId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("menu", "lessons");
    params.set("materialId", materialId);
    params.delete("lessonId");
    params.delete("lessonTitle");
    const selectedMaterial =
      classMaterials.find((item) => item.id === materialId) ||
      materials.find((item) => item.id === materialId);
    if (selectedMaterial?.title) {
      params.set("materialTitle", selectedMaterial.title);
    }
    const className = classOptions.find(
      (item) => item.id === selectedClassId,
    )?.name;
    if (className) {
      params.set("classTitle", className);
    }
    if (selectedClassId) params.set("classId", selectedClassId);
    router.push(`/admin/dashboard_layout?${params.toString()}`);
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
  }, [searchTitle]);
  useEffect(() => {
    if (!classResponse?.items?.length) return;
    setClassOptions((prev) => {
      if (classFilter.page === 0) return classResponse.items;
      const seen = new Set(prev.map((item) => item.id));
      const nextItems = classResponse.items.filter(
        (item) => !seen.has(item.id),
      );
      return [...prev, ...nextItems];
    });
  }, [classResponse, classFilter.page]);
  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-slate-900">
              Quản lý chủ đề
            </h1>
            <p className="text-sm text-slate-600">
              Thêm đề tài cho các lớp học.
            </p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardContent className="space-y-3">
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Đề tài hiện có
                </p>
                <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      {/* Left */}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Select */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-slate-700">
                            Chọn lớp học
                          </label>
                          <Select
                            value={selectedClassId}
                            onValueChange={(value) => {
                              setSelectedClassId(value);
                              setAssignMessage("");
                              setSelectedMaterialIds([]);
                              setSelectedMaterials({});
                              setOrderById({});
                              resetAssignError();
                            }}
                            onOpenChange={(open) => {
                              if (!open) return;
                              setClassFilter((prev) => ({
                                ...prev,
                                page: 0,
                              }));
                              if (classResponse?.items?.length) {
                                setClassOptions(classResponse.items);
                                return;
                              }
                              refetchClasses();
                            }}
                          >
                            <SelectTrigger className="h-11 cursor-pointer min-w-[280px] rounded-xl border-slate-200 bg-slate-50 px-4 shadow-sm transition focus:ring-2 focus:ring-slate-300">
                              <SelectValue placeholder="Chọn lớp học" />
                            </SelectTrigger>

                            <SelectContent
                              position="popper"
                              className="w-full rounded-xl p-0"
                            >
                              <ScrollArea
                                className="h-[180px]"
                                viewportClassName="h-[180px] overflow-y-auto"
                                onViewportScroll={handleClassScroll}
                              >
                                {classOptions.map((item) => (
                                  <SelectItem
                                    className="cursor-pointer"
                                    key={item.id}
                                    value={item.id}
                                  >
                                    {item.name}
                                  </SelectItem>
                                ))}
                                {isClassesLoading ? (
                                  <div className="px-3 py-2 text-xs text-slate-500">
                                    Đang tải thêm...
                                  </div>
                                ) : null}
                                {!isClassesLoading && !hasMoreClasses ? (
                                  <div className="px-3 py-2 text-xs text-slate-400">
                                    Đã tải hết lớp.
                                  </div>
                                ) : null}
                              </ScrollArea>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Button */}
                        <Button
                          onClick={handleAssignMaterials}
                          disabled={!canAssign}
                          className="mt-[28px] cursor-pointer h-7 rounded-xl bg-slate-900 px-6 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50"
                        >
                          {isAssigning ? "Đang gán..." : "Gán đề tài"}
                        </Button>
                      </div>

                      {/* Counter */}
                      <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2">
                        <span className="text-sm text-slate-600">Đã chọn</span>

                        <div className="flex h-7 min-w-[32px] items-center justify-center rounded-full bg-slate-900 px-2 text-sm font-semibold text-white">
                          {selectedMaterialIds.length}
                        </div>
                      </div>
                    </div>
                  </div>
              
                </div>
                <Dialog
                  open={isOrderDialogOpen}
                  onOpenChange={(open) => {
                    setIsOrderDialogOpen(open);
                    if (!open) resetAssignError();
                  }}
                >
                  <DialogContent
                      withOverlay
                    className="max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)]"
                  >
                    <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="space-y-1">
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            Chọn thứ tự đề tài
                          </DialogTitle>
                          <p className="text-sm text-slate-500">
                            Nhập thứ tự hiển thị cho từng đề tài trước khi gán.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto px-6 py-6">
                      <div className="space-y-3">
                        {selectedMaterialIds.map((materialId) => {
                          const material =
                            selectedMaterials[materialId] ||
                            materials.find((item) => item.id === materialId);
                          if (!material) return null;
                          return (
                            <div
                              key={materialId}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3"
                            >
                              <div className="min-w-[200px] flex-1">
                                <p className="text-sm font-semibold text-slate-900">
                                  {material.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {material.description || "Không có mô tả"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500">
                                  Thứ tự
                                </span>
                                <Input
                                  type="number"
                                  min={1}
                                  className="h-9 w-24 border-slate-200/70 bg-white text-slate-900"
                                  value={orderById[materialId] ?? ""}
                                  onChange={(event) => {
                                    const nextValue = Number(
                                      event.target.value,
                                    );
                                    setOrderById((prev) => ({
                                      ...prev,
                                      [materialId]: Number.isNaN(nextValue)
                                        ? 1
                                        : nextValue,
                                    }));
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 px-6 py-4">
                      {assignError?.response?.data?.message ? (
                        <p className="mr-auto text-xs text-rose-600">
                          {assignError.response.data.message}
                        </p>
                      ) : null}
                      <Button
                        variant="outline"
                        className="cursor-pointer border-slate-200"
                        onClick={() => setIsOrderDialogOpen(false)}
                        type="button"
                      >
                        Huỷ
                      </Button>
                      <Button
                        className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                        onClick={handleConfirmAssign}
                        disabled={!canAssign}
                        type="button"
                      >
                        {isAssigning ? "Đang gán..." : "Xác nhận gán"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isEditClassroomMaterialOpen}
                  onOpenChange={(open) => {
                    setIsEditClassroomMaterialOpen(open);
                    if (!open) {
                      setEditingClassroomMaterialId(null);
                      resetUpdateClassroomMaterialError();
                    }
                  }}
                >
                  <DialogContent
                      withOverlay
                    className="max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)]"
                  >
                    <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="space-y-1">
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            Chỉnh sửa thứ tự
                          </DialogTitle>
                          <p className="text-sm text-slate-500">
                            Cập nhật thứ tự hiển thị cho đề tài của lớp.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      <div className="grid gap-2">
                        <label className="text-xs font-medium text-slate-600">
                          Thứ tự hiển thị
                        </label>
                        <Input
                          type="number"
                          min={1}
                          className="h-10 border-slate-200/70 bg-white text-slate-900"
                          value={editingDisplayOrder}
                          onChange={(event) => {
                            const nextValue = Number(event.target.value);
                            setEditingDisplayOrder(
                              Number.isNaN(nextValue) ? 1 : nextValue,
                            );
                          }}
                        />
                        {updateClassroomMaterialError?.response?.data
                          ?.message ? (
                          <p className="text-xs text-rose-600">
                            {updateClassroomMaterialError.response.data.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 px-6 py-4">
                      <Button
                        variant="outline"
                        className="cursor-pointer border-slate-200"
                        onClick={() => setIsEditClassroomMaterialOpen(false)}
                        type="button"
                      >
                        Huỷ
                      </Button>
                      <Button
                        className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                        onClick={handleConfirmUpdateClassroomMaterial}
                        disabled={isUpdatingClassroomMaterial}
                        type="button"
                      >
                        {isUpdatingClassroomMaterial
                          ? "Đang lưu..."
                          : "Lưu thay đổi"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isDeleteClassroomMaterialOpen}
                  onOpenChange={(open) => {
                    setIsDeleteClassroomMaterialOpen(open);
                    if (!open) setDeletingClassroomMaterialId(null);
                  }}
                >
                  <DialogContent
                      withOverlay
                    className="max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)]"
                  >
                    <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
                          <Trash2 className="h-5 w-5" />
                        </div>

                        <div className="space-y-1">
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            Xóa đề tài khỏi lớp
                          </DialogTitle>
                          <p className="text-sm text-slate-500">
                            Hành động này không thể hoàn tác.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6 text-sm text-slate-600">
                      Bạn chắc chắn muốn xóa đề tài này khỏi lớp?
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 px-6 py-4">
                      <Button
                        variant="outline"
                        className="cursor-pointer border-slate-200"
                        onClick={() => setIsDeleteClassroomMaterialOpen(false)}
                        type="button"
                      >
                        Huỷ
                      </Button>
                      <Button
                        className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
                        onClick={handleConfirmDeleteClassroomMaterial}
                        disabled={isDeletingClassroomMaterial}
                        type="button"
                      >
                        {isDeletingClassroomMaterial ? "Đang xóa..." : "Xóa"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isDeleteMaterialOpen}
                  onOpenChange={(open) => {
                    setIsDeleteMaterialOpen(open);
                    if (!open) setDeletingMaterial(null);
                  }}
                >
                  <DialogContent
                      withOverlay
                    className="max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)]"
                  >
                    <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-sm">
                          <Trash2 className="h-5 w-5" />
                        </div>

                        <div className="space-y-1">
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            Xóa đề tài
                          </DialogTitle>
                          <p className="text-sm text-slate-500">
                            Hành động này không thể hoàn tác.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6 text-sm text-slate-600">
                      Bạn chắc chắn muốn xóa đề tài
                      {deletingMaterial?.title
                        ? ` "${deletingMaterial.title}"`
                        : " này"}
                      ?
                      {deleteMaterialError?.response?.data?.message ? (
                        <p className="mt-2 text-xs text-rose-600">
                          {deleteMaterialError.response.data.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 px-6 py-4">
                      <Button
                        variant="outline"
                        className="cursor-pointer border-slate-200"
                        onClick={() => setIsDeleteMaterialOpen(false)}
                        type="button"
                      >
                        Huỷ
                      </Button>
                      <Button
                        className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
                        onClick={handleConfirmDeleteMaterial}
                        disabled={isDeletingMaterial}
                        type="button"
                      >
                        {isDeletingMaterial ? "Đang xóa..." : "Xóa"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Dialog
                  open={isEditMaterialOpen}
                  onOpenChange={(open) => {
                    setIsEditMaterialOpen(open);
                    if (!open) setEditingMaterial(null);
                  }}
                >
                  <DialogContent
                      withOverlay
                    className="max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)]"
                  >
                    <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                          <Pencil className="h-5 w-5" />
                        </div>

                        <div className="space-y-1">
                          <DialogTitle className="text-lg font-semibold text-slate-900">
                            Cập nhật đề tài
                          </DialogTitle>
                          <p className="text-sm text-slate-500">
                            Chỉnh sửa tiêu đề và mô tả cho đề tài.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-6">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <label className="text-xs font-medium text-slate-600">
                            Tiêu đề
                          </label>
                          <Input
                            className="h-10 border-slate-200/70 bg-white text-slate-900"
                            value={editingTitle}
                            onChange={(event) =>
                              setEditingTitle(event.target.value)
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <label className="text-xs font-medium text-slate-600">
                            Mô tả
                          </label>
                          <textarea
                            className="min-h-24 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-300/70 focus-visible:border-slate-300 focus-visible:outline-none"
                            value={editingDescription}
                            onChange={(event) =>
                              setEditingDescription(event.target.value)
                            }
                          />
                        </div>
                        {updateMaterialError?.response?.data?.message ? (
                          <p className="text-xs text-rose-600">
                            {updateMaterialError.response.data.message}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 px-6 py-4">
                      <Button
                        variant="outline"
                        className="cursor-pointer border-slate-200"
                        onClick={() => setIsEditMaterialOpen(false)}
                        type="button"
                      >
                        Huỷ
                      </Button>
                      <Button
                        className="cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                        onClick={handleConfirmUpdateMaterial}
                        disabled={
                          isUpdatingMaterial || !editingTitle.trim()
                        }
                        type="button"
                      >
                        {isUpdatingMaterial ? "Đang lưu..." : "Lưu"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-700">
                      Chủ đề của lớp đã chọn
                    </div>
                    {selectedClassId ? (
                      <span className="text-xs text-slate-500">
                        Tổng: {classMaterials.length}
                      </span>
                    ) : null}
                  </div>
                  {!selectedClassId ? (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                      Chọn lớp để xem danh sách chủ đề đã gán.
                    </div>
                  ) : isClassMaterialsLoading ? (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                      Đang tải chủ đề của lớp...
                    </div>
                  ) : classMaterials.length > 0 ? (
                    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/70 bg-white">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="border-slate-200">
                            <TableHead className="w-55">Chủ đề</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-24 text-center">
                              Thứ tự học
                            </TableHead>
                            <TableHead className="w-32 text-center">
                              Hành động
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classMaterials.map((material: ClassroomMaterialItem) => (
                            <TableRow
                              key={material.id}
                              className="border-slate-100"
                            >
                              <TableCell className="font-semibold text-slate-900">
                                {material.title}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {material.description || "Không có mô tả"}
                              </TableCell>
                              <TableCell className="text-center text-slate-600">
                                {material.materialOrder ?? 0}
                              </TableCell>
                              {/* ACTION */}
                              <TableCell>
                                <div className="flex justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-100"
                                      >
                                        <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                      </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent
                                      align="end"
                                      className="w-44 rounded-xl border-slate-200 shadow-xl"
                                    >
                                      <DropdownMenuLabel>
                                        Hành động
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleEditClassroomMaterial(
                                            material.id,
                                          )
                                        }
                                        className="cursor-pointer"
                                      >
                                        <Pencil className="mr-2 h-4 w-4 text-blue-500" />
                                        Chỉnh sửa
                                      </DropdownMenuItem>

                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDeleteClassroomMaterial(
                                            material.id,
                                          )
                                        }
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Xóa đề tài
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-slate-500">
                      Lớp này chưa có chủ đề nào.
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3">
                  <div className="text-sm font-medium text-slate-700">
                    Tìm theo tiêu đề
                  </div>
                  <Input
                    placeholder="Nhập tiêu đề cần tìm"
                    className="h-9 w-full max-w-xs border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70"
                    value={searchTitle}
                    onChange={(event) => {
                      resetAssignError();
                      const nextTitle = event.target.value;
                      setSearchTitle(nextTitle);
                      setMaterialsFilter((prev) => ({
                        ...prev,
                        title: nextTitle,
                      }));
                    }}
                  />
                </div>
                {isMaterialsLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
                    Đang tải chủ đề...
                  </div>
                ) : materials.length > 0 ? (
                  <div className="space-y-2">
                    <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white">
                      <Table>
                        <TableHeader className="bg-slate-50">
                          <TableRow className="border-slate-200">
                            <TableHead className="w-12 text-center">
                              <input
                                type="checkbox"
                                aria-label="Chon tat ca"
                                className="size-4 cursor-pointer accent-slate-900"
                                checked={isAllSelected}
                                onChange={(event) =>
                                  handleToggleAll(event.target.checked)
                                }
                              />
                            </TableHead>
                            <TableHead className="w-55">Chủ đề học</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead>Ngày tạo</TableHead>
                            <TableHead>Ngày cập nhật</TableHead>

                            <TableHead className="w-40 text-center">
                              Hành động
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {materials.map((material: Item) => (
                            <TableRow
                              key={material.id}
                              className="border-slate-100 transition hover:bg-slate-50"
                            >
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  aria-label={`Chon ${material.title}`}
                                  className="size-4 cursor-pointer accent-slate-900"
                                  checked={selectedMaterialIds.includes(
                                    material.id,
                                  )}
                                  onChange={() =>
                                    handleToggleMaterial(material.id)
                                  }
                                />
                              </TableCell>
                              <TableCell className="font-semibold text-slate-900">
                                {material.title}
                              </TableCell>
                              <TableCell className="text-slate-600 max-w-[250px]">
                                {material.description ? (
                                  <button
                                    onClick={() =>
                                      setSelectedDescription(
                                        material.description,
                                      )
                                    }
                                    className="truncate text-left w-full hover:text-blue-600 cursor-pointer"
                                  >
                                    {material.description}
                                  </button>
                                ) : (
                                  "Không có mô tả"
                                )}
                              </TableCell>
                              <Dialog
                                open={!!selectedDescription}
                                onOpenChange={() =>
                                  setSelectedDescription(null)
                                }
                              >
                                <DialogContent
                                  withOverlay={false}
                                  className="max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.65)]"
                                >
                                  <div className="border-b border-slate-200/70 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                                        <FileText className="h-5 w-5" />
                                      </div>

                                      <div className="space-y-1">
                                        <DialogTitle className="text-lg font-semibold text-slate-900">
                                          Mô tả đề tài
                                        </DialogTitle>
                                        <p className="text-sm text-slate-500">
                                          Chi tiết nội dung của đề tài học tập
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="max-h-[420px] overflow-y-auto px-6 py-6">
                                    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 p-5">
                                      <p className="whitespace-pre-wrap break-words text-[15px] leading-7 text-slate-700">
                                        {selectedDescription ||
                                          "Không có mô tả"}
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <TableCell className="text-slate-600">
                                {material.createdAt}
                              </TableCell>
                              <TableCell className="text-slate-600">
                                {material.updatedAt}
                              </TableCell>

                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {/* Edit */}
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleEdit(material)}
                                    className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>

                                  {/* Delete */}
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleDelete(material)}
                                    className="h-8 w-8 cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>

                                  {/* Primary action */}
                                  <Button
                                    type="button"
                                    onClick={() =>
                                      handleGoToSessions(material.id)
                                    }
                                    className="h-8 rounded-lg cursor-pointer bg-slate-900 px-3 text-xs text-white hover:bg-slate-800"
                                  >
                                    Các buổi học
                                  </Button>
                                </div>
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
                          className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
                          onClick={() =>
                            handlePageChange(Math.max(0, currentPage - 1))
                          }
                          disabled={currentPage <= 0}
                        >
                          Trước
                        </Button>
                        <Button
                          className="h-9 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-slate-700 hover:bg-slate-100"
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
                    Chưa có chủ đề phù hợp.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Thêm chủ đề</CardTitle>
              <CardDescription>Điền tên chủ đề và mô tả ngắn.</CardDescription>
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
                  onChange={(event) => {
                    resetCreateError();
                    setTitle(event.target.value);
                  }}
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
                  onChange={(event) => {
                    resetCreateError();
                    setDescription(event.target.value);
                  }}
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
                disabled={!title.trim() || isPending}
              >
                {isPending ? "Đang thêm..." : "Thêm chủ đề"}
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

export default function MaterialManagement(props: MaterialManagementProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-sm text-slate-500">
          Đang tải chủ đề...
        </div>
      }
    >
      <MaterialManagementContent {...props} />
    </Suspense>
  );
}
