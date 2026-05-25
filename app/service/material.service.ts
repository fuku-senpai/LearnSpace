import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type MaterialItemPayload = {
  title: string;
  description?: string;
};

export type CreateMaterialPayload = {
  classroomId: string;
  materials: MaterialItemPayload[];
};
export type CreateMaterialResponse = {
  message?: string; 
}

export type MaterialItem = {
  id: string;
  title: string;
  description?: string;
  totalLessons?: number;
};

export type MaterialsFilter = {
  page: number;
  size: number;
};

export type MaterialsResponse = {
  content: MaterialItem[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};
export const MaterialService = {
    createMaterial: async (payload: CreateMaterialPayload): Promise<CreateMaterialResponse> => {
    const res: AxiosResponse<CreateMaterialResponse> = await axiosClient.post(
      `/materials/${payload.classroomId}`,
      { materials: payload.materials },
    );
    return res.data;
  },

  getMaterialsByClassroom: async (
    classroomId: string,
    filter: MaterialsFilter,
  ): Promise<MaterialsResponse> => {
    const res: AxiosResponse<MaterialsResponse> = await axiosClient.get(
      `/materials/${classroomId}`,
      {
        params: {
          page: filter.page,
          size: filter.size,
        },
      },
    );
    return res.data;
  },

  
};