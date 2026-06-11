import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";
export type CreateLessonPayload = {
  title: string;
  lessonOrder: number;
  materialId: string;
};
export type CreateLessonResponse = {
  message?: string; 
}
export type LessonItem = {
  id: string;
  title: string;
  lessonOrder: number;
};
export type UpdateLessonPayload = {
  lessonId: string;
  title: string;
  lessonOrder: number;
};
export type UpdateLessonResponse = {
  message?: string;
};
export type DeleteLessonPayload = {
  lessonId: string;
};
export type DeleteLessonResponse = {
  message?: string;
};
export const LessonService = {
    createLesson: async (payload: CreateLessonPayload): Promise<CreateLessonResponse> => {
    const res: AxiosResponse<CreateLessonResponse> = await axiosClient.post(
      "/lessons/create",
      payload,
    );
    return res.data;
    },
    getLessonsByMaterial: async (materialId: string): Promise<LessonItem[]> => {
      const res: AxiosResponse<LessonItem[]> = await axiosClient.get(
        `/lessons/${materialId}`,
      );
      return res.data;
    },
    updateLesson: async (
      payload: UpdateLessonPayload,
    ): Promise<UpdateLessonResponse> => {
      const res: AxiosResponse<UpdateLessonResponse> = await axiosClient.put(
        `/lessons/item/${payload.lessonId}`,
        {
          title: payload.title,
          lessonOrder: payload.lessonOrder,
        },
      );
      return res.data;
    },
    deleteLesson: async (
      payload: DeleteLessonPayload,
    ): Promise<DeleteLessonResponse> => {
      const res: AxiosResponse<DeleteLessonResponse> = await axiosClient.delete(
        `/lessons/item/${payload.lessonId}`,
      );
      return res.data;
    },
}