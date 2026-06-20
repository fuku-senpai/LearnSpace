import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type CreateLessonResourcePayload = {
  title: string;
  type: string;
  urls: string[];
  note?: string;
  snapLessonId: string;
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

export type UpdateLessonResourcePayload = {
  lessonResourceId: string;
  title: string;
  note?: string;
};

export type UpdateLessonResourceResponse = {
  message?: string;
};

export type DeleteLessonResourceResponse = {
  message?: string;
};

export const LessonResourceService = {
  createLessonResource: async (
    payload: CreateLessonResourcePayload,
  ): Promise<CreateLessonResourceResponse> => {
    const res: AxiosResponse<CreateLessonResourceResponse> =
      await axiosClient.post("/lessonResource", payload);
    return res.data;
  },

  getLessonResources: async (
    snapLessonId: string,
  ): Promise<LessonResourceItem[]> => {
    const res: AxiosResponse<LessonResourceItem[]> = await axiosClient.get(
      `/lessonResource?snapLessonId=${encodeURIComponent(snapLessonId)}`,
    );
    return res.data;
  },

  updateLessonResource: async ({
    lessonResourceId,
    title,
    note,
  }: UpdateLessonResourcePayload): Promise<UpdateLessonResourceResponse> => {
    const res: AxiosResponse<UpdateLessonResourceResponse> =
      await axiosClient.put(`/lessonResource/${lessonResourceId}`, {
        title,
        note: note ?? "",
      });
    return res.data;
  },

  deleteLessonResource: async (
    lessonResourceId: string,
  ): Promise<DeleteLessonResourceResponse> => {
    const res: AxiosResponse<DeleteLessonResourceResponse> =
      await axiosClient.delete(`/lessonResource/${lessonResourceId}`);
    return res.data;
  },
};
