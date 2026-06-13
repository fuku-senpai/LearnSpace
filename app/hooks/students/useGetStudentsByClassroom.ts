"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  StudentService,
  type GetStudentsByClassroomFilter,
  normalizeStudentsPagination,
} from "@/app/service/student.service";

export const useGetStudentsByClassroomQuery = (
  filter?: GetStudentsByClassroomFilter,
) =>
  useQuery({
    queryKey: ["classroom-students", filter],
    queryFn: async () => {
      const response = await StudentService.getStudentsByClassroom(filter!);

      return {
        raw: response,
        ...normalizeStudentsPagination(
          response,
          filter?.page ?? 0,
          filter?.size ?? 10,
        ),
      };
    },
    enabled: Boolean(filter?.classroomId),
    placeholderData: keepPreviousData,
  });
