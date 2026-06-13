"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ProfileService,
  type UpdateTeacherProfilePayload,
  type UpdateTeacherProfileResponse,
} from "@/app/service/profile.service";
import { useAuthStore } from "@/app/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
};

export const useUpdateTeacherProfileMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);

  return useMutation<
    UpdateTeacherProfileResponse,
    AxiosError<ErrorResponse>,
    UpdateTeacherProfilePayload
  >({
    mutationKey: ["update-teacher-profile"],
    mutationFn: (payload) => ProfileService.updateTeacherProfile(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teacher-profile"] });

      if (user) {
        setAuth({
          role: user.role,
          fullName: data.fullName ?? variables.fullName,
          refreshToken: user.refreshToken,
        });
      }
    },
  });
};
