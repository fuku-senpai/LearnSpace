import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";


export type PaginatedResponse<T> = {
  items: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: {
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    unpaged: boolean;
  };
  size: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  totalElements: number;
  totalPages: number;
};

export type CreateClassPayload = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
};
export type CreateClassResponse = {
  message?: string; 
}

export type EnrollClassroomPayload = {
  code: string;
};

export type EnrollClassroomResponse = {
  message?: string;
};

export type GetAllClassesFilter = {
  page: number;
  size: number;
  code: string;
  name: string; 
};
export type Class = {
  id: string;
  name: string;
  description: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  code: string;
  status: string;
  totalStudent: number;
  schedules: {
    id: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    studyMode: string;
    location: string | null;
    meetingUrl: string | null;
  }[];
};

export type MyClass = Class;


export const ClassService = {
  createClass: async (payload: CreateClassPayload): Promise<CreateClassResponse> => {
    const res: AxiosResponse<CreateClassResponse> = await axiosClient.post(
      "/class/create",
      payload,
    );

    return res.data;
  },

  getAllClasses: async (
    filter: GetAllClassesFilter,
  ): Promise<PaginatedResponse<Class>> => {
    const res: AxiosResponse<PaginatedResponse<Class>> = await axiosClient.get(
      "/class/getAll",
      {
        params: {
          page: filter.page,
          size: filter.size,
          name: cleanString(filter.name),
          code: cleanString(filter.code)
        },
      },
    );

    return res.data;
  },

  getMyClasses: async (): Promise<MyClass[]> => {
    const res: AxiosResponse<MyClass[]> = await axiosClient.get("/my-classes");

    return res.data;
  },

  enrollClassroom: async (
    payload: EnrollClassroomPayload,
  ): Promise<EnrollClassroomResponse> => {
    const res: AxiosResponse<EnrollClassroomResponse> = await axiosClient.post(
      "/enrolling-classroom",
      payload,
    );

    return res.data;
  },
};
const cleanString = (value?: string) =>
  value && value.trim() !== "" ? value.trim() : undefined;