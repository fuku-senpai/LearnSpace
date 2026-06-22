import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  LessonQuizService,
  UpdateLessonQuizPayload,
  UpdateLessonQuizResponse,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export type UpdateLessonQuizVariables = {
  lessonQuizId: string;
  payload: UpdateLessonQuizPayload;
};

export const useUpdateLessonQuizMutation = () =>
  useMutation<
    UpdateLessonQuizResponse,
    AxiosError<ErrorResponse>,
    UpdateLessonQuizVariables
  >({
    mutationKey: ["updateLessonQuiz"],
    mutationFn: ({ lessonQuizId, payload }) =>
      LessonQuizService.updateLessonQuiz(lessonQuizId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      queryClient.invalidateQueries({
        queryKey: ["lesson-quiz", variables.lessonQuizId],
      });
      queryClient.invalidateQueries({ queryKey: ["lesson-quizzes"] });
    },
  });
