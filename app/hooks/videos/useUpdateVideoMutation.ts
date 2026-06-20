import { queryClient } from "@/app/lib/react-query";
import {
  UpdateVideoResponse,
  VideoService,
} from "@/app/service/video.service";
import type { VideoType } from "@/app/service/record.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export type UpdateVideoVariables = {
  videoId: string;
  title: string;
  videoType: VideoType;
  snapLessonId: string;
  previousVideoType?: VideoType;
  classroomId?: string;
};

const invalidateVideoQueries = (
  snapLessonId: string,
  videoTypes: VideoType[],
  classroomId?: string,
) => {
  videoTypes.forEach((type) => {
    queryClient.invalidateQueries({
      queryKey: ["video", "play", snapLessonId, type],
    });
  });
  queryClient.invalidateQueries({
    queryKey: ["video", "play", snapLessonId],
  });
  if (classroomId) {
    queryClient.invalidateQueries({
      queryKey: ["snap-materials", classroomId],
    });
  }
};

export const useUpdateVideoMutation = () => {
  return useMutation<
    UpdateVideoResponse,
    AxiosError<ErrorResponse>,
    UpdateVideoVariables
  >({
    mutationKey: ["updateVideo"],
    mutationFn: ({ videoId, title, videoType }) =>
      VideoService.updateVideo({ videoId, title, videoType }),
    onSuccess: (_data, variables) => {
      const types = new Set<VideoType>([
        variables.videoType,
        variables.previousVideoType,
      ].filter(Boolean) as VideoType[]);
      invalidateVideoQueries(
        variables.snapLessonId,
        [...types],
        variables.classroomId,
      );
    },
  });
};
