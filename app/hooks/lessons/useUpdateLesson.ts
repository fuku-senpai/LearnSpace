import { queryClient } from "@/app/lib/react-query";
import {
  LessonService,
  UpdateLessonPayload,
  UpdateLessonResponse,
} from "@/app/service/lesson.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

type UpdateLessonVariables = UpdateLessonPayload & {
  materialId: string;
};

export const useUpdateLessonMutation = () => {
  return useMutation<
    UpdateLessonResponse,
    AxiosError<ErrorResponse>,
    UpdateLessonVariables
  >({
    mutationKey: ["updateLesson"],
    mutationFn: ({ lessonId, title, lessonOrder }) =>
      LessonService.updateLesson({ lessonId, title, lessonOrder }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lessons", variables.materialId],
      });
    },
  });
};
