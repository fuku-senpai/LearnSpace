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
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type ClassroomMaterialItem = {
  id: string;
  sourceMaterialId: string;
  title: string;
  description: string;
  materialOrder: number;
  totalLessons: number;
};

export type SnapLesson = {
  lessonId: string;
  sourceLessonId?: string;
  lessonOrder: number;
  title: string;
  lessonVideos: LessonVideo[];
};

export type LessonVideo = {
  lessonVideoId: string;
};
export type SnapMaterial = {
  materialId: string;
  sourceMaterialId?: string;
  materialOrder: number;
  title: string;
  description?: string;
  lessons: SnapLesson[];
};

export type MaterialsFilter = {
  page: number;
  size: number;
};

export type MaterialsResponse = {
  materials: ClassroomMaterialItem[];
};

// create new material
export type CreateNewMaterialPayload = {
  title: string;
  description?: string;
};
export type CreateNewMaterialResponse = {
  message?: string;
};

export type DeleteMaterialPayload = {
  materialId: string;
};

export type DeleteMaterialResponse = {
  message?: string;
};

export type UpdateMaterialPayload = {
  materialId: string;
  title: string;
  description?: string;
};

export type UpdateMaterialResponse = {
  message?: string;
};

export type AssignMaterialOrder = {
  materialId: string;
  order: number;
};

export type AssignMaterialsPayload = {
  classroomId: string;
  materialOrders: AssignMaterialOrder[];
};

export type AssignMaterialsResponse = {
  message?: string;
};

// all materials
export type AllMaterialsFilter = {
  page: number;
  size: number;
  title?: string;
};
export type Item = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type AllMaterialsResponse = {
  items: Item[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};
export const MaterialService = {
    createMaterial: async (payload: CreateMaterialPayload): Promise<CreateMaterialResponse> => {
    const res: AxiosResponse<CreateMaterialResponse> = await axiosClient.post(
      `/materials/${payload.classroomId}`,
      { materials: payload.materials },
    );
    return res.data;
  },
   // create new material
  createNewMaterial: async (payload: CreateNewMaterialPayload): Promise<CreateNewMaterialResponse> => {
    const res: AxiosResponse<CreateNewMaterialResponse> = await axiosClient.post(
      `/materials`,
      { title: payload.title, description: payload.description },
    );
    return res.data;
  },
  getMaterialsByClassroom: async (
    classroomId: string,
  ): Promise<MaterialsResponse> => {
    const res: AxiosResponse<MaterialsResponse> = await axiosClient.get(
      `/materials/${classroomId}`,
    );
    return res.data;
  },
  // all materials
  getAllMaterials: async (
    filter: AllMaterialsFilter,
  ): Promise<AllMaterialsResponse> => {
    const res: AxiosResponse<AllMaterialsResponse> = await axiosClient.get(
      `/materials`,
      {
        params: {
          page: filter.page,
          size: filter.size,
          title: filter.title || undefined,
        },
      },
    );
    return res.data;
  },
  assignMaterialsToClassroom: async (
    payload: AssignMaterialsPayload,
  ): Promise<AssignMaterialsResponse> => {
    const materialIds = payload.materialOrders.map((item) => item.materialId);
    const res: AxiosResponse<AssignMaterialsResponse> = await axiosClient.post(
      `/materials/${payload.classroomId}/assign`,
      {
        materialIds,
        materials: payload.materialOrders,
      },
    );
    return res.data;
  },
  deleteMaterial: async (
    payload: DeleteMaterialPayload,
  ): Promise<DeleteMaterialResponse> => {
    const res: AxiosResponse<DeleteMaterialResponse> =
      await axiosClient.delete(`/materials/${payload.materialId}`);
    return res.data;
  },
  updateMaterial: async (
    payload: UpdateMaterialPayload,
  ): Promise<UpdateMaterialResponse> => {
    const res: AxiosResponse<UpdateMaterialResponse> =
      await axiosClient.put(`/materials/${payload.materialId}`, {
        title: payload.title,
        description: payload.description,
      });
    return res.data;
  },
  getSnapMaterials: async (classroomId: string): Promise<SnapMaterial[]> => {
    const res: AxiosResponse<SnapMaterial[]> = await axiosClient.get(
      `/class/${classroomId}/snap-materials`,
    );

    return res.data;
  },
};