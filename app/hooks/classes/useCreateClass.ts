"use client";

import { queryClient } from "@/app/lib/react-query";
import { ClassService, CreateClassPayload, CreateClassResponse } from "@/app/service/classroom.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useCreateClassroomMutation = () => {
  return useMutation<CreateClassResponse, AxiosError<ErrorResponse>, CreateClassPayload>({
    mutationKey: ["createClassroom"],
    mutationFn: (payload) => ClassService.createClass(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
    },
  });
};
