"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";

import { useGetLessonQuizQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuiz";
import type { QuizQuestionDetail, QuizType } from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type QuizDetailDialogProps = {
  quizId: string | null;
  fallbackTitle?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const quizTypeLabels: Record<QuizType, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  ESSAY: "Tự luận",
};

const getQuestionPreview = (content: string) => {
  const text = content.trim();
  if (!text) return "Chưa có nội dung";
  return text.length > 48 ? `${text.slice(0, 48)}...` : text;
};

function ReadOnlyField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div
        className={cn(
          "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800",
          multiline ? "min-h-[76px] whitespace-pre-wrap leading-relaxed" : "min-h-10",
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

export function QuizDetailDialog({
  quizId,
  fallbackTitle,
  open,
  onOpenChange,
}: QuizDetailDialogProps) {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const { data: quiz, isLoading, error, refetch } = useGetLessonQuizQuery(
    open ? (quizId ?? undefined) : undefined,
  );

  const questions = quiz?.questions ?? [];
  const activeQuestion = questions[activeQuestionIndex];

  useEffect(() => {
    if (open) setActiveQuestionIndex(0);
  }, [open, quizId]);

  useEffect(() => {
    if (activeQuestionIndex >= questions.length && questions.length > 0) {
      setActiveQuestionIndex(questions.length - 1);
    }
  }, [activeQuestionIndex, questions.length]);

  const closeDialog = () => onOpenChange(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
        else onOpenChange(true);
      }}
    >
      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] max-w-[min(96vw,80rem)] flex-col gap-0 overflow-hidden rounded-2xl border-slate-200 p-0 sm:max-w-7xl">
        <div className="flex items-center gap-4 border-b border-slate-200 bg-linear-to-r from-sky-50/80 via-white to-slate-50 px-6 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-700 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Chi tiết đề
            </DialogTitle>
            <DialogDescription className="mt-0.5 truncate text-sm text-slate-500">
              {quiz?.title ?? fallbackTitle ?? "Xem nội dung câu hỏi và đáp án"}
            </DialogDescription>
          </div>
          {quiz ? (
            <span className="hidden shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 sm:inline">
              {quiz.questions.length} câu hỏi
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-24 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            Đang tải chi tiết đề...
          </div>
        ) : error ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-rose-800">
              Không thể tải chi tiết đề
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
        ) : quiz ? (
          <>
            <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="space-y-4 border-b border-slate-200 bg-slate-50/50 p-5 lg:border-r lg:border-b-0">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Thông tin đề
                </p>

                <div className="space-y-4">
                  <ReadOnlyField label="Tiêu đề" value={quiz.title} />
                  <ReadOnlyField
                    label="Mô tả"
                    value={quiz.description}
                    multiline
                  />
                  <ReadOnlyField
                    label="Loại đề"
                    value={quizTypeLabels[quiz.quizType]}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ReadOnlyField
                      label="Thời gian"
                      value={`${quiz.durationMinutes} phút`}
                    />
                    <ReadOnlyField
                      label="Điểm đạt"
                      value={String(quiz.passScore)}
                    />
                  </div>
                </div>
              </aside>

              <section className="flex min-h-0 flex-col">
                <div className="border-b border-slate-100 px-5 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Nội dung câu hỏi
                  </p>
                  <p className="text-xs text-slate-500">
                    {quiz.quizType === "ESSAY"
                      ? "Câu hỏi tự luận và đáp án mẫu"
                      : "Câu hỏi trắc nghiệm và đáp án đúng"}
                  </p>
                </div>

                <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="max-h-[min(52vh,520px)] space-y-1 overflow-y-auto border-b border-slate-100 bg-slate-50/40 p-3 lg:max-h-none lg:border-r lg:border-b-0">
                    {questions.map((question, questionIndex) => {
                      const isActive = questionIndex === activeQuestionIndex;

                      return (
                        <button
                          key={question.questionId}
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
                                : "bg-emerald-100 text-emerald-700",
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
                              {getQuestionPreview(question.content)}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5 block text-xs",
                                isActive ? "text-sky-100" : "text-slate-500",
                              )}
                            >
                              {question.points} điểm
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {activeQuestion ? (
                    <QuestionDetailPanel
                      question={activeQuestion}
                      questionIndex={activeQuestionIndex}
                      totalQuestions={questions.length}
                      quizType={quiz.quizType}
                      onPrev={() =>
                        setActiveQuestionIndex((index) => Math.max(0, index - 1))
                      }
                      onNext={() =>
                        setActiveQuestionIndex((index) =>
                          Math.min(questions.length - 1, index + 1),
                        )
                      }
                    />
                  ) : (
                    <div className="flex min-h-[320px] items-center justify-center p-5 text-sm text-slate-500">
                      Chưa có câu hỏi
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-6 py-4">
              <p className="text-xs text-slate-500">
                {quizTypeLabels[quiz.quizType]} · {quiz.durationMinutes} phút ·
                Đạt {quiz.passScore} điểm
              </p>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer rounded-xl"
                onClick={closeDialog}
              >
                Đóng
              </Button>
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function QuestionDetailPanel({
  question,
  questionIndex,
  totalQuestions,
  quizType,
  onPrev,
  onNext,
}: {
  question: QuizQuestionDetail;
  questionIndex: number;
  totalQuestions: number;
  quizType: QuizType;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex max-h-[min(52vh,520px)] min-h-[320px] flex-col overflow-y-auto p-5 lg:max-h-none">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-slate-900">
            Câu {questionIndex + 1}
          </p>
          <p className="text-xs text-slate-500">
            {questionIndex + 1} / {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={onPrev}
            disabled={questionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 cursor-pointer"
            onClick={onNext}
            disabled={questionIndex >= totalQuestions - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_120px]">
          <ReadOnlyField
            label="Nội dung câu hỏi"
            value={question.content}
            multiline
          />
          <ReadOnlyField label="Điểm" value={String(question.points)} />
        </div>

        {quizType === "ESSAY" ? (
          <ReadOnlyField
            label="Đáp án mẫu"
            value={question.essayAnswer ?? ""}
            multiline
          />
        ) : (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Đáp án — đáp án đúng được đánh dấu
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => (
                <div
                  key={option.optionId}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border bg-white p-2.5",
                    option.correct
                      ? "border-emerald-300 ring-1 ring-emerald-200"
                      : "border-slate-200",
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      "h-5 w-5 shrink-0",
                      option.correct ? "text-emerald-600" : "text-slate-300",
                    )}
                  />
                  <span className="min-w-0 flex-1 text-sm text-slate-800">
                    {option.content}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
