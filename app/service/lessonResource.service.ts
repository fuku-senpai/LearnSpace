import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type CreateLessonResourcePayload = {
  title: string;
  type: string;
  urls: string[];
  lessonId: string;
};

export type CreateLessonResourceResponse = {
  message?: string;
};
export type LessonResourceItem = {
  id: string;
  title: string;
  note: string;
  type: string;
  urls: string[];
};

export const LessonResourceService = {
  createLessonResource: async (
    payload: CreateLessonResourcePayload,
  ): Promise<CreateLessonResourceResponse> => {
    const res: AxiosResponse<CreateLessonResourceResponse> =
      await axiosClient.post("/lessonResource", payload);
    return res.data;
  },
  getLessonResources: async (lessonId: string): Promise<LessonResourceItem[]> => { 
    const res: AxiosResponse<LessonResourceItem[]> = await axiosClient.get(
        `/lessonResource?lessonId=${encodeURIComponent(lessonId)}`);
    return res.data;
  }
};
