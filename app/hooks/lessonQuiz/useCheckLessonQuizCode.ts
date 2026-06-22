import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CheckLessonQuizCodeResponse,
  LessonQuizService,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
};

type CheckLessonQuizCodeVariables = {
  quizId: string;
  lessonQuizCode: string;
};

export const useCheckLessonQuizCodeMutation = () =>
  useMutation<
    CheckLessonQuizCodeResponse,
    AxiosError<ErrorResponse>,
    CheckLessonQuizCodeVariables
  >({
    mutationKey: ["checkLessonQuizCode"],
    mutationFn: ({ quizId, lessonQuizCode }) =>
      LessonQuizService.checkLessonQuizCode(quizId, {
        lessonQuizCode,
      }),
  });
