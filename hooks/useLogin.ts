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
      const role = data.userInfo.role;

      setAuth({
        role,
        fullName: data.fullName,
        refreshToken: data.refreshToken,
      });

      switch (role) {
        case "ADMIN":
          router.replace("/admin/dashboard_layout?menu=classes");
          break;

        case "TEACHER":
          router.replace("/teacher/dashboard_layout");
          break;

        case "STUDENT":
          router.replace("/student/student_dashboard");
          break;

        default:
          router.replace("/login");
          toast.error("Vai trò không hợp lệ!");
          return;
      }

      toast.success("Đăng nhập thành công!");
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Đăng nhập thất bại!");
    },
  });
};
