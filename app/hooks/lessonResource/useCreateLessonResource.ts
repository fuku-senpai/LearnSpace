import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateLessonResourcePayload,
  CreateLessonResourceResponse,
  LessonResourceService,
} from "@/app/service/lessonResource.service";
import { queryClient } from "@/app/lib/react-query";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useCreateLessonResourceMutation = () =>useMutation<
    CreateLessonResourceResponse,
    AxiosError<ErrorResponse>,
    CreateLessonResourcePayload
  >({
    mutationKey: ["createLessonResource"],
    mutationFn: (payload) => LessonResourceService.createLessonResource(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lessonResources", variables.lessonId],
      });
    },
  });
