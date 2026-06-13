"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useGetAccountsQuery } from "@/app/hooks/accounts/useGetAccounts";
import { useRegisterAccountMutation } from "@/app/hooks/accounts/useRegisterAccount";
import {
  useBlockStudentMutation,
  useUnblockStudentMutation,
} from "@/app/hooks/students/useUpdateStudentAccountStatus";
import {
  getAccountStatus,
  normalizeAccountsPagination,
  resolveAccountId,
  type AccountItem,
  type AccountRole,
} from "@/app/service/account.service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

const ACCOUNT_PAGE_SIZE = 10;

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  role: AccountRole;
};

type RoleFilter = "ALL" | AccountRole;

const ROLE_OPTIONS: { value: AccountRole; label: string }[] = [
  { value: "STUDENT", label: "Học viên" },
  { value: "TEACHER", label: "Giáo viên" },
  { value: "ADMIN", label: "Quản trị" },
];

const getRoleLabel = (role?: string) => {
  switch ((role ?? "").toUpperCase()) {
    case "STUDENT":
      return "Học viên";
    case "TEACHER":
      return "Giáo viên";
    case "ADMIN":
      return "Quản trị";
    default:
      return role ?? "—";
  }
};

const getStatusLabel = (account: AccountItem) =>
  getAccountStatus(account) === "BLOCKED" ? "Đã khóa" : "Hoạt động";

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "TK";

