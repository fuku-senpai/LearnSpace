"use client";

import { useQuery } from "@tanstack/react-query";
import { MaterialService } from "@/app/service/material.service";
import type { MaterialsResponse } from "@/app/service/material.service";

export const useGetMaterialsQuery = (classroomId: string | undefined) =>
  useQuery<MaterialsResponse>({
    queryKey: ["materials", classroomId],
    queryFn: () => MaterialService.getMaterialsByClassroom(classroomId as string),
    enabled: Boolean(classroomId),
  });
