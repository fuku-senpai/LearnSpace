"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, KeyRound, Loader2, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useChangePasswordMutation } from "@/app/hooks/auth/useChangePassword";
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
import { cn } from "@/lib/utils";

type ChangePasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

type ChangePasswordTheme = "student" | "teacher";

const themeStyles: Record<
  ChangePasswordTheme,
  { badge: string; line: string; icon: string }
> = {
  student: {
    badge: "text-violet-600",
    line: "from-violet-400",
    icon: "border-violet-200 bg-violet-50 text-violet-600",
  },
  teacher: {
    badge: "text-sky-600",
    line: "from-sky-400",
    icon: "border-sky-200 bg-sky-50 text-sky-600",
  },
};

const passwordRules = {
  required: "Vui lòng nhập mật khẩu.",
  minLength: {
    value: 6,
    message:
      "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.",
  },
  validate: (value: string) => {
    const hasUppercase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);

    if (hasUppercase && hasNumber && hasSpecial) {
      return true;
    }

    return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.";
  },
};

const getErrorMessage = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Không thể đổi mật khẩu.";
};

const getFieldErrors = (error: unknown) => {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "data" in error.response.data &&
    error.response.data.data &&
    typeof error.response.data.data === "object"
  ) {
    return error.response.data.data as {
      newPassword?: string;
      confirmPassword?: string;
    };
  }

  return null;
};

type ChangePasswordFormProps = {
  theme?: ChangePasswordTheme;
};

export function ChangePasswordForm({ theme = "student" }: ChangePasswordFormProps) {
  const styles = themeStyles[theme];
  const changePassword = useChangePasswordMutation();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    try {
      const response = await changePassword.mutateAsync({
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success(response.message || "Đổi mật khẩu thành công.");
      form.reset();
    } catch (error: unknown) {
      const fieldErrors = getFieldErrors(error);
      let hasFieldError = false;

      if (fieldErrors?.newPassword) {
        form.setError("newPassword", { message: fieldErrors.newPassword });
        hasFieldError = true;
      }

      if (fieldErrors?.confirmPassword) {
        form.setError("confirmPassword", {
          message: fieldErrors.confirmPassword,
        });
        hasFieldError = true;
      }

      if (!hasFieldError) {
        toast.error(getErrorMessage(error));
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-xl space-y-8">
        <section className="space-y-4 border-b border-slate-200 pb-6">
          <span
            className={cn(
              "inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase",
              styles.badge,
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Bảo mật
          </span>
          <div
            className={cn(
              "h-px w-full max-w-[100px] bg-gradient-to-r to-transparent",
              styles.line,
            )}
          />
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Đổi mật khẩu
            </h2>
            <p className="text-sm text-slate-500">
              Nhập mật khẩu mới và xác nhận lại để cập nhật tài khoản.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl border",
                  styles.icon,
                )}
              >
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Mật khẩu mới
                </h3>
                <p className="mt-0.5 text-sm text-slate-500">
                  Ít nhất 6 ký tự, gồm chữ hoa, số và ký tự đặc biệt.
                </p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 px-6 py-6 sm:px-8"
            >
              <FormField
                control={form.control}
                name="newPassword"
                rules={passwordRules}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Mật khẩu mới
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          {...field}
                          type={showNewPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="h-11 rounded-xl border-slate-200/80 bg-white pr-11 pl-10"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          aria-label={
                            showNewPassword
                              ? "Ẩn mật khẩu mới"
                              : "Hiện mật khẩu mới"
                          }
                          className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
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
                name="confirmPassword"
                rules={{
                  required: "Vui lòng nhập lại mật khẩu mới.",
                  validate: (value) =>
                    value === form.getValues("newPassword") ||
                    "Mật khẩu xác nhận không khớp.",
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">
                      Nhập lại mật khẩu mới
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          className="h-11 rounded-xl border-slate-200/80 bg-white pr-11 pl-10"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Ẩn mật khẩu xác nhận"
                              : "Hiện mật khẩu xác nhận"
                          }
                          className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end border-t border-slate-100 pt-5">
                <Button
                  type="submit"
                  disabled={changePassword.isPending}
                  className="h-11 min-w-[148px] cursor-pointer rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800"
                >
                  {changePassword.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </span>
                  ) : (
                    "Lưu mật khẩu"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </section>
      </div>
    </div>
  );
}
