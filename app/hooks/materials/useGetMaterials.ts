"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { MaterialService, type MaterialsFilter } from "@/app/service/material.service";

export const useGetMaterialsQuery = (
  classroomId: string | undefined,
  filter: MaterialsFilter,
) =>
  useQuery({
    queryKey: ["materials", classroomId, filter],
    queryFn: () =>
      MaterialService.getMaterialsByClassroom(classroomId as string, filter),
    enabled: Boolean(classroomId),
    placeholderData: keepPreviousData,
  });
