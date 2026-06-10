"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  ClassroomMaterialService,
  DeleteClassroomMaterialPayload,
  DeleteClassroomMaterialResponse,
} from "@/app/service/classroomMaterial.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useDeleteClassroomMaterials = () => {
  return useMutation<
    DeleteClassroomMaterialResponse,
    AxiosError<ErrorResponse>,
    DeleteClassroomMaterialPayload
  >({
    mutationKey: ["delete-classroom-material"],
    mutationFn: (payload) =>
      ClassroomMaterialService.deleteClassroomMaterial(payload),
  });
};
