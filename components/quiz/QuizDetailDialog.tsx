"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
} from "lucide-react";

import { useGetLessonQuizQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuiz";
import type {
  LessonQuizDetail,
  QuizQuestionDetail,
  QuizType,
} from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { QuizCodeBadge } from "./QuizCodeBadge";

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

const getQuestionPreview = (content: string, maxLength = 48) => {
  const text = content.trim();
  if (!text) return "Chưa có nội dung";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
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
          "rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 wrap-break-word",
          multiline ? "min-h-[76px] whitespace-pre-wrap leading-relaxed" : "min-h-10",
        )}
      >
        {value || "—"}
      </div>
    </div>
  );
}

function QuizInfoAside({ quiz }: { quiz: LessonQuizDetail }) {
  return (
    <>
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Thông tin đề
      </p>

      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4">
        <p className="text-xs font-semibold tracking-wide text-amber-800 uppercase">
          Mã đề
        </p>
        <QuizCodeBadge
          code={quiz.lessonQuizCode}
          size="md"
          showHint
          className="mt-2"
        />
      </div>

      <div className="space-y-4">
        <ReadOnlyField label="Tiêu đề" value={quiz.title} />
        <ReadOnlyField label="Mô tả" value={quiz.description} multiline />
                  <ReadOnlyField
                    label="Loại đề"
                    value={quizTypeLabels[quiz.quizType]}
                  />
                  <ReadOnlyField
                    label="Phiên bản"
                    value={
                      typeof quiz.version === "number"
                        ? `v${quiz.version}`
                        : "—"
                    }
                  />
        <div className="grid grid-cols-2 gap-3">
          <ReadOnlyField
            label="Thời gian"
            value={`${quiz.durationMinutes} phút`}
          />
          <ReadOnlyField label="Điểm đạt" value={String(quiz.passScore)} />
        </div>
      </div>
    </>
  );
}

function MobileQuizSummary({ quiz }: { quiz: LessonQuizDetail }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="shrink-0 border-b border-slate-200 bg-slate-50/70 lg:hidden">
      <div className="space-y-3 px-4 py-3 sm:px-5">
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3">
          <p className="text-[10px] font-semibold tracking-wide text-amber-800 uppercase">
            Mã đề
          </p>
          <QuizCodeBadge
            code={quiz.lessonQuizCode}
            size="sm"
            showHint
            className="mt-1.5"
          />
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-medium text-sky-800">
            {quizTypeLabels[quiz.quizType]}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            {quiz.durationMinutes} phút
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            Đạt {quiz.passScore} điểm
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600">
            {quiz.questions.length} câu
          </span>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm font-medium text-slate-700"
        >
          <span className="truncate pr-2">{quiz.title}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {expanded ? (
        <div className="space-y-4 border-t border-slate-200 px-4 py-4 sm:px-5">
          <ReadOnlyField label="Tiêu đề" value={quiz.title} />
          <ReadOnlyField label="Mô tả" value={quiz.description} multiline />
        </div>
      ) : null}
    </div>
  );
}

