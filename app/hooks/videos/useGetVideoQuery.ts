import { VideoService } from "@/app/service/video.service";
import type { VideoType } from "@/app/service/record.service";
import { useQuery } from "@tanstack/react-query";

export const useGetVideoQuery = (
  snapLessonId?: string,
  videoType?: VideoType,
) =>
  useQuery({
    queryKey: ["video", "play", snapLessonId, videoType],
    queryFn: () =>
      VideoService.getPlayVideos(snapLessonId as string, videoType as VideoType),
    enabled: Boolean(snapLessonId && videoType),
  });
