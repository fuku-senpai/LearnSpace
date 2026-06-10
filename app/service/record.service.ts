import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type CreateRecordPayload = {
  title: string;
  fileKey: string;
  snapLessonId: string;
};

export type CreateRecordResponse = {
  message?: string;
};

export type RecordItem = {
  id: string;
  title: string;
  fileKey: string;
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

  getRecordsByLesson: async (snapLessonId: string): Promise<RecordItem[]> => {
    const res: AxiosResponse<RecordItem[]> = await axiosClient.get(
      `/records?snapLessonId=${encodeURIComponent(snapLessonId)}`,
    );
    return res.data;
  },
};
