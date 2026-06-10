"use client";

import { useQuery } from "@tanstack/react-query";
import { TeacherService, TeacherClassroom } from "@/app/service/teacher.service";

export const useGetTeacherClassrooms = () =>
  useQuery<TeacherClassroom[]>({
    queryKey: ["teacher-classrooms"],
    queryFn: () => TeacherService.getTeacherClassrooms(),
  });
