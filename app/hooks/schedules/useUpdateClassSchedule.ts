"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ClassScheduleService,
  UpdateClassSchedulePayload,
  UpdateClassScheduleResponse,
} from "@/app/service/classSchedule.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useUpdateClassScheduleMutation = () => {
  return useMutation<
    UpdateClassScheduleResponse,
    AxiosError<ErrorResponse>,
    UpdateClassSchedulePayload
  >({
    mutationKey: ["updateClassSchedule"],
    mutationFn: (payload) => ClassScheduleService.updateClassSchedule(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["class-schedules", variables.classroomId],
      });
    },
  });
};
