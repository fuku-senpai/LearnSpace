"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ClipboardList,
  Clock,
  FileText,
  Loader2,
  PlayCircle,
  Target,
  Timer,
} from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useGetLessonQuizQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuiz";
import { useSubmitLessonQuizMutation } from "@/app/hooks/lessonQuiz/useSubmitLessonQuiz";
import {
  buildSubmitQuizPayload,
  type LessonQuizDetail,
  type SubmitQuizResponse,
} from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  lessonNavyButton,
  lessonNavyOutlineButton,
} from "./lessonTheme";

type QuizPhase = "ready" | "taking" | "finished" | "timeout";

type LessonQuizTakeModalProps = {
  quizId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewResult?: (quizId: string) => void;
};

type QuizResult = {
  earnedPoints: number;
  totalPoints: number;
  passed: boolean;
};

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const calculateResult = (
  quiz: LessonQuizDetail,
  answers: Record<string, string>,
): QuizResult => {
  let earnedPoints = 0;
  let totalPoints = 0;

  quiz.questions.forEach((question) => {
    totalPoints += question.points;

    if (quiz.quizType === "MULTIPLE_CHOICE") {
      const selectedOptionId = answers[question.questionId];
      const correctOption = question.options.find((option) => option.correct);
      if (selectedOptionId && selectedOptionId === correctOption?.optionId) {
        earnedPoints += question.points;
      }
    }
  });

  return {
    earnedPoints,
    totalPoints,
    passed: earnedPoints >= quiz.passScore,
  };
};

const resolveResult = (
  quiz: LessonQuizDetail,
  data: SubmitQuizResponse,
  answers: Record<string, string>,
): QuizResult => {
  if (
    typeof data.earnedPoints === "number" &&
    typeof data.totalPoints === "number"
  ) {
    return {
      earnedPoints: data.earnedPoints,
      totalPoints: data.totalPoints,
      passed:
        typeof data.passed === "boolean"
          ? data.passed
          : data.earnedPoints >= (data.passScore ?? quiz.passScore),
    };
  }

  return calculateResult(quiz, answers);
};

const optionLabel = (index: number) => String.fromCharCode(65 + index);

const MODAL_CLASS =
  "flex max-h-[92vh] w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-0 shadow-lg sm:max-w-3xl";

const getSubmitErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data) {
      const message = data.message;
      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }
  }

  return "Không thể nộp bài. Vui lòng thử lại.";
};

