import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type RemoveSnapClassroomMaterialsPayload = {
    snapClassroomMaterialId: string;
};
export type RemoveSnapClassroomMaterialsResponse = {
  message?: string;
};

export const SnapClassroomMaterialService = {
  removeSnapClassroomMaterials: async (payload: RemoveSnapClassroomMaterialsPayload): Promise<RemoveSnapClassroomMaterialsResponse> => {
    const res: AxiosResponse<RemoveSnapClassroomMaterialsResponse> = await axiosClient.delete(`/snapClassroomMaterials/${payload.snapClassroomMaterialId}`);
    return res.data;
  },
};
