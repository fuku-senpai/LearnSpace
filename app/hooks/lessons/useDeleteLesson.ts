import { queryClient } from "@/app/lib/react-query";
import {
  DeleteLessonPayload,
  DeleteLessonResponse,
  LessonService,
} from "@/app/service/lesson.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

type DeleteLessonVariables = DeleteLessonPayload & {
  materialId: string;
};

export const useDeleteLessonMutation = () => {
  return useMutation<
    DeleteLessonResponse,
    AxiosError<ErrorResponse>,
    DeleteLessonVariables
  >({
    mutationKey: ["deleteLesson"],
    mutationFn: ({ lessonId }) => LessonService.deleteLesson({ lessonId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lessons", variables.materialId],
      });
    },
  });
};
