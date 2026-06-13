import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type AccountRole = "STUDENT" | "ADMIN" | "TEACHER";

export type AccountItem = {
  accountId: string;
  fullName: string;
  email: string;
  role: AccountRole | string;
  isActive?: boolean;
  avatar?: string | null;
};

type RawAccountItem = Partial<AccountItem> & {
  id?: string;
  userId?: string;
  active?: boolean;
  status?: string;
  accountStatus?: string;
};

export const resolveAccountId = (
  account: Pick<AccountItem, "accountId"> & {
    id?: string;
    userId?: string;
  },
) => account.accountId || account.id || account.userId || "";

const normalizeAccountItem = (raw: RawAccountItem): AccountItem => {
  let isActive = true;

  if (typeof raw.isActive === "boolean") {
    isActive = raw.isActive;
  } else if (typeof raw.active === "boolean") {
    isActive = raw.active;
  } else {
    const status = (raw.accountStatus ?? raw.status ?? "ACTIVE").toUpperCase();
    if (status === "BLOCKED" || status === "LOCKED" || status === "INACTIVE") {
      isActive = false;
    }
  }

  return {
    accountId: raw.accountId ?? raw.id ?? raw.userId ?? "",
    fullName: raw.fullName ?? "",
    email: raw.email ?? "",
    role: raw.role ?? "",
    isActive,
    avatar: raw.avatar ?? null,
  };
};

export type RegisterAccountPayload = {
  email: string;
  password: string;
  fullName: string;
  role: AccountRole;
};

export type RegisterAccountResponse = {
  message?: string;
  accountId?: string;
  email?: string;
  fullName?: string;
  role?: string;
};

export type GetAccountsFilter = {
  page?: number;
  size?: number;
  keyword?: string;
  role?: AccountRole | "";
};

export type AccountsPageMeta = {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
};

export type GetAccountsResponse = {
  content?: RawAccountItem[];
  items?: RawAccountItem[];
  accounts?: RawAccountItem[];
  page?: AccountsPageMeta | number;
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
};

export const normalizeAccounts = (
  response?: GetAccountsResponse | RawAccountItem[] | null,
): AccountItem[] => {
  if (!response) return [];

  const items = Array.isArray(response)
    ? response
    : (response.content ?? response.items ?? response.accounts ?? []);

  return items.map(normalizeAccountItem);
};

export const normalizeAccountsPagination = (
  response: GetAccountsResponse,
  fallbackPage = 0,
  fallbackSize = 10,
) => {
  const accounts = normalizeAccounts(response);
  const pageMeta =
    response.page && typeof response.page === "object"
      ? response.page
      : undefined;

  return {
    accounts,
    totalElements:
      pageMeta?.totalElements ??
      response.totalElements ??
      accounts.length,
    totalPages: pageMeta?.totalPages ?? response.totalPages ?? 1,
    page:
      pageMeta?.number ??
      (typeof response.page === "number" ? response.page : undefined) ??
      response.number ??
      fallbackPage,
    size: pageMeta?.size ?? response.size ?? fallbackSize,
  };
};

export const getAccountStatus = (account: AccountItem) =>
  account.isActive === false ? "BLOCKED" : "ACTIVE";

export const AccountService = {
  getAccounts: async (
    filter: GetAccountsFilter,
  ): Promise<GetAccountsResponse> => {
    const res: AxiosResponse<GetAccountsResponse> = await axiosClient.get(
      "/auth/accounts",
      {
        params: {
          page: filter.page ?? 0,
          size: filter.size ?? 10,
          keyword: filter.keyword || undefined,
          role: filter.role || undefined,
        },
      },
    );

    return res.data;
  },

  registerAccount: async (
    payload: RegisterAccountPayload,
  ): Promise<RegisterAccountResponse> => {
    const res: AxiosResponse<RegisterAccountResponse> = await axiosClient.post(
      "/auth/register",
      payload,
    );

    return res.data;
  },
};
