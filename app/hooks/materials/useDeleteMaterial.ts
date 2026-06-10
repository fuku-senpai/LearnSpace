"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  DeleteMaterialPayload,
  DeleteMaterialResponse,
  MaterialService,
} from "@/app/service/material.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useDeleteMaterialMutation = () => {
  return useMutation<
    DeleteMaterialResponse,
    AxiosError<ErrorResponse>,
    DeleteMaterialPayload
  >({
    mutationKey: ["delete-material"],
    mutationFn: (payload) => MaterialService.deleteMaterial(payload),
  });
};
