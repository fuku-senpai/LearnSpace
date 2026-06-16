"use client";

import { ClipboardList, Clock, Link2, Pencil, PlayCircle, Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LessonQuizListItem } from "@/app/service/lessonQuiz.service";
import {
  lessonNavyButton,
  lessonNavyGhostButton,
  lessonNavyOutlineButton,
} from "./lessonTheme";

type LessonQuizListProps = {
  lessonTitle?: string;
  quizzes?: LessonQuizListItem[];
  mode?: "teacher" | "student";
  activeQuizId?: string | null;
  isRefreshing?: boolean;
  onCreateClick?: () => void;
  onAssignClick?: () => void;
  onEditClick?: (quiz: LessonQuizListItem) => void;
  onQuizClick?: (quiz: LessonQuizListItem) => void;
  onResultClick?: (quiz: LessonQuizListItem) => void;
};

function QuizActions({
  quiz,
  onQuizClick,
  onResultClick,
}: {
  quiz: LessonQuizListItem;
  onQuizClick?: (quiz: LessonQuizListItem) => void;
  onResultClick?: (quiz: LessonQuizListItem) => void;
}) {
  const canTakeQuiz = Boolean(quiz.snapLessonQuizId);

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {onResultClick ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 cursor-pointer rounded-lg px-2.5 text-xs",
            lessonNavyGhostButton,
          )}
          disabled={!canTakeQuiz}
          onClick={() => onResultClick(quiz)}
        >
          Kết quả
        </Button>
      ) : null}
      {onQuizClick ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 cursor-pointer rounded-lg px-2.5 text-xs",
            lessonNavyOutlineButton,
          )}
          disabled={!canTakeQuiz}
          onClick={() => onQuizClick(quiz)}
        >
          <PlayCircle className="mr-1 h-3.5 w-3.5" />
          Làm bài
        </Button>
      ) : null}
    </div>
  );
}

function QuizMeta({ quiz }: { quiz: LessonQuizListItem }) {
  const quizTypeLabel =
    quiz.quizType === "MULTIPLE_CHOICE"
      ? "Trắc nghiệm"
      : quiz.quizType === "ESSAY"
        ? "Tự luận"
        : null;

  return (
    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
      {quizTypeLabel ? (
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
          {quizTypeLabel}
        </span>
      ) : null}
      {typeof quiz.durationMinutes === "number" ? (
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {quiz.durationMinutes} phút
        </span>
      ) : null}
      {typeof quiz.passScore === "number" ? (
        <span className="inline-flex items-center gap-1">
          <Target className="h-3 w-3" />
          Đạt {quiz.passScore}đ
        </span>
      ) : null}
      {typeof quiz.maxAttempts === "number" ? (
        <span>{quiz.maxAttempts} lần làm</span>
      ) : null}
      {quiz.required === true ? (
        <span className="font-medium text-amber-600">Bắt buộc</span>
      ) : null}
    </p>
  );
}

