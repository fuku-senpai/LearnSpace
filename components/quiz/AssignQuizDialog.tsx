"use client";

import { useEffect, useMemo, useState, type UIEvent } from "react";
import { Link2, Loader2, Search } from "lucide-react";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { useAssignQuizMutation } from "@/app/hooks/lessonQuiz/useAssignQuiz";
import {
  QUIZ_BANK_INFINITE_SIZE,
  useGetQuizBankInfiniteQuery,
} from "@/app/hooks/lessonQuiz/useGetQuizBank";
import { useGetSnapMaterials } from "@/app/hooks/materials/useGetSnapMaterials";
import { useGetTeacherClassrooms } from "@/app/hooks/teacher/useGetTeacherClassrooms";
import { queryClient } from "@/app/lib/react-query";
import type { QuizBankItem } from "@/app/service/lessonQuiz.service";
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
import { cn } from "@/lib/utils";

export type AssignQuizFromBankContext = {
  mode: "from-bank";
  lessonQuizId: string;
  quizTitle: string;
};

export type AssignQuizFromLessonContext = {
  mode: "from-lesson";
  snapLessonId: string;
  lessonTitle: string;
  classroomId: string;
  defaultDisplayOrder: number;
};

export type AssignQuizContext =
  | AssignQuizFromBankContext
  | AssignQuizFromLessonContext;

type AssignQuizDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: AssignQuizContext | null;
  onSuccess?: () => void;
};

type LessonOption = {
  snapLessonId: string;
  label: string;
};

const quizTypeLabels = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  ESSAY: "Tự luận",
} as const;

const QUIZ_LIST_SCROLL_THRESHOLD = 48;

