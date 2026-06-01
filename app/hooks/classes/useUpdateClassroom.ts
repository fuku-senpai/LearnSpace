"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ClassService,
  UpdateClassVariables,
  type UpdateClassResponse,
} from "@/app/service/classroom.service";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useUpdateClassroomMutation = () => {
  return useMutation<UpdateClassResponse,AxiosError<ErrorResponse>,UpdateClassVariables>({
    mutationKey: ["updateClassroom"],
    mutationFn: ({ classroomId, payload }) =>
      ClassService.updateClass({ classroomId, payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
    }
  });
};
