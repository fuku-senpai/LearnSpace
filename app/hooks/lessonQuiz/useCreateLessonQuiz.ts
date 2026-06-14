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

type CreateLessonQuizVariables = CreateLessonQuizPayload & {
  classroomId?: string;
};

export const useCreateLessonQuizMutation = () =>
  useMutation<
    CreateLessonQuizResponse,
    AxiosError<ErrorResponse>,
    CreateLessonQuizVariables
  >({
    mutationKey: ["createLessonQuiz"],
    mutationFn: ({ classroomId: _classroomId, ...payload }) =>
      LessonQuizService.createLessonQuiz(payload),
    onSuccess: (_data, variables) => {
      if (variables.classroomId) {
        queryClient.invalidateQueries({
          queryKey: ["snap-materials", variables.classroomId],
        });
      }
    },
  });
