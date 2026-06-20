import { queryClient } from "@/app/lib/react-query";
import {
  DeleteVideoResponse,
  VideoService,
} from "@/app/service/video.service";
import type { VideoType } from "@/app/service/record.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export type DeleteVideoVariables = {
  videoId: string;
  snapLessonId: string;
  videoType: VideoType;
  classroomId?: string;
};

export const useDeleteVideoMutation = () => {
  return useMutation<
    DeleteVideoResponse,
    AxiosError<ErrorResponse>,
    DeleteVideoVariables
  >({
    mutationKey: ["deleteVideo"],
    mutationFn: ({ videoId }) => VideoService.deleteVideo({ videoId }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["video", "play", variables.snapLessonId, variables.videoType],
      });
      queryClient.invalidateQueries({
        queryKey: ["video", "play", variables.snapLessonId],
      });
      if (variables.classroomId) {
        queryClient.invalidateQueries({
          queryKey: ["snap-materials", variables.classroomId],
        });
      }
    },
  });
};
