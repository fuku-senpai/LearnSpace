"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

import { useGetLessonQuizzesQuery } from "@/app/hooks/lessonQuiz/useGetLessonQuizzes";
import type { LessonQuizListItem } from "@/app/service/lessonQuiz.service";
import { LessonQuizList } from "@/components/lesson/LessonQuizList";
import {
  AssignQuizDialog,
  type AssignQuizFromLessonContext,
} from "@/components/quiz/AssignQuizDialog";
import {
  EditAssignQuizDialog,
  type EditAssignQuizContext,
} from "@/components/quiz/EditAssignQuizDialog";

type LessonQuizPanelProps = {
  snapLessonId: string;
  lessonTitle: string;
  classroomId?: string;
};

export function LessonQuizPanel({
  snapLessonId,
  lessonTitle,
  classroomId,
}: LessonQuizPanelProps) {
  const [assignContext, setAssignContext] =
    useState<AssignQuizFromLessonContext | null>(null);
  const [editContext, setEditContext] = useState<EditAssignQuizContext | null>(
    null,
  );

  const {
    data: quizzes = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetLessonQuizzesQuery(snapLessonId);

  const defaultDisplayOrder = useMemo(
    () =>
      quizzes.reduce(
        (max, quiz) => Math.max(max, quiz.displayOrder ?? 0),
        0,
      ) + 1,
    [quizzes],
  );

  if (!snapLessonId) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Chọn buổi học để xem bài tập
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
        Đang tải bài tập...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-100 bg-rose-50/60 px-6 py-10 text-center text-sm text-rose-700">
        Không thể tải bài tập buổi học
      </div>
    );
  }

  const openAssignDialog = () => {
    if (!classroomId) return;

    setAssignContext({
      mode: "from-lesson",
      snapLessonId,
      lessonTitle,
      classroomId,
      defaultDisplayOrder,
    });
  };

  const openEditDialog = (quiz: LessonQuizListItem) => {
    if (!quiz.snapLessonQuizId) return;

    setEditContext({
      snapLessonQuizId: quiz.snapLessonQuizId,
      snapLessonId,
      lessonTitle,
      lessonQuizId: quiz.quizId,
      quizTitle: quiz.title,
      required: quiz.required ?? true,
      maxAttempts: quiz.maxAttempts ?? 1,
      displayOrder: quiz.displayOrder ?? 1,
      classroomId,
    });
  };

  return (
    <>
      <LessonQuizList
        lessonTitle={lessonTitle}
        quizzes={quizzes}
        mode="teacher"
        isRefreshing={isFetching && !isLoading}
        onAssignClick={classroomId ? openAssignDialog : undefined}
        onEditClick={openEditDialog}
      />

      <AssignQuizDialog
        open={Boolean(assignContext)}
        onOpenChange={(open) => {
          if (!open) setAssignContext(null);
        }}
        context={assignContext}
        onSuccess={() => refetch()}
      />

      <EditAssignQuizDialog
        open={Boolean(editContext)}
        onOpenChange={(open) => {
          if (!open) setEditContext(null);
        }}
        context={editContext}
        onSuccess={() => refetch()}
      />
    </>
  );
}
