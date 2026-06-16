import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  CreateLessonQuizPayload,
  CreateLessonQuizResponse,
  LessonQuizService,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useCreateLessonQuizMutation = () =>
  useMutation<
    CreateLessonQuizResponse,
    AxiosError<ErrorResponse>,
    CreateLessonQuizPayload
  >({
    mutationKey: ["createLessonQuiz"],
    mutationFn: (payload) => LessonQuizService.createLessonQuiz(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
    },
  });
