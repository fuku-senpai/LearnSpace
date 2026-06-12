"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  GetTeacherScheduleFilter,
  TeacherService,
} from "@/app/service/teacher.service";

export const useGetTeacherScheduleQuery = (filter: GetTeacherScheduleFilter) =>
  useQuery({
    queryKey: ["teacher-schedule", filter],
    queryFn: () => TeacherService.getTeacherSchedule(filter),
    enabled: Boolean(filter.teacherId),
    placeholderData: keepPreviousData,
  });
