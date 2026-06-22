"use client";

import { useEffect, useState } from "react";
import { Info, Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";

import { useUpdateLessonQuizMutation } from "@/app/hooks/lessonQuiz/useUpdateLessonQuiz";
import type { QuizBankItem } from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type QuizEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: QuizBankItem | null;
  onSuccess?: () => void;
};

export function QuizEditDialog({
  open,
  onOpenChange,
  quiz,
  onSuccess,
}: QuizEditDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [passScore, setPassScore] = useState("");

  const { mutateAsync: updateQuiz, isPending } = useUpdateLessonQuizMutation();

  useEffect(() => {
    if (!open || !quiz) return;

    setTitle(quiz.title);
    setDescription(quiz.description ?? "");
    setDurationMinutes(String(quiz.durationMinutes));
    setPassScore(String(quiz.passScore));
  }, [open, quiz]);

  const closeDialog = () => {
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề đề");
      return;
    }

    const duration = Number(durationMinutes);
    const pass = Number(passScore);

    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("Thời gian làm bài phải lớn hơn 0");
      return;
    }

    if (!Number.isFinite(pass) || pass <= 0) {
      toast.error("Điểm đạt phải lớn hơn 0");
      return;
    }

    try {
      await updateQuiz({
        lessonQuizId: quiz.id,
        payload: {
          title: title.trim(),
          description: description.trim(),
          durationMinutes: duration,
          passScore: pass,
        },
      });

      toast.success("Cập nhật thông tin đề thành công");
      closeDialog();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật thông tin đề thất bại");
    }
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
                Sửa thông tin đề
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm leading-relaxed text-slate-500">
                Chỉ cập nhật tiêu đề, mô tả, thời gian và điểm đạt — không thay
                đổi câu hỏi trong đề.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-4 overflow-y-auto px-6 py-5">
          {quiz ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-700">
              {quiz.title}
            </p>
          ) : null}

          <div className="flex gap-2.5 rounded-xl border border-sky-100 bg-sky-50/70 px-3.5 py-3 text-xs leading-relaxed text-sky-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
            <p>
              Muốn sửa câu hỏi và đáp án? Dùng nút{" "}
              <span className="font-semibold">Nội dung</span> — chỉnh sửa câu
              hỏi và đáp án của đề hiện tại.
            </p>
          </div>

          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Thông tin chung
          </p>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-600">Tiêu đề</label>
            <Input
              className="bg-white"
              placeholder="Tiêu đề đề"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-xs font-medium text-slate-600">Mô tả</label>
            <Textarea
              className="min-h-[88px] resize-y bg-white"
              placeholder="Mô tả ngắn về đề"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-xs font-medium text-slate-600">
                Thời gian
              </label>
              <div className="relative">
                <Input
                  className="bg-white pr-8"
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                />
                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-slate-400">
                  phút
                </span>
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-medium text-slate-600">
                Điểm đạt
              </label>
              <Input
                className="bg-white"
                type="number"
                min={1}
                value={passScore}
                onChange={(e) => setPassScore(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer rounded-xl"
            onClick={closeDialog}
            disabled={isPending}
          >
            Huỷ
          </Button>
          <Button
            type="button"
            className="h-10 cursor-pointer rounded-xl bg-sky-700 px-5 hover:bg-sky-800"
            onClick={handleSubmit}
            disabled={isPending || !quiz}
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
      </DialogContent>
    </Dialog>
  );
}
