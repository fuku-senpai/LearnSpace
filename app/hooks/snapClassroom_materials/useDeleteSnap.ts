import { RemoveSnapClassroomMaterialsPayload, RemoveSnapClassroomMaterialsResponse, SnapClassroomMaterialService } from "@/app/service/snapclassrommaterial.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
type ErrorResponse = {
    code?: number;
    message?: string;
    data?: Record<string, string> | null;
  };
export const useRemoveSnapClassroomMaterials = () => {
  return useMutation<
    RemoveSnapClassroomMaterialsResponse,
    AxiosError<ErrorResponse>,
    RemoveSnapClassroomMaterialsPayload
  >({
    mutationKey: ["remove-snap-classroom-materials"],
    mutationFn: (payload) =>
      SnapClassroomMaterialService.removeSnapClassroomMaterials(payload),
  });
};