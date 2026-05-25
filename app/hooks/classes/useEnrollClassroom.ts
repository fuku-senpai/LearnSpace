"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ClassService,
  type EnrollClassroomPayload,
  type EnrollClassroomResponse,
} from "@/app/service/classroom.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useEnrollClassroomMutation = () => {
  return useMutation<
    EnrollClassroomResponse,
    AxiosError<ErrorResponse>,
    EnrollClassroomPayload
  >({
    mutationKey: ["enroll-classroom"],
    mutationFn: (payload) => ClassService.enrollClassroom(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-classes"],
      });
    },
  });
};