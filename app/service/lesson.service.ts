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
}