"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  ClassService,
  DeleteClassResponse,
  DeleteClassVariables
} from "@/app/service/classroom.service";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useDeleteClassroomMutation = () => {
  return useMutation<DeleteClassResponse,AxiosError<ErrorResponse>,DeleteClassVariables>({
    mutationKey: ["deleteClassroom"],
    mutationFn: (variables) =>
      ClassService.deleteClass(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
    }
  });
};
