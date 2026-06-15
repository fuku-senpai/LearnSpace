"use client";

import {
  ProfileService,
  type ChangeStudentPasswordPayload,
  type ChangeStudentPasswordResponse,
} from "@/app/service/profile.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  code?: number;
  data?: {
    newPassword?: string;
    confirmPassword?: string;
  };
};

export const useChangeStudentPasswordMutation = () => {
  return useMutation<
    ChangeStudentPasswordResponse,
    AxiosError<ErrorResponse>,
    ChangeStudentPasswordPayload
  >({
    mutationKey: ["change-student-password"],
    mutationFn: (payload) => ProfileService.changeStudentPassword(payload),
  });
};
