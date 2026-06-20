import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";
import type { VideoType } from "./record.service";

export type UploadVideoPayload = {
  file: File;
};

export type UploadVideoResponse = string;

export type PresignVideoResponse = {
  uploadUrl: string;
  fileKey: string;
};

export type PlayVideoItem = {
  id?: string;
  lessonVideoId?: string;
  title?: string;
  videoType?: VideoType;
  url: string;
};

export type DeleteVideoPayload = {
  videoId: string;
};

export type DeleteVideoResponse = {
  message?: string;
};

export type UpdateVideoPayload = {
  videoId: string;
  title: string;
  videoType: VideoType;
};

export type UpdateVideoResponse = {
  message?: string;
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

  getPlayVideos: async (
    snapLessonId: string,
    videoType: VideoType,
  ): Promise<PlayVideoItem[]> => {
    const res: AxiosResponse<PlayVideoItem[] | PlayVideoItem> =
      await axiosClient.get(
        `/video/getVideos?snapLessonId=${encodeURIComponent(snapLessonId)}&type=${videoType}`,
      );
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object" && "url" in data) return [data];
    return [];
  },

  deleteVideo: async ({
    videoId,
  }: DeleteVideoPayload): Promise<DeleteVideoResponse> => {
    const res: AxiosResponse<DeleteVideoResponse> = await axiosClient.delete(
      `/lessonVideo/${videoId}`,
    );
    return res.data;
  },

  updateVideo: async ({
    videoId,
    title,
    videoType,
  }: UpdateVideoPayload): Promise<UpdateVideoResponse> => {
    const res: AxiosResponse<UpdateVideoResponse> = await axiosClient.put(
      `/lessonVideo/${videoId}`,
      { title, videoType },
    );
    return res.data;
  },
};
