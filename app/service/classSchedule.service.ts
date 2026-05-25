import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type CreateClassSchedulePayload = {
  classroomId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  studyMode: string;
  location?: string;
  meetingUrl?: string;
};

export type CreateClassScheduleResponse = {
  message?: string;
};

export type ClassScheduleItem = {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  studyMode: string;
  location?: string | null;
  meetingUrl?: string | null;
};

export const ClassScheduleService = {
  createClassSchedule: async (
    payload: CreateClassSchedulePayload,
  ): Promise<CreateClassScheduleResponse> => {
    const { classroomId, ...body } = payload;
    const res: AxiosResponse<CreateClassScheduleResponse> = await axiosClient.post(
      `/schedules/${classroomId}`,
      body,
    );

    return res.data;
  },

  getClassSchedules: async (
    classroomId: string,
  ): Promise<ClassScheduleItem[]> => {
    const res: AxiosResponse<ClassScheduleItem[]> = await axiosClient.get(
      `/schedules/${classroomId}`,
    );

    return res.data;
  },
};