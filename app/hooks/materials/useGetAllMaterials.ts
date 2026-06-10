"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
    AllMaterialsFilter,
  MaterialService
} from "@/app/service/material.service";

export const useGetALLMaterialsQuery = (filter: AllMaterialsFilter) =>
  useQuery({
    queryKey: ["all_materials", filter],
    queryFn: () => MaterialService.getAllMaterials(filter),
    placeholderData: keepPreviousData,
  });
