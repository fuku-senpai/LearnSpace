import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/app/store/auth.store";


export const useLogout = () => {
  const refreshToken = useAuthStore((state) => state.user?.refreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const router = useRouter();
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => authService.logout(refreshToken),
    onSettled: () => {
      clearAuth();
    },
    onSuccess: () => {
      router.push("/login");
    }
  });
};
