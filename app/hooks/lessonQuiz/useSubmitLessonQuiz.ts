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
  quizId: string;
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
    mutationFn: ({ quizId, payload }) =>
      LessonQuizService.submitQuiz(quizId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["quiz-result", variables.quizId],
      });
    },
  });
};
