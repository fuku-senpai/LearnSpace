"use client";

import {
  ProfileService,
  type TeacherProfile,
} from "@/app/service/profile.service";
import { useQuery } from "@tanstack/react-query";

export const useGetTeacherProfileQuery = () => {
  return useQuery<TeacherProfile>({
    queryKey: ["teacher-profile"],
    queryFn: () => ProfileService.getTeacher(),
    staleTime: 60_000,
  });
};
