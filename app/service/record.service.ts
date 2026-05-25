import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type CreateRecordPayload = {
  title: string;
  videoUrl: string;
  lessonId: string;
};

export type CreateRecordResponse = {
  message?: string;
};

export type RecordItem = {
  id: string;
  title: string;
  videoUrl: string;
  createdAt: string;
};

export const RecordService = {
  createRecord: async (
    payload: CreateRecordPayload,
  ): Promise<CreateRecordResponse> => {
    const res: AxiosResponse<CreateRecordResponse> = await axiosClient.post(
      "/records",
      payload,
    );
    return res.data;
  },

  getRecordsByLesson: async (lessonId: string): Promise<RecordItem[]> => {
    const res: AxiosResponse<RecordItem[]> = await axiosClient.get(
      `/records?lessonId=${encodeURIComponent(lessonId)}`,
    );
    return res.data;
  },
};
