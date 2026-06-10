import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  AssignMaterialsPayload,
  AssignMaterialsResponse,
  MaterialService,
} from "@/app/service/material.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useAssignMaterialsToClassroom = () => {
  return useMutation<
    AssignMaterialsResponse,
    AxiosError<ErrorResponse>,
    AssignMaterialsPayload
  >({
    mutationKey: ["assign-materials"],
    mutationFn: (payload) =>
      MaterialService.assignMaterialsToClassroom(payload),
  });
};