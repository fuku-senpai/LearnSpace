"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  MaterialService,
  UpdateMaterialPayload,
  UpdateMaterialResponse,
} from "@/app/service/material.service";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useUpdateMaterialMutation = () => {
  return useMutation<
    UpdateMaterialResponse,
    AxiosError<ErrorResponse>,
    UpdateMaterialPayload
  >({
    mutationKey: ["update-material"],
    mutationFn: (payload) => MaterialService.updateMaterial(payload),
  });
};
