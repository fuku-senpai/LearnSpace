"use client";

import {
  ProfileService,
  type StudentProfile,
} from "@/app/service/profile.service";
import { useQuery } from "@tanstack/react-query";

export const useGetStudentProfileQuery = () => {
  return useQuery<StudentProfile>({
    queryKey: ["student-profile"],
    queryFn: () => ProfileService.getStudent(),
    staleTime: 60_000,
  });
};
