"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ClassScheduleService,
  CreateClassSchedulePayload,
  CreateClassScheduleResponse,
} from "@/app/service/classSchedule.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useCreateClassScheduleMutation = () => {
  return useMutation<
    CreateClassScheduleResponse,
    AxiosError<ErrorResponse>,
    CreateClassSchedulePayload
  >({
    mutationKey: ["createClassSchedule"],
    mutationFn: (payload) => ClassScheduleService.createClassSchedule(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["class-schedules", variables.classroomId],
      });
    },
  });
};