import { VideoService } from "@/app/service/video.service";
import { useMutation } from "@tanstack/react-query";

export const usePresignVideo = () => {
  return useMutation({
    mutationFn: VideoService.getPresignedUrl,
  });
};