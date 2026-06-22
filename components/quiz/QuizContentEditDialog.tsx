"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  ListTree,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { useUpdateLessonQuizQuestionsMutation } from "@/app/hooks/lessonQuiz/useUpdateLessonQuizQuestions";
import { useGetLessonQuizQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuiz";
import type { QuizBankItem, QuizType } from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QuizCodeBadge } from "./QuizCodeBadge";
import {
  buildUpdateQuestionsPayload,
  createEmptyOption,
  createEmptyQuestion,
  getQuestionPreview,
  getQuizQuestionsValidationError,
  isQuestionFilled,
  mapLessonQuizDetailToQuestionForms,
  type QuestionForm,
} from "./quizCreateFormUtils";

type QuizContentEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quiz: QuizBankItem | null;
  onSuccess?: () => void;
};

const quizTypeLabels: Record<QuizType, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  ESSAY: "Tự luận",
};

const MODAL_CLASS =
  "fixed inset-0 flex h-dvh max-h-dvh w-full max-w-full translate-none flex-col gap-0 overflow-hidden rounded-none border-slate-200 bg-white p-0 shadow-xl sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[calc(100%-1.5rem)] sm:max-w-[min(96vw,72rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl lg:max-w-6xl xl:max-w-7xl";

export function QuizContentEditDialog({
  open,
  onOpenChange,
  quiz,
  onSuccess,
}: QuizContentEditDialogProps) {
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const {
    data: quizDetail,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetLessonQuizQuery(open ? (quiz?.id ?? undefined) : undefined);

  const { mutateAsync: updateQuestions, isPending } =
    useUpdateLessonQuizQuestionsMutation();

  const quizType = quizDetail?.quizType ?? quiz?.quizType ?? "MULTIPLE_CHOICE";
  const activeQuestion = questions[activeQuestionIndex];

  useEffect(() => {
    if (!open || !quizDetail) return;
    setQuestions(mapLessonQuizDetailToQuestionForms(quizDetail));
    setActiveQuestionIndex(0);
  }, [open, quizDetail]);

  const closeDialog = () => {
    onOpenChange(false);
    setQuestions([]);
    setActiveQuestionIndex(0);
  };

  const addQuestion = () => {
    const nextIndex = questions.length;
    setQuestions((prev) => [...prev, createEmptyQuestion(quizType)]);
    setActiveQuestionIndex(nextIndex);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;

    const next = questions.filter((_, i) => i !== index);
    setQuestions(next);
    setActiveQuestionIndex((current) => {
      if (current > index) return current - 1;
      if (current >= next.length) return next.length - 1;
      return current;
    });
  };

  const updateQuestion = (index: number, patch: Partial<QuestionForm>) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === index ? { ...question, ...patch } : question,
      ),
    );
  };

  const addOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, i) =>
        i === questionIndex
          ? {
              ...question,
              options: [...question.options, createEmptyOption(false)],
            }
          : question,
      ),
    );
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((question, i) => {
        if (i !== questionIndex || question.options.length <= 2) {
          return question;
        }

        const nextOptions = question.options.filter(
          (_, oi) => oi !== optionIndex,
        );
        const hasCorrect = nextOptions.some((option) => option.correct);

        return {
          ...question,
          options: hasCorrect
            ? nextOptions
            : nextOptions.map((option, oi) => ({
                ...option,
                correct: oi === 0,
              })),
        };
      }),
    );
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    patch: Partial<{ content: string; correct: boolean }>,
  ) => {
    setQuestions((prev) =>
      prev.map((question, i) => {
        if (i !== questionIndex) return question;

        return {
          ...question,
          options: question.options.map((option, oi) => {
            if (oi !== optionIndex) {
              if (patch.correct) return { ...option, correct: false };
              return option;
            }
            return { ...option, ...patch };
          }),
        };
      }),
    );
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    const validationError = getQuizQuestionsValidationError(quizType, questions);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      const data = await updateQuestions({
        quizId: quiz.id,
        payload: {
          questions: buildUpdateQuestionsPayload(quizType, questions),
        },
      });

      toast.success(data.message ?? "Đã cập nhật nội dung đề");
      closeDialog();
      onSuccess?.();
    } catch (submitError) {
      console.error(submitError);
      toast.error("Không thể cập nhật nội dung đề");
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
      <DialogContent className={MODAL_CLASS}>
        <div className="shrink-0 border-b border-slate-200 bg-linear-to-r from-sky-50/80 via-white to-slate-50 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
              <ListTree className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 pr-6 sm:pr-0">
              <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
                Sửa nội dung đề
              </DialogTitle>
              <DialogDescription className="mt-1 line-clamp-2 text-sm text-slate-500">
                {quiz?.title ?? "Chỉnh sửa câu hỏi và đáp án trong bộ đề"}
              </DialogDescription>
            </div>
          </div>

          <div className="mt-4 flex gap-2.5 rounded-xl border border-sky-200 bg-sky-50/80 px-3.5 py-3 text-xs leading-relaxed text-sky-950 sm:text-sm">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
            <p>
              Chỉnh sửa câu hỏi và đáp án sẽ được lưu trực tiếp vào đề hiện
              tại. Học sinh đang làm bài sẽ thấy nội dung mới sau khi bạn lưu.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-sm text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
            Đang tải nội dung đề...
          </div>
        ) : isError ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
            <AlertCircle className="mb-3 h-6 w-6 text-slate-400" />
            <p className="font-medium text-slate-900">Không thể tải nội dung đề</p>
            <p className="mt-1 text-sm text-slate-500">
              {error instanceof Error ? error.message : "Vui lòng thử lại"}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 cursor-pointer rounded-xl"
              onClick={() => refetch()}
            >
              Thử lại
            </Button>
          </div>
        ) : quizDetail ? (
          <>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="shrink-0 space-y-4 border-b border-slate-200 bg-slate-50/50 p-4 sm:p-5 lg:overflow-y-auto lg:border-r lg:border-b-0">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Thông tin đề
                </p>

                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <p className="text-sm font-semibold text-slate-900">
                    {quizDetail.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {quizTypeLabels[quizDetail.quizType]}
                    {typeof quizDetail.version === "number"
                      ? ` · Phiên bản ${quizDetail.version}`
                      : null}
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5">
                  <p className="text-[10px] font-semibold tracking-wide text-amber-800 uppercase">
                    Mã đề hiện tại
                  </p>
                  <QuizCodeBadge
                    code={quizDetail.lessonQuizCode}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-2 rounded-xl border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-xs leading-relaxed text-sky-900">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    Muốn đổi tiêu đề, thời gian hay điểm đạt? Dùng nút{" "}
                    <span className="font-semibold">Sửa thông tin</span>.
                  </p>
                </div>
              </aside>

              <section className="flex min-h-0 flex-col lg:overflow-hidden">
                <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Soạn câu hỏi
                    </p>
                    <p className="text-xs text-slate-500">
                      {quizType === "ESSAY"
                        ? "Sửa câu hỏi tự luận và đáp án mẫu"
                        : "Sửa câu hỏi trắc nghiệm và đáp án"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 w-full shrink-0 cursor-pointer rounded-lg sm:w-auto"
                    onClick={addQuestion}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Thêm câu
                  </Button>
                </div>

                <div className="flex min-h-0 flex-1 flex-col lg:overflow-hidden lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="shrink-0 border-b border-slate-100 bg-slate-50/40 lg:overflow-y-auto lg:border-r lg:border-b-0">
                    <p className="px-4 pt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase lg:hidden">
                      Danh sách câu hỏi
                    </p>
                    <div className="space-y-1 p-3">
                      {questions.map((question, questionIndex) => {
                        const isActive = questionIndex === activeQuestionIndex;
                        const filled = isQuestionFilled(question, quizType);

                        return (
                          <button
                            key={questionIndex}
                            type="button"
                            onClick={() => setActiveQuestionIndex(questionIndex)}
                            className={cn(
                              "flex w-full cursor-pointer items-start gap-2.5 rounded-xl px-3 py-2.5 text-left transition",
                              isActive
                                ? "bg-sky-700 text-white shadow-md"
                                : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:ring-sky-200",
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                                isActive
                                  ? "bg-white/20 text-white"
                                  : filled
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-slate-100 text-slate-600",
                              )}
                            >
                              {questionIndex + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                className={cn(
                                  "block truncate text-sm font-medium",
                                  isActive ? "text-white" : "text-slate-800",
                                )}
                              >
                                {getQuestionPreview(question)}
                              </span>
                              <span
                                className={cn(
                                  "mt-0.5 block text-xs",
                                  isActive ? "text-sky-100" : "text-slate-500",
                                )}
                              >
                                {question.points || "0"} điểm
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {activeQuestion ? (
                    <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold text-slate-900">
                            Câu {activeQuestionIndex + 1}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activeQuestionIndex + 1} / {questions.length}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 cursor-pointer"
                            onClick={() =>
                              setActiveQuestionIndex((index) =>
                                Math.max(0, index - 1),
                              )
                            }
                            disabled={activeQuestionIndex === 0}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 cursor-pointer"
                            onClick={() =>
                              setActiveQuestionIndex((index) =>
                                Math.min(questions.length - 1, index + 1),
                              )
                            }
                            disabled={activeQuestionIndex >= questions.length - 1}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 cursor-pointer text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            onClick={() => removeQuestion(activeQuestionIndex)}
                            disabled={questions.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
                          <div className="grid gap-2">
                            <label className="text-xs font-medium text-slate-600">
                              Nội dung câu hỏi
                            </label>
                            <Textarea
                              className="min-h-[100px] resize-y bg-white"
                              placeholder="Nhập câu hỏi"
                              value={activeQuestion.content}
                              onChange={(e) =>
                                updateQuestion(activeQuestionIndex, {
                                  content: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-xs font-medium text-slate-600">
                              Điểm
                            </label>
                            <Input
                              className="h-10 bg-white"
                              type="number"
                              min={1}
                              value={activeQuestion.points}
                              onChange={(e) =>
                                updateQuestion(activeQuestionIndex, {
                                  points: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        {quizType === "ESSAY" ? (
                          <div className="grid gap-2">
                            <label className="text-xs font-medium text-slate-600">
                              Đáp án mẫu
                            </label>
                            <Textarea
                              className="min-h-[140px] resize-y bg-white"
                              placeholder="Nhập đáp án mẫu"
                              value={activeQuestion.essayAnswer}
                              onChange={(e) =>
                                updateQuestion(activeQuestionIndex, {
                                  essayAnswer: e.target.value,
                                })
                              }
                            />
                          </div>
                        ) : (
                          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                Đáp án — bấm ○ để chọn đúng
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 w-full cursor-pointer bg-white sm:w-auto"
                                onClick={() => addOption(activeQuestionIndex)}
                              >
                                <Plus className="mr-1 h-3.5 w-3.5" />
                                Thêm đáp án
                              </Button>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {activeQuestion.options.map(
                                (option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className={cn(
                                      "flex items-start gap-2 rounded-xl border bg-white p-2.5 sm:items-center",
                                      option.correct
                                        ? "border-emerald-300 ring-1 ring-emerald-200"
                                        : "border-slate-200",
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateOption(
                                          activeQuestionIndex,
                                          optionIndex,
                                          { correct: true },
                                        )
                                      }
                                      className="mt-0.5 shrink-0 cursor-pointer sm:mt-0"
                                      aria-label={`Chọn đáp án ${optionIndex + 1} là đúng`}
                                    >
                                      <CheckCircle2
                                        className={
                                          option.correct
                                            ? "h-5 w-5 text-emerald-600"
                                            : "h-5 w-5 text-slate-300"
                                        }
                                      />
                                    </button>
                                    <Input
                                      className="h-9 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
                                      placeholder={`Đáp án ${optionIndex + 1}`}
                                      value={option.content}
                                      onChange={(e) =>
                                        updateOption(
                                          activeQuestionIndex,
                                          optionIndex,
                                          { content: e.target.value },
                                        )
                                      }
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 shrink-0 cursor-pointer text-slate-400 hover:text-rose-600"
                                      onClick={() =>
                                        removeOption(
                                          activeQuestionIndex,
                                          optionIndex,
                                        )
                                      }
                                      disabled={activeQuestion.options.length <= 2}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
              <p className="text-center text-xs text-slate-500 sm:text-left">
                {questions.length} câu hỏi · Thay đổi sẽ được lưu vào đề hiện tại
              </p>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 w-full cursor-pointer rounded-xl sm:w-auto"
                  onClick={closeDialog}
                  disabled={isPending}
                >
                  Huỷ
                </Button>
                <Button
                  type="button"
                  className="h-10 w-full cursor-pointer rounded-xl bg-sky-700 px-6 hover:bg-sky-800 sm:w-auto"
                  onClick={() => void handleSubmit()}
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
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
