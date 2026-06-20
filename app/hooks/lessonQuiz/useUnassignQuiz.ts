import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  LessonQuizService,
  UnassignQuizResponse,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export type UnassignQuizVariables = {
  snapLessonQuizId: string;
  snapLessonId: string;
  classroomId?: string;
};

export const useUnassignQuizMutation = () =>
  useMutation<
    UnassignQuizResponse,
    AxiosError<ErrorResponse>,
    UnassignQuizVariables
  >({
    mutationKey: ["unassignQuiz"],
    mutationFn: ({ snapLessonQuizId }) =>
      LessonQuizService.unassignQuiz(snapLessonQuizId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson-quizzes", variables.snapLessonId],
      });
      if (variables.classroomId) {
        queryClient.invalidateQueries({
          queryKey: ["snap-materials", variables.classroomId],
        });
      }
    },
  });