export function LessonQuizTakeModal({
  quizId,
  open,
  onOpenChange,
  onViewResult,
}: LessonQuizTakeModalProps) {
  const {
    data: quiz,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetLessonQuizQuery(open ? (quizId ?? undefined) : undefined);

  const { mutateAsync: submitQuiz, isPending: isSubmitting } =
    useSubmitLessonQuizMutation();

  const submittedRef = useRef(false);

  const [phase, setPhase] = useState<QuizPhase>("ready");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);

  const resetSession = useCallback(() => {
    setPhase("ready");
    setSecondsLeft(0);
    setActiveQuestionIndex(0);
    setAnswers({});
    setResult(null);
    submittedRef.current = false;
  }, []);

  useEffect(() => {
    if (!open) {
      resetSession();
    }
  }, [open, resetSession]);

  useEffect(() => {
    if (!open || !quiz) return;
    setPhase("ready");
    setActiveQuestionIndex(0);
    setAnswers({});
    setResult(null);
    setSecondsLeft(0);
  }, [open, quiz?.quizId, quiz]);

  useEffect(() => {
    if (!open || !quiz || phase !== "taking") return;

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, quiz?.quizId, phase, quiz]);

  useEffect(() => {
    if (!quiz || phase !== "taking" || secondsLeft > 0) return;
    setPhase("timeout");
  }, [quiz, phase, secondsLeft]);

  const performSubmit = useCallback(
    async (
      nextPhase: "finished" | "timeout",
      requireAllAnswers: boolean,
      submitAnswers: Record<string, string> = answers,
    ) => {
      if (!quiz || !quizId || isSubmitting || submittedRef.current) return false;

      if (requireAllAnswers) {
        const unanswered = quiz.questions.filter(
          (question) => !submitAnswers[question.questionId]?.trim(),
        );

        if (unanswered.length > 0) {
          toast.error(`Còn ${unanswered.length} câu chưa trả lời`);
          return false;
        }
      }

      submittedRef.current = true;

      try {
        const data = await submitQuiz({
          quizId,
          payload: buildSubmitQuizPayload(quiz, submitAnswers),
        });

        if (quiz.quizType === "MULTIPLE_CHOICE") {
          setResult(resolveResult(quiz, data, submitAnswers));
        }

        setPhase(nextPhase);
        toast.success(
          data.message ??
            (nextPhase === "timeout"
              ? "Đã nộp bài khi hết giờ"
              : "Nộp bài thành công"),
        );
        return true;
      } catch (submitError) {
        submittedRef.current = false;
        toast.error(getSubmitErrorMessage(submitError));
        return false;
      }
    },
    [quiz, quizId, isSubmitting, answers, submitQuiz],
  );

  const submitAbandoned = useCallback(async () => {
    if (!quiz || !quizId || submittedRef.current) return;

    submittedRef.current = true;

    try {
      await submitQuiz({
        quizId,
        payload: buildSubmitQuizPayload(quiz, {}),
      });
      toast.info("Đã thoát bài làm. Bài được nộp với điểm 0.");
    } catch (submitError) {
      submittedRef.current = false;
      toast.error(getSubmitErrorMessage(submitError));
    }
  }, [quiz, quizId, submitQuiz]);

  useEffect(() => {
    if (phase !== "timeout" || !quiz || !quizId || submittedRef.current) {
      return;
    }

    void performSubmit("timeout", false);
  }, [phase, quiz, quizId, performSubmit]);

  const activeQuestion = quiz?.questions[activeQuestionIndex];
  const answeredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter((question) =>
      Boolean(answers[question.questionId]?.trim()),
    ).length;
  }, [quiz, answers]);

  const progressPercent = quiz
    ? Math.round((answeredCount / Math.max(quiz.questions.length, 1)) * 100)
    : 0;

  const handleStartQuiz = () => {
    if (!quiz || quiz.questions.length === 0) return;
    setPhase("taking");
    setSecondsLeft(Math.max(1, quiz.durationMinutes) * 60);
  };

  const handleClose = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true);
      return;
    }

    if (isSubmitting) return;

    if (phase === "taking" && quiz && quizId) {
      void submitAbandoned().finally(() => onOpenChange(false));
      return;
    }

    onOpenChange(false);
  };

  const handleSubmit = () => {
    void performSubmit("finished", true);
  };

  const isUrgent = secondsLeft > 0 && secondsLeft <= 60;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={MODAL_CLASS}>
        <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200 shadow-sm">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="truncate text-lg font-semibold text-slate-900">
                  {phase === "ready" && !quiz
                    ? "Chuẩn bị làm bài"
                    : (quiz?.title ?? "Đang tải bài quiz...")}
                </DialogTitle>
                <DialogDescription className="mt-1 line-clamp-2 text-sm text-slate-500">
                  {phase === "ready" && !quiz
                    ? "Đang tải thông tin bài quiz..."
                    : (quiz?.description ?? "Làm bài trắc nghiệm buổi học")}
                </DialogDescription>
              </div>
            </div>

            {phase === "taking" && quiz ? (
              <div
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold tabular-nums ring-1 ring-slate-200 shadow-sm",
                  isUrgent ? "text-rose-700 ring-rose-200" : "text-slate-800",
                )}
              >
                <Clock className={cn("h-4 w-4", isUrgent && "animate-pulse")} />
                {formatTime(secondsLeft)}
              </div>
            ) : null}
          </div>

          {phase === "taking" && quiz ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>
                  Tiến độ {answeredCount}/{quiz.questions.length} câu
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-blue-900 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/30 px-6 py-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              Đang tải bài quiz...
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-3 h-6 w-6 text-slate-400" />
              <p className="font-medium text-slate-900">Không thể tải bài quiz</p>
              <p className="mt-1 text-sm text-slate-500">
                {error instanceof Error ? error.message : "Vui lòng thử lại"}
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 cursor-pointer"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : quiz && phase === "ready" ? (
            <div className="space-y-5">
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">
                  Sẵn sàng làm bài?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Đồng hồ bắt đầu khi bạn nhấn &quot;Bắt đầu&quot;. Hết giờ sẽ
                  tự động nộp bài.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    Thời gian
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {quiz.durationMinutes} phút
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <FileText className="h-3.5 w-3.5" />
                    Số câu
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {quiz.questions.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Target className="h-3.5 w-3.5" />
                    Điểm đạt
                  </div>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    ≥ {quiz.passScore}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm">
                <p className="text-xs font-medium text-slate-400">Lưu ý</p>
                <ul className="mt-2.5 space-y-2 text-sm text-slate-600">
                  <li className="flex gap-2">
                    <span className="text-slate-300">—</span>
                    Không đóng cửa sổ khi đang làm bài
                  </li>
                  <li className="flex gap-2">
                    <span className="text-slate-300">—</span>
                    Kiểm tra kỹ trước khi nộp
                  </li>
                </ul>
              </div>
            </div>
          ) : isSubmitting ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              Đang nộp bài...
            </div>
          ) : quiz && (phase === "finished" || phase === "timeout") ? (
            <div className="mx-auto max-w-md py-6 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 shadow-sm">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                {phase === "timeout" ? "Hết giờ" : "Đã nộp bài"}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {quiz.quizType === "ESSAY"
                  ? "Bài tự luận đã được ghi nhận. Giáo viên sẽ chấm sau."
                  : phase === "timeout"
                    ? "Bài làm đã được nộp tự động khi hết thời gian."
                    : "Bài làm của bạn đã được ghi nhận."}
              </p>

              {quiz.quizType === "MULTIPLE_CHOICE" && result ? (
                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                    <p className="text-xs text-slate-400">Điểm</p>
                    <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900">
                      {result.earnedPoints}
                      <span className="text-sm font-normal text-slate-400">
                        /{result.totalPoints}
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
                    <p className="text-xs text-slate-400">Kết quả</p>
                    <p
                      className={cn(
                        "mt-1 text-xl font-semibold",
                        result.passed ? "text-emerald-700" : "text-amber-700",
                      )}
                    >
                      {result.passed ? "Đạt" : "Chưa đạt"}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {onViewResult && quizId ? (
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "h-10 cursor-pointer rounded-lg px-6",
                    lessonNavyOutlineButton,
                  )}
                    onClick={() => {
                      onViewResult(quizId);
                      onOpenChange(false);
                    }}
                  >
                    Xem chi tiết kết quả
                  </Button>
                ) : null}
                <Button
                  type="button"
                  className={cn(
                    "h-10 cursor-pointer rounded-lg px-8",
                    lessonNavyButton,
                  )}
                  onClick={() => onOpenChange(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          ) : quiz && quiz.questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-800">Chưa có câu hỏi</p>
              <p className="mt-1 text-sm text-slate-500">
                Liên hệ giáo viên để cập nhật nội dung bài quiz.
              </p>
            </div>
          ) : quiz && activeQuestion ? (
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200 shadow-sm">
                      {activeQuestionIndex + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">
                          Câu {activeQuestionIndex + 1} / {quiz.questions.length}
                        </p>
                        {answers[activeQuestion.questionId]?.trim() ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                            <Check className="h-3 w-3" />
                            Đã làm
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
                            <Circle className="h-2.5 w-2.5" />
                            Chưa làm
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {activeQuestion.points} điểm
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
                  <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4">
                    <p className="text-[15px] leading-relaxed font-medium text-slate-900">
                      {activeQuestion.content}
                    </p>
                  </div>

                  <div className="px-5 py-4">
                    {quiz.quizType === "ESSAY" ? (
                      <Textarea
                        className="min-h-[140px] resize-y rounded-lg border-slate-200 bg-slate-50/30 focus-visible:ring-slate-400"
                        placeholder="Viết câu trả lời của bạn..."
                        value={answers[activeQuestion.questionId] ?? ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [activeQuestion.questionId]: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <div className="space-y-2.5">
                        {activeQuestion.options.map((option, optionIndex) => {
                          const isSelected =
                            answers[activeQuestion.questionId] ===
                            option.optionId;

                          return (
                            <button
                              key={option.optionId}
                              type="button"
                              onClick={() =>
                                setAnswers((prev) => ({
                                  ...prev,
                                  [activeQuestion.questionId]: option.optionId,
                                }))
                              }
                              className={cn(
                                "flex w-full cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 text-left text-sm transition-all",
                                isSelected
                                  ? "border-blue-900 bg-blue-50 shadow-sm"
                                  : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50",
                              )}
                            >
                              <span
                                className={cn(
                                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                                  isSelected
                                    ? "bg-blue-900 text-white"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                {optionLabel(optionIndex)}
                              </span>
                              <span className="leading-snug text-slate-800">
                                {option.content}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full shrink-0 rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm lg:w-52">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-slate-400">
                    Danh sách câu
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    {answeredCount}/{quiz.questions.length}
                  </p>
                </div>
                <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 lg:grid-cols-4">
                  {quiz.questions.map((question, index) => {
                    const isActive = index === activeQuestionIndex;
                    const isAnswered = Boolean(
                      answers[question.questionId]?.trim(),
                    );

                    return (
                      <button
                        key={question.questionId}
                        type="button"
                        onClick={() => setActiveQuestionIndex(index)}
                        title={
                          isAnswered
                            ? `Câu ${index + 1} - Đã làm`
                            : `Câu ${index + 1} - Chưa làm`
                        }
                        className={cn(
                          "relative flex h-9 cursor-pointer items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                          isActive
                            ? "border-blue-900 bg-blue-900 text-white shadow-sm"
                            : isAnswered
                              ? "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-400"
                              : "border-dashed border-slate-300 bg-white text-slate-400 hover:border-slate-400 hover:bg-slate-50",
                        )}
                      >
                        {isAnswered && !isActive ? (
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                        {isAnswered && isActive ? (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-emerald-300 bg-emerald-50 text-emerald-700">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                    Đã làm
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded border border-dashed border-slate-300 text-slate-400">
                      <Circle className="h-2 w-2" />
                    </span>
                    Chưa làm
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {quiz && phase === "ready" && !isLoading && !isError ? (
          <div className="flex shrink-0 items-center gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 cursor-pointer rounded-lg"
              onClick={() => onOpenChange(false)}
            >
              Để sau
            </Button>
            <Button
              type="button"
              className={cn("h-10 flex-1 cursor-pointer rounded-lg", lessonNavyButton)}
              onClick={handleStartQuiz}
              disabled={quiz.questions.length === 0}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              Bắt đầu làm bài
            </Button>
          </div>
        ) : null}

        {quiz && phase === "taking" && !isLoading && !isError ? (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 cursor-pointer rounded-lg"
                onClick={() =>
                  setActiveQuestionIndex((index) => Math.max(0, index - 1))
                }
                disabled={activeQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 cursor-pointer rounded-lg"
                onClick={() =>
                  setActiveQuestionIndex((index) =>
                    Math.min(quiz.questions.length - 1, index + 1),
                  )
                }
                disabled={activeQuestionIndex >= quiz.questions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="ml-2 hidden text-xs text-slate-400 sm:inline">
                <Timer className="mr-1 inline h-3 w-3" />
                {formatTime(secondsLeft)} còn lại
              </span>
            </div>
            <Button
              type="button"
              className={cn("h-10 cursor-pointer rounded-lg px-6", lessonNavyButton)}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang nộp...
                </>
              ) : (
                "Nộp bài"
              )}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
