"use client";
import { queryClient } from "@/app/lib/react-query";
import {
  ClassService,
  RemoveTeacherResponse,
} from "@/app/service/classroom.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  code?: number;
  message?: string;
  data?: Record<string, string> | null;
};

export const useRemoveTeacherFromClass = () => {
  return useMutation<
    RemoveTeacherResponse,
    AxiosError<ErrorResponse>,
    string
  >({
    mutationKey: ["removeTeacher"],
    mutationFn: (classroomId: string) =>
      ClassService.removeTeacher(classroomId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classes"],
      });
      queryClient.invalidateQueries({
        queryKey: ["classrooms-with-teacher"],
      });
    },
  });
};
