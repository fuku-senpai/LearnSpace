"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  StudentService,
  type UpdateStudentAccountResponse,
} from "@/app/service/student.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
};

type StudentAccountVariables = {
  accountId: string;
  classroomId?: string;
};

const invalidateStudentQueries = () => {
  queryClient.invalidateQueries({
    queryKey: ["classroom-students"],
  });
  queryClient.invalidateQueries({
    queryKey: ["accounts"],
  });
};

export const useBlockStudentMutation = () =>
  useMutation<
    UpdateStudentAccountResponse,
    AxiosError<ErrorResponse>,
    StudentAccountVariables
  >({
    mutationKey: ["block-student"],
    mutationFn: ({ accountId }) =>
      StudentService.updateAccountBlock(accountId, { type: "BLOCK" }),
    onSuccess: () => {
      invalidateStudentQueries();
    },
  });

export const useUnblockStudentMutation = () =>
  useMutation<
    UpdateStudentAccountResponse,
    AxiosError<ErrorResponse>,
    StudentAccountVariables
  >({
    mutationKey: ["unblock-student"],
    mutationFn: ({ accountId }) =>
      StudentService.updateAccountBlock(accountId, { type: "UNBLOCK" }),
    onSuccess: () => {
      invalidateStudentQueries();
    },
  });
