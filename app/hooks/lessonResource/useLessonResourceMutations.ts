import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
import {
  DeleteLessonResourceResponse,
  LessonResourceService,
  UpdateLessonResourcePayload,
  UpdateLessonResourceResponse,
} from "@/app/service/lessonResource.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export type UpdateLessonResourceVariables = UpdateLessonResourcePayload & {
  snapLessonId: string;
  classroomId?: string;
};

export type DeleteLessonResourceVariables = {
  lessonResourceId: string;
  snapLessonId: string;
  classroomId?: string;
};

const invalidateLessonResourceQueries = (
  snapLessonId: string,
  classroomId?: string,
) => {
  queryClient.invalidateQueries({
    queryKey: ["lessonResources", snapLessonId],
  });
  if (classroomId) {
    queryClient.invalidateQueries({
      queryKey: ["snap-materials", classroomId],
    });
  }
};

export const useUpdateLessonResourceMutation = () =>
  useMutation<
    UpdateLessonResourceResponse,
    AxiosError<ErrorResponse>,
    UpdateLessonResourceVariables
  >({
    mutationKey: ["updateLessonResource"],
    mutationFn: ({ lessonResourceId, title, note }) =>
      LessonResourceService.updateLessonResource({
        lessonResourceId,
        title,
        note,
      }),
    onSuccess: (_data, variables) => {
      invalidateLessonResourceQueries(
        variables.snapLessonId,
        variables.classroomId,
      );
    },
  });

export const useDeleteLessonResourceMutation = () =>
  useMutation<
    DeleteLessonResourceResponse,
    AxiosError<ErrorResponse>,
    DeleteLessonResourceVariables
  >({
    mutationKey: ["deleteLessonResource"],
    mutationFn: ({ lessonResourceId }) =>
      LessonResourceService.deleteLessonResource(lessonResourceId),
    onSuccess: (_data, variables) => {
      invalidateLessonResourceQueries(
        variables.snapLessonId,
        variables.classroomId,
      );
    },
  });