export function AssignQuizDialog({
  open,
  onOpenChange,
  context,
  onSuccess,
}: AssignQuizDialogProps) {
  const [classroomId, setClassroomId] = useState("");
  const [snapLessonId, setSnapLessonId] = useState("");
  const [selectedQuizId, setSelectedQuizId] = useState("");
  const [required, setRequired] = useState<"true" | "false">("true");
  const [maxAttempts, setMaxAttempts] = useState("1");
  const [displayOrder, setDisplayOrder] = useState("1");
  const [quizSearch, setQuizSearch] = useState("");
  const [debouncedQuizSearch, setDebouncedQuizSearch] = useState("");

  const isQuizPickerOpen = open && context?.mode === "from-lesson";

  const {
    data: quizBankPages,
    isLoading: isLoadingQuizBank,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetQuizBankInfiniteQuery(
    {
      size: QUIZ_BANK_INFINITE_SIZE,
      title: debouncedQuizSearch || undefined,
    },
    isQuizPickerOpen,
  );

  const quizBankItems = useMemo(
    () => quizBankPages?.pages.flatMap((page) => page.items) ?? [],
    [quizBankPages],
  );

  const { data: classrooms = [], isLoading: isLoadingClassrooms } =
    useGetTeacherClassrooms();
  const effectiveClassroomId =
    context?.mode === "from-lesson"
      ? context.classroomId
      : classroomId || classrooms[0]?.classroomId || "";

  const { data: snapMaterials = [], isLoading: isLoadingLessons } =
    useGetSnapMaterials(
      open && context?.mode === "from-bank" ? effectiveClassroomId : undefined,
    );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuizSearch(quizSearch.trim());
    }, 400);
    return () => window.clearTimeout(timer);
  }, [quizSearch]);

  const { mutateAsync: assignQuiz, isPending } = useAssignQuizMutation();

  const lessonOptions = useMemo<LessonOption[]>(() => {
    if (!Array.isArray(snapMaterials)) return [];

    return snapMaterials.flatMap((material) =>
      (material.lessons ?? []).map((lesson) => ({
        snapLessonId: lesson.lessonId,
        label: `${material.title} · Buổi ${lesson.lessonOrder}: ${lesson.title}`,
      })),
    );
  }, [snapMaterials]);

  const selectedQuiz = useMemo(
    () => quizBankItems.find((item) => item.id === selectedQuizId) ?? null,
    [quizBankItems, selectedQuizId],
  );

  const handleQuizListScroll = (event: UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isScrollable = element.scrollHeight > element.clientHeight + 1;
    if (!isScrollable) return;

    const nearBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight <
      QUIZ_LIST_SCROLL_THRESHOLD;

    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  useEffect(() => {
    if (open) return;

    queryClient.removeQueries({ queryKey: ["question-bank", "infinite"] });
  }, [open]);

  useEffect(() => {
    if (!open || !context) return;

    setRequired("true");
    setMaxAttempts("1");
    setQuizSearch("");
    setDebouncedQuizSearch("");

    if (context.mode === "from-bank") {
      setClassroomId("");
      setSnapLessonId("");
      setDisplayOrder("1");
    } else {
      setSnapLessonId(context.snapLessonId);
      setSelectedQuizId("");
      setDisplayOrder(String(context.defaultDisplayOrder));
    }
  }, [open, context]);

  useEffect(() => {
    if (!open || context?.mode !== "from-bank") return;
    if (classroomId || classrooms.length === 0) return;
    setClassroomId(classrooms[0].classroomId);
  }, [open, context, classroomId, classrooms]);

  const closeDialog = () => {
    onOpenChange(false);
  };

  const validateForm = () => {
    const lessonId =
      context?.mode === "from-lesson" ? context.snapLessonId : snapLessonId;
    const quizId =
      context?.mode === "from-bank"
        ? context?.lessonQuizId
        : selectedQuizId;

    if (!lessonId) {
      toast.error("Vui lòng chọn buổi học");
      return null;
    }
    if (!quizId) {
      toast.error("Vui lòng chọn đề từ kho");
      return null;
    }

    const attempts = Number(maxAttempts);
    const order = Number(displayOrder);
    if (!Number.isFinite(attempts) || attempts <= 0) {
      toast.error("Số lần làm phải lớn hơn 0");
      return null;
    }
    if (!Number.isFinite(order) || order <= 0) {
      toast.error("Thứ tự hiển thị phải lớn hơn 0");
      return null;
    }

    return {
      snapLessonId: lessonId,
      lessonQuizId: quizId,
      required: required === "true",
      maxAttempts: attempts,
      displayOrder: order,
      classroomId: effectiveClassroomId || undefined,
    };
  };

  const handleSubmit = async () => {
    const payload = validateForm();
    if (!payload) return;

    try {
      const response = await assignQuiz(payload);
      toast.success(response.message || "Gắn đề vào buổi học thành công");
      closeDialog();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof AxiosError &&
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : "Gắn đề thất bại";
      toast.error(message);
    }
  };

  const isFromBank = context?.mode === "from-bank";
  const dialogTitle = isFromBank ? "Gắn đề vào buổi học" : "Gắn đề từ kho";
  const dialogDescription = isFromBank
    ? `Đề: ${context?.quizTitle ?? ""}`
    : `Buổi học: ${context?.mode === "from-lesson" ? context.lessonTitle : ""}`;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-1.5rem)] max-w-lg flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 p-0 sm:max-w-xl">
        <div className="border-b border-slate-200 bg-linear-to-r from-sky-50/80 via-white to-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white">
              <Link2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {dialogTitle}
              </DialogTitle>
              <DialogDescription className="mt-0.5 truncate text-sm text-slate-500">
                {dialogDescription}
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {isFromBank ? (
            <>
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Lớp học
                </label>
                <Select
                  value={effectiveClassroomId}
                  onValueChange={(value) => {
                    setClassroomId(value);
                    setSnapLessonId("");
                  }}
                  disabled={isLoadingClassrooms}
                >
                  <SelectTrigger className="h-10 cursor-pointer rounded-xl bg-white">
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>
                  <SelectContent>
                    {classrooms.map((classroom) => (
                      <SelectItem
                        key={classroom.classroomId}
                        value={classroom.classroomId}
                      >
                        {classroom.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Buổi học
                </label>
                <Select
                  value={snapLessonId}
                  onValueChange={setSnapLessonId}
                  disabled={isLoadingLessons || lessonOptions.length === 0}
                >
                  <SelectTrigger className="h-10 cursor-pointer rounded-xl bg-white">
                    <SelectValue
                      placeholder={
                        isLoadingLessons
                          ? "Đang tải buổi học..."
                          : "Chọn buổi học"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonOptions.map((lesson) => (
                      <SelectItem
                        key={lesson.snapLessonId}
                        value={lesson.snapLessonId}
                      >
                        {lesson.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3 text-sm text-slate-700">
                Gắn đề vào buổi học đang chọn. Chọn một đề từ kho bên dưới.
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Tìm đề trong kho
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-10 rounded-xl bg-white pl-9"
                    placeholder="Tìm theo tiêu đề..."
                    value={quizSearch}
                    onChange={(e) => setQuizSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Chọn đề
                </label>
                <div
                  onScroll={handleQuizListScroll}
                  className="max-h-52 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/40 p-2"
                >
                  {isLoadingQuizBank ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải kho đề...
                    </div>
                  ) : quizBankItems.length === 0 ? (
                    <p className="py-8 text-center text-sm text-slate-500">
                      Không tìm thấy đề phù hợp
                    </p>
                  ) : (
                    <>
                      {quizBankItems.map((quiz) => (
                        <QuizPickItem
                          key={quiz.id}
                          quiz={quiz}
                          selected={selectedQuizId === quiz.id}
                          onSelect={() => setSelectedQuizId(quiz.id)}
                        />
                      ))}
                      {isFetchingNextPage ? (
                        <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-500">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Đang tải thêm...
                        </div>
                      ) : hasNextPage ? (
                        <p className="py-2 text-center text-[11px] text-slate-400">
                          Cuộn xuống để xem thêm
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
                {selectedQuiz ? (
                  <p className="text-xs text-slate-500">
                    Đã chọn:{" "}
                    <span className="font-medium text-slate-700">
                      {selectedQuiz.title}
                    </span>
                  </p>
                ) : null}
              </div>
            </>
          )}

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
            onClick={closeDialog}
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
                Đang gắn...
              </>
            ) : (
              "Gắn đề"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function QuizPickItem({
  quiz,
  selected,
  onSelect,
}: {
  quiz: QuizBankItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer flex-col rounded-lg border px-3 py-2.5 text-left transition",
        selected
          ? "border-sky-300 bg-sky-50 ring-1 ring-sky-200"
          : "border-slate-200 bg-white hover:border-sky-200",
      )}
    >
      <span className="text-sm font-medium text-slate-900">{quiz.title}</span>
      <span className="mt-0.5 text-xs text-slate-500">
        {quizTypeLabels[quiz.quizType]} · {quiz.totalQuestions} câu ·{" "}
        {quiz.durationMinutes} phút
      </span>
    </button>
  );
}
