import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type StudentProfile = {
  id: string;
  fullName: string;
  email: string;
  address: string | null;
  avatar: string | null;
};

export type TeacherProfile = {
  id: string;
  fullName: string;
  email: string;
  specialization: string | null;
  yearsExperience: number | null;
  avatar: string | null;
};

type RawStudentProfile = Partial<StudentProfile>;
type RawTeacherProfile = Partial<TeacherProfile>;

export type UpdateStudentProfilePayload = {
  fullName: string;
  address: string;
  avatar: string;
};

export type UpdateStudentProfileResponse = {
  message?: string;
  id?: string;
  fullName?: string;
  email?: string;
  address?: string | null;
  avatar?: string | null;
};

export type ChangeStudentPasswordPayload = {
  newPassword: string;
  confirmPassword: string;
};

export type ChangeStudentPasswordResponse = {
  message?: string;
};

export type UpdateTeacherProfilePayload = {
  fullName: string;
  specialization: string;
  yearsExperience: number;
  avatar: string;
};

export type UpdateTeacherProfileResponse = {
  message?: string;
  id?: string;
  fullName?: string;
  email?: string;
  specialization?: string | null;
  yearsExperience?: number | null;
  avatar?: string | null;
};

export const normalizeStudentProfile = (
  raw: RawStudentProfile,
): StudentProfile => ({
  id: raw.id ?? "",
  fullName: raw.fullName ?? "",
  email: raw.email ?? "",
  address: raw.address ?? null,
  avatar: raw.avatar ?? null,
});

export const normalizeTeacherProfile = (
  raw: RawTeacherProfile,
): TeacherProfile => ({
  id: raw.id ?? "",
  fullName: raw.fullName ?? "",
  email: raw.email ?? "",
  specialization: raw.specialization ?? null,
  yearsExperience:
    typeof raw.yearsExperience === "number" ? raw.yearsExperience : null,
  avatar: raw.avatar ?? null,
});

export const ProfileService = {
  getStudent: async (): Promise<StudentProfile> => {
    const res: AxiosResponse<RawStudentProfile> =
      await axiosClient.get("/student");

    return normalizeStudentProfile(res.data);
  },

  updateStudentProfile: async (
    payload: UpdateStudentProfilePayload,
  ): Promise<UpdateStudentProfileResponse> => {
    const res: AxiosResponse<UpdateStudentProfileResponse> =
      await axiosClient.put("/student", payload);

    return res.data;
  },

  changeStudentPassword: async (
    payload: ChangeStudentPasswordPayload,
  ): Promise<ChangeStudentPasswordResponse> => {
    const res: AxiosResponse<ChangeStudentPasswordResponse> =
      await axiosClient.post("/auth/change-password", payload);

    return res.data;
  },

  getTeacher: async (): Promise<TeacherProfile> => {
    const res: AxiosResponse<RawTeacherProfile> =
      await axiosClient.get("/teacher");

    return normalizeTeacherProfile(res.data);
  },

  updateTeacherProfile: async (
    payload: UpdateTeacherProfilePayload,
  ): Promise<UpdateTeacherProfileResponse> => {
    const res: AxiosResponse<UpdateTeacherProfileResponse> =
      await axiosClient.put("/teacher", payload);

    return res.data;
  },
};
