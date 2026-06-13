import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type StudentAccountStatus = "ACTIVE" | "BLOCKED";

export type ClassroomStudent = {
  studentId: string;
  accountId?: string;
  role: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  address?: string | null;
  enrolledAt?: string;
  isActive?: boolean;
  status?: string;
  accountStatus?: StudentAccountStatus | string;
};

export type AccountBlockType = "BLOCK" | "UNBLOCK";

export type UpdateAccountBlockPayload = {
  type: AccountBlockType;
};

export type UpdateStudentAccountResponse = {
  message?: string;
  accountId?: string;
  studentId?: string;
  accountStatus?: StudentAccountStatus | string;
  isActive?: boolean;
};

export const getStudentAccountStatus = (
  student: ClassroomStudent,
): StudentAccountStatus => {
  if (typeof student.isActive === "boolean") {
    return student.isActive ? "ACTIVE" : "BLOCKED";
  }

  const value = (
    student.accountStatus ??
    student.status ??
    "ACTIVE"
  ).toUpperCase();

  if (value === "BLOCKED" || value === "LOCKED" || value === "INACTIVE") {
    return "BLOCKED";
  }

  return "ACTIVE";
};

export type GetStudentsByClassroomFilter = {
  classroomId: string;
  page?: number;
  size?: number;
  keyword?: string;
};

export type StudentsPageMeta = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type GetStudentsByClassroomResponse = {
  content?: ClassroomStudent[];
  students?: ClassroomStudent[];
  items?: ClassroomStudent[];
  page?: StudentsPageMeta | number;
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
};

export const normalizeClassroomStudents = (
  response?: GetStudentsByClassroomResponse | ClassroomStudent[] | null,
): ClassroomStudent[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;

  return (
    response.content ??
    response.students ??
    response.items ??
    []
  );
};

export const normalizeStudentsPagination = (
  response: GetStudentsByClassroomResponse,
  fallbackPage = 0,
  fallbackSize = 10,
) => {
  const students = normalizeClassroomStudents(response);
  const pageMeta =
    response.page && typeof response.page === "object"
      ? response.page
      : undefined;

  return {
    students,
    totalElements:
      pageMeta?.totalElements ??
      response.totalElements ??
      students.length,
    totalPages: pageMeta?.totalPages ?? response.totalPages ?? 1,
    page:
      pageMeta?.number ??
      (typeof response.page === "number" ? response.page : undefined) ??
      response.number ??
      fallbackPage,
    size: pageMeta?.size ?? response.size ?? fallbackSize,
  };
};

export const StudentService = {
  getStudentsByClassroom: async (
    filter: GetStudentsByClassroomFilter,
  ): Promise<GetStudentsByClassroomResponse> => {
    const res: AxiosResponse<GetStudentsByClassroomResponse> =
      await axiosClient.get(`/class/${filter.classroomId}/students`, {
        params: {
          page: filter.page ?? 0,
          size: filter.size ?? 10,
          keyword: filter.keyword || undefined,
        },
      });

    return res.data;
  },

  updateAccountBlock: async (
    accountId: string,
    payload: UpdateAccountBlockPayload,
  ): Promise<UpdateStudentAccountResponse> => {
    const res: AxiosResponse<UpdateStudentAccountResponse> =
      await axiosClient.put(`/auth/account/${accountId}/block`, payload);

    return res.data;
  },
};
