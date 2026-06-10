import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type UpdateClassroomMaterialPayload = {
  classroomMaterialId: string;
  displayOrder: number;
};

export type UpdateClassroomMaterialResponse = {
  message?: string;
};

export type DeleteClassroomMaterialPayload = {
  classroomMaterialId: string;
};

export type DeleteClassroomMaterialResponse = {
  message?: string;
};

export const ClassroomMaterialService = {
  updateClassroomMaterial: async (
    payload: UpdateClassroomMaterialPayload,
  ): Promise<UpdateClassroomMaterialResponse> => {
    const res: AxiosResponse<UpdateClassroomMaterialResponse> =
      await axiosClient.put(
        `/classroomMaterial/${payload.classroomMaterialId}/order`,
        { order: payload.displayOrder },
      );
    return res.data;
  },
    deleteClassroomMaterial: async (
      payload: DeleteClassroomMaterialPayload,
    ): Promise<DeleteClassroomMaterialResponse> => {
      const res: AxiosResponse<DeleteClassroomMaterialResponse> =
        await axiosClient.delete(
          `/classroomMaterial/${payload.classroomMaterialId}`,
        );
      return res.data;
    },
};
