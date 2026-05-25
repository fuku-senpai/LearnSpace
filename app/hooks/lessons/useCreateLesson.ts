import { queryClient } from "@/app/lib/react-query";
import { CreateLessonPayload, CreateLessonResponse, LessonService } from "@/app/service/lesson.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};
export const useCreateLessonMutation = () => {
  return useMutation<
    CreateLessonResponse,
    AxiosError<ErrorResponse>,
    CreateLessonPayload
  >({
    mutationKey: ["createLesson"],
    mutationFn: (payload) => LessonService.createLesson(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lessons", variables.materialId],
      });
      queryClient.invalidateQueries({
        queryKey: ["materials"],
      });
    },
  });
};