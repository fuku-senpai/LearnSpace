"use client";
import { queryClient } from "@/app/lib/react-query";
import {
  ClassService,
  AssignTeacherPayload,
  AssignTeacherResponse,
} from "@/app/service/classroom.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  code?: number;
  message?: string;
  data?: Record<string, string> | null;
};

type AssignTeacherVariables = {
  classroomId: string;
  payload: AssignTeacherPayload;
};

export const useAssignTeacherToClass = () => {
  return useMutation<
    AssignTeacherResponse,
    AxiosError<ErrorResponse>,
    AssignTeacherVariables
  >({
    mutationKey: ["assignTeacher"],
    mutationFn: ({ classroomId, payload }) =>
      ClassService.assignTeacher(classroomId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classrooms-with-teacher"],
      });
    },
  });
};
