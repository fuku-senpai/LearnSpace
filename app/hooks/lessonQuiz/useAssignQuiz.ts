import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  AssignQuizPayload,
  AssignQuizResponse,
  LessonQuizService,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

type AssignQuizVariables = AssignQuizPayload & {
  classroomId?: string;
};

export const useAssignQuizMutation = () =>
  useMutation<
    AssignQuizResponse,
    AxiosError<ErrorResponse>,
    AssignQuizVariables
  >({
    mutationKey: ["assignQuiz"],
    mutationFn: ({ classroomId: _classroomId, ...payload }) =>
      LessonQuizService.assignQuiz(payload),
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
