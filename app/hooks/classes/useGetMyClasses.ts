"use client";

import { useQuery } from "@tanstack/react-query";
import { ClassService, type MyClass } from "@/app/service/classroom.service";

export const useGetMyClassesQuery = () => {
  return useQuery<MyClass[]>({
    queryKey: ["my-classes"],
    queryFn: () => ClassService.getMyClasses(),
  });
};