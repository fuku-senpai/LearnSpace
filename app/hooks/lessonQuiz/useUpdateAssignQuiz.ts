import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  LessonQuizService,
  UpdateAssignQuizPayload,
  UpdateAssignQuizResponse,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

type UpdateAssignQuizVariables = UpdateAssignQuizPayload & {
  snapLessonQuizId: string;
  snapLessonId: string;
  classroomId?: string;
};

export const useUpdateAssignQuizMutation = () =>
  useMutation<
    UpdateAssignQuizResponse,
    AxiosError<ErrorResponse>,
    UpdateAssignQuizVariables
  >({
    mutationKey: ["updateAssignQuiz"],
    mutationFn: ({
      snapLessonQuizId,
      snapLessonId: _snapLessonId,
      classroomId: _classroomId,
      ...payload
    }) => LessonQuizService.updateAssignQuiz(snapLessonQuizId, payload),
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