function QuestionNav({
  questions,
  activeQuestionIndex,
  onSelect,
  layout,
}: {
  questions: QuizQuestionDetail[];
  activeQuestionIndex: number;
  onSelect: (index: number) => void;
  layout: "mobile" | "desktop";
}) {
  const isMobile = layout === "mobile";

  return (
    <div
      className={cn(
        isMobile
          ? "flex gap-2 overflow-x-auto px-4 py-3 sm:px-5 [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          : "max-h-none space-y-1 overflow-y-auto p-3",
      )}
    >
      {questions.map((question, questionIndex) => {
        const isActive = questionIndex === activeQuestionIndex;

        return (
          <button
            key={question.questionId}
            type="button"
            onClick={() => onSelect(questionIndex)}
            className={cn(
              "cursor-pointer text-left transition",
              isMobile
                ? "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2"
                : "flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5",
              isActive
                ? "bg-sky-700 text-white shadow-md"
                : "bg-white text-slate-700 ring-1 ring-slate-200/80 hover:ring-sky-200",
            )}
          >
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                isMobile ? "h-7 w-7" : "h-7 w-7",
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-700",
              )}
            >
              {questionIndex + 1}
            </span>
            {!isMobile ? (
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
            ) : (
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive ? "text-white" : "text-slate-600",
                )}
              >
                {question.points}đ
              </span>
            )}
          </button>
        );
      })}
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
      <DialogContent className="fixed inset-0 flex h-dvh max-h-dvh w-full max-w-full translate-none flex-col gap-0 overflow-hidden rounded-none border-slate-200 p-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-auto sm:max-h-[92vh] sm:w-[calc(100%-1.5rem)] sm:max-w-[min(96vw,80rem)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl lg:max-w-7xl">
        <div className="flex shrink-0 items-start gap-3 border-b border-slate-200 bg-linear-to-r from-sky-50/80 via-white to-slate-50 px-4 py-3 sm:items-center sm:gap-4 sm:px-6 sm:py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 pr-8 sm:pr-0">
            <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
              Chi tiết đề
            </DialogTitle>
            <DialogDescription className="mt-0.5 line-clamp-2 text-sm text-slate-500 sm:truncate">
              {quiz?.title ?? fallbackTitle ?? "Xem nội dung câu hỏi và đáp án"}
            </DialogDescription>
          </div>
          {quiz ? (
            <span className="hidden shrink-0 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800 md:inline">
              {quiz.questions.length} câu hỏi
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center gap-2 py-16 text-sm text-slate-500 sm:py-24">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            Đang tải chi tiết đề...
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16">
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="hidden min-h-0 space-y-4 overflow-y-auto border-b border-slate-200 bg-slate-50/50 p-5 lg:block lg:border-r lg:border-b-0">
                <QuizInfoAside quiz={quiz} />
              </aside>

              <MobileQuizSummary quiz={quiz} />

              <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="hidden shrink-0 border-b border-slate-100 px-5 py-3 lg:block">
                  <p className="text-sm font-semibold text-slate-900">
                    Nội dung câu hỏi
                  </p>
                  <p className="text-xs text-slate-500">
                    {quiz.quizType === "ESSAY"
                      ? "Câu hỏi tự luận và đáp án mẫu"
                      : "Câu hỏi trắc nghiệm và đáp án đúng"}
                  </p>
                </div>

                <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="shrink-0 border-b border-slate-100 bg-slate-50/40 lg:max-h-none lg:overflow-y-auto lg:border-r lg:border-b-0">
                    <p className="px-4 pt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase lg:hidden">
                      Danh sách câu hỏi
                    </p>
                    <div className="lg:hidden">
                      <QuestionNav
                        layout="mobile"
                        questions={questions}
                        activeQuestionIndex={activeQuestionIndex}
                        onSelect={setActiveQuestionIndex}
                      />
                    </div>
                    <div className="hidden lg:block">
                      <QuestionNav
                        layout="desktop"
                        questions={questions}
                        activeQuestionIndex={activeQuestionIndex}
                        onSelect={setActiveQuestionIndex}
                      />
                    </div>
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
                    <div className="flex min-h-[200px] flex-1 items-center justify-center p-5 text-sm text-slate-500 sm:min-h-[320px]">
                      Chưa có câu hỏi
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
              <p className="text-center text-xs text-slate-500 sm:text-left">
                {quizTypeLabels[quiz.quizType]} · {quiz.durationMinutes} phút ·
                Đạt {quiz.passScore} điểm
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full cursor-pointer rounded-xl sm:w-auto"
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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-slate-900">
            Câu {questionIndex + 1}
          </p>
          <p className="text-xs text-slate-500">
            {questionIndex + 1} / {totalQuestions}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px] lg:grid-cols-[minmax(0,1fr)_120px]">
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
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-3 sm:p-4">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              Đáp án — đáp án đúng được đánh dấu
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {question.options.map((option) => (
                <div
                  key={option.optionId}
                  className={cn(
                    "flex items-start gap-2 rounded-xl border bg-white p-2.5 sm:items-center",
                    option.correct
                      ? "border-emerald-300 ring-1 ring-emerald-200"
                      : "border-slate-200",
                  )}
                >
                  <CheckCircle2
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0 sm:mt-0",
                      option.correct ? "text-emerald-600" : "text-slate-300",
                    )}
                  />
                  <span className="min-w-0 flex-1 text-sm text-slate-800 wrap-break-word">
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
