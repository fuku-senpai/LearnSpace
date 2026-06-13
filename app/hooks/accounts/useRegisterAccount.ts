"use client";

import { queryClient } from "@/app/lib/react-query";
import {
  AccountService,
  type RegisterAccountPayload,
  type RegisterAccountResponse,
} from "@/app/service/account.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";

type ErrorResponse = {
  message?: string;
};

export const useRegisterAccountMutation = () =>
  useMutation<
    RegisterAccountResponse,
    AxiosError<ErrorResponse>,
    RegisterAccountPayload
  >({
    mutationKey: ["register-account"],
    mutationFn: (payload) => AccountService.registerAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    },
  });
