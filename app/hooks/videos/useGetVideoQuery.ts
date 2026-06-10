import { VideoService } from "@/app/service/video.service";
import { useQuery } from "@tanstack/react-query";

export const useGetVideoQuery = (snapLessonId?: string) =>
  useQuery({
    queryKey: ["video", "play", snapLessonId],
    queryFn: () => VideoService.getPlayUrl(snapLessonId as string),
    enabled: Boolean(snapLessonId),
  });
