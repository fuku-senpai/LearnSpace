import { queryClient } from "@/app/lib/react-query";
import { UploadVideoPayload, UploadVideoResponse, VideoService } from "@/app/service/video.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};
export const useUploadVideoMutation = () => {
  return useMutation<
    UploadVideoResponse,
    AxiosError<ErrorResponse>,
    File
  >({
    mutationKey: ["uploadVideo"],
    mutationFn: (file) => VideoService.uploadVideo(file),
  });
};