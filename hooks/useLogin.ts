"use client";
import { useMutation } from "@tanstack/react-query";
import { authService, type LoginPayload } from "@/services/auth.service";
import { useAuthStore } from "@/app/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth({
        role: data.role,
        fullName: data.fullName,
        refreshToken: data.refreshToken
      });
      if (data.userInfo.role === "TEACHER") {
        router.replace(`/teacher/dashboard_layout?menu=classes  `);
      } else if (data.userInfo.role === "STUDENT") {
        router.replace("/student/student_dashboard");
      }
      toast.success("Đăng nhập thành công!");
    },

  });
};
