import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type UploadVideoPayload = {
  file: File;
};

export type UploadVideoResponse = string;

export type PresignVideoResponse = {
  uploadUrl: string;
  fileKey: string;
};

export type PlayVideoResponse = {
  url: string;
};

export const VideoService = {
  uploadVideo: async (file: File, ): Promise<UploadVideoResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res: AxiosResponse<UploadVideoResponse> = await axiosClient.post(
      "/video/upload_s3",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return res.data;
  },
  getPresignedUrl: async (data: {
    fileName: string;
    fileType: string;
  }): Promise<PresignVideoResponse> => {
    const res: AxiosResponse<PresignVideoResponse> = await axiosClient.post(
      "/video/presign",
      data,
    );
    return res.data;
  },

  getPlayUrl: async (snapLessonId: string): Promise<PlayVideoResponse> => {
    const res: AxiosResponse<PlayVideoResponse> = await axiosClient.get(
      `/video/getVideos?snapLessonId=${encodeURIComponent(snapLessonId)}`,
    );
    return res.data;
  },
};
