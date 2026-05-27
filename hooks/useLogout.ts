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
    mutationFn: async () => {
      const logoutPromise = authService.logout(refreshToken);
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("logout timeout")), 10000)
      );
      return Promise.race([logoutPromise, timeout]);
    },
    onSettled: () => {
      clearAuth();
    },
    onSuccess: () => {
      router.push("/login");
    },
    onError: (err) => {
      // Ensure auth cleared and navigate to login on error as well
      console.error("Logout failed:", err);
      clearAuth();
      try {
        router.push("/login");
      } catch (e) {
        // ignore
      }
    }
  });
};
