import { queryClient } from "@/app/lib/react-query";
import {
  CreateNewMaterialPayload,
  CreateNewMaterialResponse,
  MaterialService,
} from "@/app/service/material.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useCreateNewMaterialMutation = () => {
  return useMutation<
    CreateNewMaterialResponse,
    AxiosError<ErrorResponse>,
    CreateNewMaterialPayload
  >({
    mutationKey: ["createNewMaterial"],
    mutationFn: (payload) => MaterialService.createNewMaterial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["all_materials"],
      });
    },
  });
};