export function LessonQuizList({
  lessonTitle,
  quizzes = [],
  mode = "student",
  activeQuizId = null,
  onCreateClick,
  onAssignClick,
  onEditClick,
  onQuizClick,
  onResultClick,
  isRefreshing = false,
}: LessonQuizListProps) {
  const isTeacher = mode === "teacher";

  if (isTeacher) {
    return (
      <Card className="overflow-hidden border-slate-200/90 shadow-sm">
        <div className="border-b border-blue-100 bg-linear-to-r from-blue-50/90 via-white to-slate-50 px-5 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-900">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Bài tập buổi học
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">{lessonTitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isRefreshing ? (
                <span className="text-xs text-slate-400">Đang cập nhật...</span>
              ) : null}
              {onAssignClick ? (
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-10 cursor-pointer rounded-xl px-4 shadow-sm",
                  lessonNavyOutlineButton,
                )}
                onClick={onAssignClick}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Gắn đề từ kho
              </Button>
            ) : onCreateClick ? (
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "h-10 cursor-pointer rounded-xl px-4 shadow-sm",
                  lessonNavyOutlineButton,
                )}
                onClick={onCreateClick}
              >
                <Plus className="mr-2 h-4 w-4" />
                Tạo quiz mới
              </Button>
            ) : null}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {quizzes.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-blue-200/80 bg-blue-50/30 px-6 py-14 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-900 shadow-sm ring-1 ring-blue-100">
                <ClipboardList className="h-7 w-7" />
              </div>
              <p className="text-base font-medium text-slate-800">
                Chưa có bài tập
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {onAssignClick
                  ? "Gắn đề từ Kho đề vào buổi học này."
                  : onCreateClick
                    ? "Tạo quiz trắc nghiệm hoặc tự luận cho buổi học này"
                    : "Chưa gắn đề nào. Tạo đề tại Kho đề rồi gắn vào buổi học."}
              </p>
              {onAssignClick ? (
                <Button
                  type="button"
                  className={cn(
                    "mt-6 h-10 cursor-pointer rounded-xl px-5 shadow-sm",
                    lessonNavyButton,
                  )}
                  onClick={onAssignClick}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  Gắn đề từ kho
                </Button>
              ) : onCreateClick ? (
                <Button
                  type="button"
                  className={cn(
                    "mt-6 h-10 cursor-pointer rounded-xl px-5 shadow-sm",
                    lessonNavyButton,
                  )}
                  onClick={onCreateClick}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo quiz đầu tiên
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="relative pl-8">
              <div className="absolute top-2 bottom-2 left-3 w-px bg-blue-300/80" />
              <div className="space-y-2">
                <p className="mb-3 text-xs font-medium tracking-wide text-slate-400 uppercase">
                  {quizzes.length} bài tập
                </p>
                {quizzes.map((quiz, index) => (
                  <article
                    key={quiz.snapLessonQuizId ?? quiz.quizId}
                    className="relative rounded-xl border border-slate-200/90 bg-white p-4 pl-5 shadow-sm transition hover:border-blue-200"
                  >
                    <span className="absolute top-5 -left-5 h-px w-4 bg-blue-300/80" />
                    <div className="flex items-start gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-900 ring-1 ring-blue-100">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-semibold text-slate-900">
                          {quiz.title}
                        </h4>
                        {quiz.description ? (
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                            {quiz.description}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-slate-400">
                            Không có mô tả
                          </p>
                        )}
                        <div className="mt-2">
                          <QuizMeta quiz={quiz} />
                        </div>
                      </div>
                      {onEditClick && quiz.snapLessonQuizId ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 shrink-0 cursor-pointer rounded-lg px-2.5 text-xs",
                            lessonNavyOutlineButton,
                          )}
                          onClick={() => onEditClick(quiz)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Sửa
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    );
  }

  const totalQuizzes = quizzes.length;

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-blue-50/40 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <ClipboardList className="h-4 w-4 shrink-0 text-blue-800" />
          <span className="shrink-0 text-sm font-semibold text-blue-950">
            Bài tập
          </span>
          {lessonTitle ? (
            <span className="truncate text-xs text-slate-400">
              · {lessonTitle}
            </span>
          ) : null}
        </div>
        <span className="shrink-0 text-xs text-slate-500">
          {totalQuizzes} bài
        </span>
      </div>

      {quizzes.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-700">Chưa có bài tập</p>
          <p className="mt-1 text-xs text-slate-500">
            Giáo viên chưa thêm bài tập cho buổi học này
          </p>
        </div>
      ) : (
        <div className="relative px-4 py-4">
          <div className="absolute top-5 bottom-5 left-[23px] w-px bg-blue-300/80" />
          <div className="relative pl-8">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md bg-blue-50/80 px-3 py-2 text-left ring-1 ring-blue-200/80"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded bg-blue-900 text-[11px] font-semibold text-white">
                1
              </span>
              <span className="truncate text-sm font-semibold text-blue-950">
                {lessonTitle}
              </span>
            </button>

            <div className="ml-3 mt-2 space-y-1 border-l border-blue-200/80 py-1 pl-4">
              {quizzes.map((quiz, index) => {
                const isActiveQuiz = activeQuizId === quiz.quizId;

                return (
                  <div
                    key={quiz.snapLessonQuizId ?? quiz.quizId}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors",
                      isActiveQuiz
                        ? "bg-blue-50 ring-1 ring-blue-200/80"
                        : "hover:bg-slate-50",
                    )}
                  >
                    <span className="w-5 shrink-0 text-center text-[11px] font-medium text-slate-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {quiz.title}
                      </p>
                      <QuizMeta quiz={quiz} />
                    </div>
                    <QuizActions
                      quiz={quiz}
                      onQuizClick={onQuizClick}
                      onResultClick={onResultClick}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
