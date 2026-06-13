"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  AccountService,
  type GetAccountsFilter,
} from "@/app/service/account.service";

export const useGetAccountsQuery = (filter: GetAccountsFilter) =>
  useQuery({
    queryKey: ["accounts", filter],
    queryFn: () => AccountService.getAccounts(filter),
    placeholderData: keepPreviousData,
  });
