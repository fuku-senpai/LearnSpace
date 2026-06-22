import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  CreateLessonQuizVersionPayload,
  CreateLessonQuizVersionResponse,
  LessonQuizService,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
};

export type CreateLessonQuizVersionVariables = {
  lessonQuizId: string;
  payload: CreateLessonQuizVersionPayload;
};

export const useCreateLessonQuizVersionMutation = () =>
  useMutation<
    CreateLessonQuizVersionResponse,
    AxiosError<ErrorResponse>,
    CreateLessonQuizVersionVariables
  >({
    mutationKey: ["createLessonQuizVersion"],
    mutationFn: ({ lessonQuizId, payload }) =>
      LessonQuizService.createLessonQuizVersion(lessonQuizId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      queryClient.invalidateQueries({
        queryKey: ["lesson-quiz", variables.lessonQuizId],
      });
      if (data.lessonQuizId) {
        queryClient.invalidateQueries({
          queryKey: ["lesson-quiz", data.lessonQuizId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["lesson-quizzes"] });
    },
  });
