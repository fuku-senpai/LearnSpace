import { axiosClient } from "@/app/lib/axiosClient";

export type LoginPayload = {
role: "STUDENT" | "TEACHER";
  email: string;
  password: string;
  deviceId: string;
  deviceInfo: string;
};

export type LoginResponse = {
  success: boolean;
  message?: string;
  data?: {
    email: string;
    role: "STUDENT" | "TEACHER";
  };
};

export const authService = {
  login: async ({role, email, password, deviceId, deviceInfo }: LoginPayload) => {
    const res = await axiosClient.post(
      "/auth/login",
      { role, email, password, deviceId, deviceInfo },
      {
        withCredentials: true,
      }
    );
    return res.data;
  },
};
