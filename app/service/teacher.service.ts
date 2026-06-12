import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type TeacherItem = {
  teacherId: string;
  fullName: string;
  email: string;
  avatar: string | null;
  specialization: string | null;
  yearsExperience: number | null;
};

export type TeacherClassroom = {
  classroomId: string;
  name: string;
  code?: string;
  description?: string;
  status?: string;
  totalStudent?: number;
  startDate?: string;
  endDate?: string;
};

export type GetAllTeachersFilter = {
  page?: number;
  size?: number;
  keyword?: string;
};

export type GetAllTeachersResponse = {
  items: TeacherItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type TeacherScheduleStatus = "ACTIVE" | "CLOSED";

export type TeacherScheduleItem = {
  classroomId: string;
  classroomName: string;
  classroomCode: string;
  classroomStatus: TeacherScheduleStatus;
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  studyMode: string;
  location: string | null;
  meetingUrl: string | null;
};

export type GetTeacherScheduleFilter = {
  teacherId: string;
  page?: number;
  size?: number;
  status?: TeacherScheduleStatus;
};

export type GetTeacherScheduleResponse = {
  schedules: TeacherScheduleItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export const TeacherService = {
  getAllTeachers: async (
    filter: GetAllTeachersFilter,
  ): Promise<GetAllTeachersResponse> => {
    const res: AxiosResponse<GetAllTeachersResponse> = await axiosClient.get(
      "/teachers",
      {
        params: {
          page: filter.page ?? 0,
          size: filter.size ?? 10,
          keyword: filter.keyword || undefined,
        },
      },
    );

    return res.data;
  },
  getTeacherSchedule: async (
    filter: GetTeacherScheduleFilter,
  ): Promise<GetTeacherScheduleResponse> => {
    const res: AxiosResponse<GetTeacherScheduleResponse> = await axiosClient.get(
      `/teachers/${filter.teacherId}/schedule`,
      {
        params: {
          page: filter.page ?? 0,
          size: filter.size ?? 10,
          status: filter.status || undefined,
        },
      },
    );

    return res.data;
  },
  getTeacherClassrooms: async (): Promise<TeacherClassroom[]> => {
    const res: AxiosResponse<TeacherClassroom[]> = await axiosClient.get(
      `/teacher/classrooms`,
    );

    return res.data;
  },
};
