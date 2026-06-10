"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ClassService,
  ClassroomsWithTeacherResponse,
} from "@/app/service/classroom.service";

type Filter = {
  page?: number;
  size?: number;
  hasTeacher?: boolean | undefined;
};

export const useGetClassroomsWithTeacher = (filter: Filter) =>
  useQuery({
    queryKey: ["classrooms-with-teacher", filter],
    queryFn: () =>
      ClassService.getClassroomsWithTeacher(
        filter.page ?? 0,
        filter.size ?? 10,
        filter.hasTeacher,
      ),
  });
