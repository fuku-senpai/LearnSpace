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
  getTeacherClassrooms: async (): Promise<TeacherClassroom[]> => {
    const res: AxiosResponse<TeacherClassroom[]> = await axiosClient.get(
      `/teacher/classrooms`,
    );

    return res.data;
  },
};
