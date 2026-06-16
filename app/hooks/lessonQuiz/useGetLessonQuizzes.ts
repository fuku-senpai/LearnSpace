"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LessonQuizService,
  mapAssignedQuizzesToListItems,
} from "@/app/service/lessonQuiz.service";

export const useGetLessonQuizzesQuery = (snapLessonId?: string) =>
  useQuery({
    queryKey: ["lesson-quizzes", snapLessonId],
    queryFn: async () => {
      const quizzes = await LessonQuizService.getLessonQuizzes(
        snapLessonId as string,
      );
      return mapAssignedQuizzesToListItems(quizzes);
    },
    enabled: Boolean(snapLessonId),
  });
