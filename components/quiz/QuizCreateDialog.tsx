"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCreateLessonQuizMutation } from "@/app/hooks/lessonQuiz/useCreateLessonQuiz";
import type { QuizType } from "@/app/service/lessonQuiz.service";
import {
  createEmptyQuestion,
  createEmptyOption,
  getQuestionPreview,
  isQuestionFilled,
  type QuestionForm,
} from "./quizCreateFormUtils";

type QuizCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  subtitle?: string;
};

export function QuizCreateDialog({
  open,
  onOpenChange,
  onSuccess,
  subtitle = "Tạo đề trắc nghiệm hoặc tự luận trong kho đề",
}: QuizCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("15");
  const [passScore, setPassScore] = useState("5");
  const [quizType, setQuizType] = useState<QuizType>("MULTIPLE_CHOICE");
  const [questions, setQuestions] = useState<QuestionForm[]>([
    createEmptyQuestion("MULTIPLE_CHOICE"),
  ]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const { mutateAsync: createQuiz, isPending } = useCreateLessonQuizMutation();

  const activeQuestion = questions[activeQuestionIndex];

  const handleQuizTypeChange = (value: QuizType) => {
    setQuizType(value);
    setQuestions([createEmptyQuestion(value)]);
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

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDurationMinutes("15");
    setPassScore("5");
    setQuizType("MULTIPLE_CHOICE");
    setQuestions([createEmptyQuestion("MULTIPLE_CHOICE")]);
    setActiveQuestionIndex(0);
  };

  const closeDialog = () => {
    onOpenChange(false);
    resetForm();
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Vui lòng nhập tiêu đề quiz");
      return false;
    }

    const duration = Number(durationMinutes);
    const pass = Number(passScore);
    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error("Thời gian làm bài phải lớn hơn 0");
      return false;
    }
    if (!Number.isFinite(pass) || pass <= 0) {
      toast.error("Điểm đạt phải lớn hơn 0");
      return false;
    }

    for (let i = 0; i < questions.length; i += 1) {
      const question = questions[i];
      if (!question.content.trim()) {
        toast.error(`Vui lòng nhập nội dung câu hỏi ${i + 1}`);
        return false;
      }

      const points = Number(question.points);
      if (!Number.isFinite(points) || points <= 0) {
        toast.error(`Điểm câu hỏi ${i + 1} phải lớn hơn 0`);
        return false;
      }

      if (quizType === "ESSAY") {
        if (!question.essayAnswer.trim()) {
          toast.error(`Vui lòng nhập đáp án mẫu cho câu hỏi ${i + 1}`);
          return false;
        }
      } else {
        const filledOptions = question.options.filter((option) =>
          option.content.trim(),
        );
        if (filledOptions.length < 2) {
          toast.error(`Câu hỏi ${i + 1} cần ít nhất 2 đáp án`);
          return false;
        }
        if (!question.options.some((option) => option.correct)) {
          toast.error(`Câu hỏi ${i + 1} cần chọn đáp án đúng`);
          return false;
        }
        if (
          question.options.some(
            (option) => option.correct && !option.content.trim(),
          )
        ) {
          toast.error(`Đáp án đúng của câu ${i + 1} không được để trống`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createQuiz({
        title: title.trim(),
        description: description.trim(),
        durationMinutes: Number(durationMinutes),
        passScore: Number(passScore),
        quizType,
        questions: questions.map((question) => {
          if (quizType === "ESSAY") {
            return {
              content: question.content.trim(),
              points: Number(question.points),
              essayAnswer: question.essayAnswer.trim(),
            };
          }

          return {
            content: question.content.trim(),
            points: Number(question.points),
            options: question.options
              .filter((option) => option.content.trim())
              .map((option) => ({
                content: option.content.trim(),
                correct: option.correct,
              })),
          };
        }),
      });

      toast.success("Tạo đề thành công");
      closeDialog();
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error("Tạo đề thất bại");
    }
  };

  const canSubmit = useMemo(
    () => Boolean(title.trim() && !isPending),
    [title, isPending],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="fixed inset-0 flex h-dvh max-h-dvh w-full max-w-full translate-none flex-col gap-0 overflow-hidden rounded-none border-slate-200 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[calc(100%-1.5rem)] sm:max-w-[min(96vw,80rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl lg:max-w-7xl">
        <div className="flex shrink-0 items-start gap-3 border-b border-slate-200 bg-linear-to-r from-sky-50/80 via-white to-slate-50 px-4 py-3 sm:items-center sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pr-8 sm:pr-0">
            <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
              Tạo đề mới
            </DialogTitle>
            <DialogDescription className="mt-0.5 line-clamp-2 text-sm text-slate-500 sm:truncate">
              {subtitle}
            </DialogDescription>
          </div>
          <span className="hidden shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 md:inline">
            {questions.length} câu hỏi
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:overflow-hidden xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="shrink-0 space-y-4 border-b border-slate-200 bg-slate-50/50 p-4 sm:p-5 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-b-0">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Thông tin đề
            </p>

            <div className="space-y-4">
              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Tiêu đề
                </label>
                <Input
                  className="bg-white"
                  placeholder="Trắc nghiệm chương 1"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Mô tả
                </label>
                <Textarea
                  className="bg-white"
                  placeholder="Mô tả ngắn"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-medium text-slate-600">
                  Loại đề
                </label>
                <Select
                  value={quizType}
                  onValueChange={(value) =>
                    handleQuizTypeChange(value as QuizType)
                  }
                >
                  <SelectTrigger className="cursor-pointer bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">Trắc nghiệm</SelectItem>
                    <SelectItem value="ESSAY">Tự luận</SelectItem>
                  </SelectContent>
                </Select>
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
          </aside>

          <section className="flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-hidden">
            <div className="flex shrink-0 flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">
                  Soạn câu hỏi
                </p>
                <p className="text-xs text-slate-500">
                  {quizType === "ESSAY"
                    ? "Nhập câu hỏi và đáp án mẫu"
                    : "Chọn đáp án đúng cho mỗi câu"}
                </p>
                <p className="mt-1 text-xs font-medium text-sky-700 md:hidden">
                  {questions.length} câu hỏi
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

            <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="shrink-0 border-b border-slate-100 bg-slate-50/40 lg:max-h-none lg:overflow-y-auto lg:border-r lg:border-b-0">
                <p className="px-4 pt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase lg:hidden">
                  Danh sách câu hỏi
                </p>
                <div className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-5 [-ms-overflow-style:none] scrollbar-none lg:hidden [&::-webkit-scrollbar]:hidden">
                  {questions.map((question, questionIndex) => {
                    const isActive = questionIndex === activeQuestionIndex;
                    const filled = isQuestionFilled(question, quizType);

                    return (
                      <button
                        key={questionIndex}
                        type="button"
                        onClick={() => setActiveQuestionIndex(questionIndex)}
                        className={cn(
                          "flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left transition",
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
                        <span
                          className={cn(
                            "text-xs font-medium",
                            isActive ? "text-white" : "text-slate-600",
                          )}
                        >
                          {question.points || "0"}đ
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="hidden space-y-1 p-3 lg:block">
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
                <div className="p-4 sm:p-5 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-y-auto">
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
                          placeholder="Nhập đáp án mẫu để chấm tự luận"
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
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
                          {activeQuestion.options.map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              className={cn(
                                "flex items-start gap-2 rounded-xl border bg-white p-2.5 transition sm:items-center",
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
                                  removeOption(activeQuestionIndex, optionIndex)
                                }
                                disabled={activeQuestion.options.length <= 2}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
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
            {quizType === "MULTIPLE_CHOICE" ? "Trắc nghiệm" : "Tự luận"} ·{" "}
            {durationMinutes} phút · Đạt {passScore} điểm
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-3">
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
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="h-10 w-full cursor-pointer rounded-xl bg-sky-700 px-6 hover:bg-sky-800 sm:w-auto"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                "Tạo đề"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
