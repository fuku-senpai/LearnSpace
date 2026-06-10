import { axiosClient } from "@/app/lib/axiosClient";

export type LoginPayload = {
role: "STUDENT" | "TEACHER" | "ADMIN";
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
  logout: async (refreshToken: string | undefined) => {
    const res = await axiosClient.post("/auth/logout",{ refreshToken },{ withCredentials: true });
    return res.data;
  },

};
