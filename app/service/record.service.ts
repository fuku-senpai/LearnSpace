import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type VideoType = "PREVIEW" | "AFTER_LESSON";

export type CreateRecordPayload = {
  title: string;
  videoType: VideoType;
  fileKey: string;
  snapLessonId: string;
};

export type CreateRecordResponse = {
  message?: string;
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
};
