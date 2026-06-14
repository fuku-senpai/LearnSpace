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
import { LessonQuizList } from "@/components/lesson/LessonQuizList";
import { useCreateLessonQuizMutation } from "@/app/hooks/lessonQuiz/useCreateLessonQuiz";
import type { LessonQuiz } from "@/app/service/material.service";
import type { QuizType } from "@/app/service/lessonQuiz.service";

type OptionForm = {
  content: string;
  correct: boolean;
};

type QuestionForm = {
  content: string;
  points: string;
  essayAnswer: string;
  options: OptionForm[];
};

const createEmptyOption = (correct = false): OptionForm => ({
  content: "",
  correct,
});

const createEmptyQuestion = (quizType: QuizType): QuestionForm => ({
  content: "",
  points: "1",
  essayAnswer: "",
  options:
    quizType === "MULTIPLE_CHOICE"
      ? [createEmptyOption(true), createEmptyOption(false)]
      : [],
});

const getQuestionPreview = (question: QuestionForm) => {
  const text = question.content.trim();
  if (!text) return "Chưa nhập nội dung";
  return text.length > 48 ? `${text.slice(0, 48)}...` : text;
};

const isQuestionFilled = (question: QuestionForm, quizType: QuizType) =>
  Boolean(question.content.trim()) &&
  (quizType === "ESSAY"
    ? Boolean(question.essayAnswer.trim())
    : question.options.filter((option) => option.content.trim()).length >= 2);

type LessonQuizPanelProps = {
  snapLessonId: string;
  lessonTitle: string;
  quizzes: LessonQuiz[];
  classroomId?: string;
};

export function LessonQuizPanel({
  snapLessonId,
  lessonTitle,
  quizzes,
  classroomId,
}: LessonQuizPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("15");
  const [passScore, setPassScore] = useState("5");
  const [quizType, setQuizType] = useState<QuizType>("MULTIPLE_CHOICE");
  const [questions, setQuestions] = useState<QuestionForm[]>([
    createEmptyQuestion("MULTIPLE_CHOICE"),
  ]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { mutateAsync: createLessonQuiz, isPending } =
    useCreateLessonQuizMutation();

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

  const updateQuestion = (
    index: number,
    patch: Partial<QuestionForm>,
  ) => {
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
    patch: Partial<OptionForm>,
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

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const validateForm = () => {
    if (!snapLessonId) {
      toast.error("Vui lòng chọn buổi học");
      return false;
    }
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
      await createLessonQuiz({
        title: title.trim(),
        description: description.trim(),
        snapLessonId,
        durationMinutes: Number(durationMinutes),
        passScore: Number(passScore),
        quizType,
        classroomId,
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

      toast.success("Tạo quiz thành công");
      closeCreateModal();
    } catch (error) {
      console.error(error);
      toast.error("Tạo quiz thất bại");
    }
  };

  const canSubmit = useMemo(
    () => Boolean(snapLessonId && title.trim() && !isPending),
    [snapLessonId, title, isPending],
  );

  if (!snapLessonId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chọn buổi học để quản lý trắc nghiệm
      </div>
    );
  }

  return (
    <>
      <LessonQuizList
        lessonTitle={lessonTitle}
        quizzes={quizzes}
        mode="teacher"
        onCreateClick={() => setIsCreateOpen(true)}
      />

      <Dialog
        open={isCreateOpen}
        onOpenChange={(open) => {
          if (!open) closeCreateModal();
        }}
      >
        <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[min(96vw,80rem)] flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 p-0 sm:max-w-7xl">
          <div className="flex items-center gap-4 border-b border-slate-200 bg-linear-to-r from-violet-50/80 via-white to-slate-50 px-6 py-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white shadow-sm">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                Tạo quiz mới
              </DialogTitle>
              <DialogDescription className="mt-0.5 truncate text-sm text-slate-500">
                Buổi học: {lessonTitle}
              </DialogDescription>
            </div>
            <span className="hidden shrink-0 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 sm:inline">
              {questions.length} câu hỏi
            </span>
          </div>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="space-y-4 border-b border-slate-200 bg-slate-50/50 p-5 lg:border-r lg:border-b-0">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Thông tin quiz
              </p>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="text-xs font-medium text-slate-600">
                    Tiêu đề
                  </label>
                  <Input
                    className="bg-white"
                    placeholder="Trắc nghiệm cuối buổi"
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
                    Loại quiz
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
                      <SelectItem value="MULTIPLE_CHOICE">
                        Trắc nghiệm
                      </SelectItem>
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

            <section className="flex min-h-0 flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Soạn câu hỏi
                  </p>
                  <p className="text-xs text-slate-500">
                    {quizType === "ESSAY"
                      ? "Nhập câu hỏi và đáp án mẫu"
                      : "Chọn đáp án đúng cho mỗi câu"}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer rounded-lg"
                  onClick={addQuestion}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Thêm câu
                </Button>
              </div>

              <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="max-h-[min(52vh,520px)] space-y-1 overflow-y-auto border-b border-slate-100 bg-slate-50/40 p-3 lg:max-h-none lg:border-r lg:border-b-0">
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
                            ? "bg-violet-700 text-white shadow-md"
                            : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:ring-violet-200",
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
                              isActive ? "text-violet-100" : "text-slate-500",
                            )}
                          >
                            {question.points || "0"} điểm
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {activeQuestion ? (
                  <div className="flex max-h-[min(52vh,520px)] min-h-[320px] flex-col overflow-y-auto p-5 lg:max-h-none">
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
                      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px]">
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
                        <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                              Đáp án — bấm ○ để chọn đúng
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 cursor-pointer bg-white"
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
                                  "flex items-center gap-2 rounded-xl border bg-white p-2.5 transition",
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
                                  className="shrink-0 cursor-pointer"
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

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4">
            <p className="text-xs text-slate-500">
              {quizType === "MULTIPLE_CHOICE" ? "Trắc nghiệm" : "Tự luận"} ·{" "}
              {durationMinutes} phút · Đạt {passScore} điểm
            </p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-xl"
                onClick={closeCreateModal}
                disabled={isPending}
              >
                Huỷ
              </Button>
              <Button
                disabled={!canSubmit}
                onClick={handleSubmit}
                className="h-10 cursor-pointer rounded-xl bg-violet-700 px-6 hover:bg-violet-800"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  "Tạo quiz"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
