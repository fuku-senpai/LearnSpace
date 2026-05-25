import { CreateMaterialPayload, CreateMaterialResponse, MaterialService } from "@/app/service/material.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { queryClient } from "@/app/lib/react-query";
type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};

export const useCreateMaterialMutation = () => {
  return useMutation<CreateMaterialResponse, AxiosError<ErrorResponse>, CreateMaterialPayload>({
    mutationKey: ["createMaterial"],
    mutationFn: (payload) => MaterialService.createMaterial(payload),
    onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["materials"],
          });
        },
  });
};
