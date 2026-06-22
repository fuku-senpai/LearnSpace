import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  LessonQuizService,
  UpdateLessonQuizQuestionsPayload,
  UpdateLessonQuizQuestionsResponse,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
};

export type UpdateLessonQuizQuestionsVariables = {
  quizId: string;
  payload: UpdateLessonQuizQuestionsPayload;
};

export const useUpdateLessonQuizQuestionsMutation = () =>
  useMutation<
    UpdateLessonQuizQuestionsResponse,
    AxiosError<ErrorResponse>,
    UpdateLessonQuizQuestionsVariables
  >({
    mutationKey: ["updateLessonQuizQuestions"],
    mutationFn: ({ quizId, payload }) =>
      LessonQuizService.updateLessonQuizQuestions(quizId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      queryClient.invalidateQueries({
        queryKey: ["lesson-quiz", variables.quizId],
      });
      queryClient.invalidateQueries({ queryKey: ["lesson-quizzes"] });
    },
  });
