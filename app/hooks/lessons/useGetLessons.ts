"use client";

import { useQuery } from "@tanstack/react-query";
import { LessonService } from "@/app/service/lesson.service";

export const useGetLessonsQuery = (materialId?: string) =>
  useQuery({
    queryKey: ["lessons", materialId],
    queryFn: () => LessonService.getLessonsByMaterial(materialId as string),
    enabled: Boolean(materialId),
  });
