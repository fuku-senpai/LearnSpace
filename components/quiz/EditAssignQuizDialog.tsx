"use client";

import { useState } from "react";
import { ClipboardList, Loader2, Pencil } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { useUpdateAssignQuizMutation } from "@/app/hooks/lessonQuiz/useUpdateAssignQuiz";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EditAssignQuizContext = {
  snapLessonQuizId: string;
  snapLessonId: string;
  lessonTitle: string;
  lessonQuizId: string;
  quizTitle: string;
  required: boolean;
  maxAttempts: number;
  displayOrder: number;
  classroomId?: string;
};

type EditAssignQuizDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: EditAssignQuizContext | null;
  onSuccess?: () => void;
};

export function EditAssignQuizDialog({
  open,
  onOpenChange,
  context,
  onSuccess,
}: EditAssignQuizDialogProps) {
  const closeDialog = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 p-0 sm:max-w-md">
        <div className="border-b border-slate-200 bg-linear-to-r from-sky-50/80 via-white to-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white">
              <Pencil className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Chỉnh sửa bài tập
              </DialogTitle>
              <DialogDescription className="mt-0.5 truncate text-sm text-slate-500">
                Buổi học: {context?.lessonTitle ?? ""}
              </DialogDescription>
            </div>
          </div>
        </div>

        {context ? (
          <EditAssignQuizForm
            key={context.snapLessonQuizId}
            context={context}
            onClose={closeDialog}
            onSuccess={onSuccess}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function EditAssignQuizForm({
  context,
  onClose,
  onSuccess,
}: {
  context: EditAssignQuizContext;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [required, setRequired] = useState<"true" | "false">(
    context.required ? "true" : "false",
  );
  const [maxAttempts, setMaxAttempts] = useState(String(context.maxAttempts));
  const [displayOrder, setDisplayOrder] = useState(String(context.displayOrder));

  const { mutateAsync: updateAssignQuiz, isPending } =
    useUpdateAssignQuizMutation();

  const handleSubmit = async () => {

    const attempts = Number(maxAttempts);
    const order = Number(displayOrder);

    if (!Number.isFinite(attempts) || attempts <= 0) {
      toast.error("Số lần làm phải lớn hơn 0");
      return;
    }
    if (!Number.isFinite(order) || order <= 0) {
      toast.error("Thứ tự hiển thị phải lớn hơn 0");
      return;
    }

    try {
      const response = await updateAssignQuiz({
        snapLessonQuizId: context.snapLessonQuizId,
        snapLessonId: context.snapLessonId,
        classroomId: context.classroomId,
        lessonQuizId: context.lessonQuizId,
        required: required === "true",
        maxAttempts: attempts,
        displayOrder: order,
      });
      toast.success(response.message || "Cập nhật bài tập thành công");
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof AxiosError &&
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Cập nhật bài tập thất bại";
      toast.error(message);
    }
  };

  return (
    <>
        <div className="space-y-5 overflow-y-auto px-6 py-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                <ClipboardList className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">Đề đang gắn</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900">
                  {context.quizTitle}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-slate-600">
                Bắt buộc
              </label>
              <Select
                value={required}
                onValueChange={(value) =>
                  setRequired(value as "true" | "false")
                }
              >
                <SelectTrigger className="h-10 cursor-pointer rounded-xl bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Bắt buộc</SelectItem>
                  <SelectItem value="false">Tùy chọn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium text-slate-600">
                Số lần làm
              </label>
              <Input
                className="h-10 rounded-xl bg-white"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-medium text-slate-600">
                Thứ tự
              </label>
              <Input
                className="h-10 rounded-xl bg-white"
                type="number"
                min={1}
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-xl"
            onClick={onClose}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            className="cursor-pointer rounded-xl bg-sky-700 hover:bg-sky-800"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
    </>
  );
}
