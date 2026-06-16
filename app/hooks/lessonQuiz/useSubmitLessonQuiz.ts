import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  LessonQuizService,
  SubmitQuizPayload,
  SubmitQuizResponse,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
};

type SubmitLessonQuizVariables = {
  snapLessonQuizId: string;
  payload: SubmitQuizPayload;
};

export const useSubmitLessonQuizMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    SubmitQuizResponse,
    AxiosError<ErrorResponse>,
    SubmitLessonQuizVariables
  >({
    mutationKey: ["submitLessonQuiz"],
    mutationFn: ({ snapLessonQuizId, payload }) =>
      LessonQuizService.submitQuiz(snapLessonQuizId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["quiz-result", variables.snapLessonQuizId],
      });
    },
  });
};