const AccountManagement = () => {
  const [page, setPage] = useState(0);
  const [keywordInput, setKeywordInput] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");
  const [showPassword, setShowPassword] = useState(false);
  const [pendingAccount, setPendingAccount] = useState<AccountItem | null>(
    null,
  );
  const [pendingAction, setPendingAction] = useState<
    "block" | "unblock" | null
  >(null);

  const form = useForm<RegisterFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
    mode: "onTouched",
  });

  const { mutate: registerAccount, isPending: isRegistering } =
    useRegisterAccountMutation();
  const { mutate: blockAccount, isPending: isBlocking } =
    useBlockStudentMutation();
  const { mutate: unblockAccount, isPending: isUnblocking } =
    useUnblockStudentMutation();

  const isAccountUpdating = isBlocking || isUnblocking;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedKeyword(keywordInput.trim());
      setPage(0);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [keywordInput]);

  const { data, isLoading, isFetching, error } = useGetAccountsQuery({
    page,
    size: ACCOUNT_PAGE_SIZE,
    keyword: debouncedKeyword || undefined,
    role: roleFilter === "ALL" ? "" : roleFilter,
  });

  const pagination = useMemo(
    () =>
      data
        ? normalizeAccountsPagination(data, page, ACCOUNT_PAGE_SIZE)
        : {
            accounts: [] as AccountItem[],
            totalElements: 0,
            totalPages: 1,
            page: 0,
            size: ACCOUNT_PAGE_SIZE,
          },
    [data, page],
  );

  const { accounts, totalElements, totalPages } = pagination;

  const activeCount = accounts.filter(
    (account) => getAccountStatus(account) === "ACTIVE",
  ).length;
  const blockedCount = accounts.filter(
    (account) => getAccountStatus(account) === "BLOCKED",
  ).length;

  const openConfirmDialog = (
    account: AccountItem,
    action: "block" | "unblock",
  ) => {
    setPendingAccount(account);
    setPendingAction(action);
  };

  const closeConfirmDialog = () => {
    setPendingAccount(null);
    setPendingAction(null);
  };

  const handleConfirmAccountAction = () => {
    if (!pendingAccount || !pendingAction) return;

    const accountId = resolveAccountId(pendingAccount);
    if (!accountId) return;

    const variables = { accountId };
    const onSettled = () => closeConfirmDialog();

    if (pendingAction === "block") {
      blockAccount(variables, {
        onSuccess: (res) => {
          toast.success(res?.message || "Khóa tài khoản thành công");
        },
        onError: (err) => {
          toast.error(
            err.response?.data?.message || "Khóa tài khoản thất bại",
          );
        },
        onSettled,
      });
      return;
    }

    unblockAccount(variables, {
      onSuccess: (res) => {
        toast.success(res?.message || "Mở khóa tài khoản thành công");
      },
      onError: (err) => {
        toast.error(
          err.response?.data?.message || "Mở khóa tài khoản thất bại",
        );
      },
      onSettled,
    });
  };

  const onSubmitRegister = (values: RegisterFormValues) => {
    registerAccount(values, {
      onSuccess: (res) => {
        toast.success(res?.message || "Tạo tài khoản thành công");
        form.reset({
          fullName: "",
          email: "",
          password: "",
          role: values.role,
        });
        setShowPassword(false);
      },
      onError: (err) => {
        toast.error(
          err.response?.data?.message || "Tạo tài khoản thất bại",
        );
      },
    });
  };

  const renderAccountRows = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell
            colSpan={5}
            className="py-16 text-center text-sm text-zinc-500"
          >
            Đang tải danh sách tài khoản...
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="py-16">
            <div className="mx-auto max-w-md border border-zinc-200 px-5 py-4 text-center text-sm text-zinc-600">
              Không thể tải danh sách tài khoản. Vui lòng thử lại.
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (accounts.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="py-16">
            <div className="flex flex-col items-center justify-center text-center">
              <Users className="mb-3 h-8 w-8 text-zinc-300" strokeWidth={1.5} />
              <p className="text-sm text-zinc-600">
                {debouncedKeyword || roleFilter !== "ALL"
                  ? "Không tìm thấy tài khoản phù hợp"
                  : "Chưa có tài khoản nào"}
              </p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    return accounts.map((account) => {
      const isBlocked = getAccountStatus(account) === "BLOCKED";

      return (
        <TableRow
          key={resolveAccountId(account) || account.email}
          className="border-zinc-100 transition-colors hover:bg-zinc-50/80"
        >
          <TableCell className="min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[11px] font-medium text-zinc-600">
                {getInitials(account.fullName)}
              </div>
              <p className="truncate font-medium text-zinc-900">
                {account.fullName}
              </p>
            </div>
          </TableCell>
          <TableCell className="text-sm text-zinc-500">
            {account.email}
          </TableCell>
          <TableCell>
            <span className="text-xs tracking-wide text-zinc-500 uppercase">
              {getRoleLabel(account.role)}
            </span>
          </TableCell>
          <TableCell>
            <span className="inline-flex items-center gap-2 text-sm text-zinc-600">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isBlocked ? "bg-zinc-300" : "bg-zinc-900"
                }`}
              />
              {getStatusLabel(account)}
            </span>
          </TableCell>
          <TableCell className="text-right">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer rounded-none border-b border-transparent px-2 text-zinc-500 hover:border-zinc-900 hover:bg-transparent hover:text-zinc-900"
              disabled={isAccountUpdating || !resolveAccountId(account)}
              onClick={() =>
                openConfirmDialog(account, isBlocked ? "unblock" : "block")
              }
            >
              {isBlocked ? (
                <>
                  <LockOpen className="h-3.5 w-3.5" />
                  Mở khóa
                </>
              ) : (
                <>
                  <Lock className="h-3.5 w-3.5" />
                  Khóa
                </>
              )}
            </Button>
          </TableCell>
        </TableRow>
      );
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <section className="mb-10 border-b border-zinc-200 pb-8">
        <p className="font-mono text-[11px] tracking-[0.2em] text-zinc-400 uppercase">
          Accounts
        </p>
        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Quản lý tài khoản
            </h2>
            <p className="mt-1 max-w-lg text-sm text-zinc-500">
              Tạo và theo dõi tài khoản hệ thống.
            </p>
          </div>
          <div className="flex divide-x divide-zinc-200 border border-zinc-200">
            {[
              { label: "Tổng", value: totalElements },
              { label: "Hoạt động", value: activeCount },
              { label: "Đã khóa", value: blockedCount },
            ].map((stat) => (
              <div key={stat.label} className="px-5 py-3">
                <p className="text-[10px] tracking-wider text-zinc-400 uppercase">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-mono text-xl text-zinc-900">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0 space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-0 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={keywordInput}
                onChange={(event) => setKeywordInput(event.target.value)}
                placeholder="Tìm tên hoặc email"
                className="h-10 rounded-none border-0 border-b border-zinc-200 bg-transparent pl-6 shadow-none focus-visible:border-zinc-900 focus-visible:ring-0"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(value) => {
                setRoleFilter(value as RoleFilter);
                setPage(0);
              }}
            >
              <SelectTrigger className="h-10 w-full cursor-pointer rounded-none border-zinc-200 bg-transparent shadow-none sm:w-[160px]">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả</SelectItem>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-zinc-200">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50/50">
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Họ tên
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Email
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Vai trò
                  </TableHead>
                  <TableHead className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-right text-xs font-medium tracking-wide text-zinc-500 uppercase">
                    Hành động
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{renderAccountRows()}</TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-zinc-500">
            <p>
              {page + 1} / {Math.max(totalPages, 1)}
              {isFetching ? " · đang tải" : ""}
            </p>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer rounded-none px-3 text-zinc-600 hover:text-zinc-900"
                disabled={page <= 0 || isFetching}
                onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              >
                ← Trước
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="cursor-pointer rounded-none px-3 text-zinc-600 hover:text-zinc-900"
                disabled={page + 1 >= totalPages || isFetching}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Sau →
              </Button>
            </div>
          </div>
        </section>

        <aside className="xl:sticky xl:top-6 xl:self-start">
          <div className="border-l-2 border-zinc-900 pl-6">
            <div className="mb-6 flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-zinc-900">
                Tạo tài khoản
              </h3>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitRegister)}
                className="space-y-5"
                noValidate
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{ required: "Vui lòng nhập họ tên." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-zinc-500">
                        Họ tên
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nguyễn Văn A"
                          className="h-9 rounded-none border-0 border-b border-zinc-200 bg-transparent px-0 shadow-none focus-visible:border-zinc-900 focus-visible:ring-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  rules={{ required: "Vui lòng nhập email." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-zinc-500">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="user@gmail.com"
                          autoComplete="email"
                          className="h-9 rounded-none border-0 border-b border-zinc-200 bg-transparent px-0 shadow-none focus-visible:border-zinc-900 focus-visible:ring-0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "Vui lòng nhập mật khẩu.",
                    minLength: {
                      value: 8,
                      message: "Mật khẩu tối thiểu 8 ký tự.",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-zinc-500">
                        Mật khẩu
                      </FormLabel>
                      <FormControl>
                        <div className="relative border-b border-zinc-200 focus-within:border-zinc-900">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Tối thiểu 8 ký tự"
                            autoComplete="new-password"
                            className="h-9 rounded-none border-0 bg-transparent pr-8 pl-0 shadow-none focus-visible:ring-0"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute top-1/2 right-0 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700"
                            aria-label={
                              showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 cursor-pointer" />
                            ) : (
                              <Eye className="h-4 w-4 cursor-pointer" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  rules={{ required: "Vui lòng chọn vai trò." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-zinc-500">
                        Vai trò
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 border border-zinc-200">
                          {ROLE_OPTIONS.map((option) => {
                            const isActive = field.value === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={`cursor-pointer px-2 py-2.5 text-xs transition ${
                                  isActive
                                    ? "bg-zinc-900 text-white"
                                    : "bg-transparent text-zinc-500 hover:text-zinc-900"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="outline"
                  className="h-10 w-full cursor-pointer rounded-none border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
                  disabled={isRegistering}
                >
                  {isRegistering ? "Đang tạo..." : "Tạo tài khoản"}
                </Button>
              </form>
            </Form>
          </div>
        </aside>
      </div>

      <AlertDialog
        open={Boolean(pendingAccount && pendingAction)}
        onOpenChange={(open) => {
          if (!open) closeConfirmDialog();
        }}
      >
        <AlertDialogContent className="max-w-sm rounded-none border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium text-zinc-900">
              {pendingAction === "block"
                ? "Khóa tài khoản?"
                : "Mở khóa tài khoản?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-zinc-500">
              {pendingAction === "block"
                ? `${pendingAccount?.fullName} sẽ không thể đăng nhập.`
                : `${pendingAccount?.fullName} sẽ được đăng nhập lại.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="cursor-pointer rounded-none"
              disabled={isAccountUpdating}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer rounded-none bg-zinc-900 hover:bg-zinc-800"
              disabled={
                isAccountUpdating ||
                !pendingAccount ||
                !resolveAccountId(pendingAccount)
              }
              onClick={(event) => {
                event.preventDefault();
                handleConfirmAccountAction();
              }}
            >
              {isAccountUpdating ? "Đang xử lý..." : "Xác nhận"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountManagement;
