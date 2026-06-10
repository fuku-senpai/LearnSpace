"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ClassScheduleService,
  DeleteClassSchedulePayload,
  DeleteClassScheduleResponse,
} from "@/app/service/classSchedule.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useDeleteClassScheduleMutation = () => {
  return useMutation<
    DeleteClassScheduleResponse,
    AxiosError<ErrorResponse>,
    DeleteClassSchedulePayload
  >({
    mutationKey: ["deleteClassSchedule"],
    mutationFn: (payload) => ClassScheduleService.deleteClassSchedule(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["class-schedules", variables.classroomId],
      });
    },
  });
};
