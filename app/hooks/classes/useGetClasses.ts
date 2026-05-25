"use client";

import { ClassService, GetAllClassesFilter } from "@/app/service/classroom.service";
import { useQuery } from "@tanstack/react-query";

export const useGetClassesQuery = (filter: GetAllClassesFilter) => {
  return useQuery({
    queryKey: ["classes", filter],
    queryFn: () => ClassService.getAllClasses(filter)
  });
};
