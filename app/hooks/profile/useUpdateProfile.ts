"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ProfileService,
  type UpdateStudentProfilePayload,
  type UpdateStudentProfileResponse,
} from "@/app/service/profile.service";
import { useAuthStore } from "@/app/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
};

export const useUpdateProfileMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const user = useAuthStore((state) => state.user);

  return useMutation<
    UpdateStudentProfileResponse,
    AxiosError<ErrorResponse>,
    UpdateStudentProfilePayload
  >({
    mutationKey: ["update-student-profile"],
    mutationFn: (payload) => ProfileService.updateStudentProfile(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student-profile"] });

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
