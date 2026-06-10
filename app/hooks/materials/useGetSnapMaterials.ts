"use client";

import { useQuery } from "@tanstack/react-query";
import { MaterialService, SnapMaterial } from "@/app/service/material.service";

export const useGetSnapMaterials = (classroomId?: string) =>
  useQuery<SnapMaterial[]>({
    queryKey: ["snap-materials", classroomId],
    enabled: Boolean(classroomId),
    queryFn: () => MaterialService.getSnapMaterials(classroomId as string),
  });
