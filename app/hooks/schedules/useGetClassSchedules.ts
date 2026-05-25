"use client";

import { ClassScheduleItem, ClassScheduleService } from "@/app/service/classSchedule.service";
import { useQuery } from "@tanstack/react-query";

export const useGetClassSchedulesQuery = (classroomId?: string) => {
  return useQuery({
    queryKey: ["class-schedules", classroomId],
    queryFn: () => ClassScheduleService.getClassSchedules(classroomId as string),
    enabled: Boolean(classroomId),
  });
};
