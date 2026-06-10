"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

import { ParticleBackground } from "@/components/particle-background";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/useLogin";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  ShieldCheck,
  User,
} from "lucide-react";

type LoginFormValues = {
  role: "STUDENT" | "TEACHER";
  email: string;
  password: string;
};

type AdminLoginFormValues = {
  email: string;
  password: string;
};

const featureTags = [
  "Quản lý video & tài liệu học tập",
  "Theo dõi lịch học & tiến độ lớp",
  "Phân quyền học sinh, giáo viên & quản trị",
];

const LoginPage = () => {
  const form = useForm<LoginFormValues>({
    defaultValues: {
      role: "STUDENT",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });
  const adminForm = useForm<AdminLoginFormValues>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const { mutateAsync: login, isPending: isLoginPending } = useLogin();
  const { mutateAsync: adminLogin, isPending: isAdminPending } = useLogin();
  const resetValidation = () => form.clearErrors();
  const resetAdminValidation = () => adminForm.clearErrors();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await login({
        ...values,
        deviceId: crypto.randomUUID(),
        deviceInfo: navigator.userAgent,
      });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Email hoặc mật khẩu không đúng.";

      form.setError("root", {
        message,
      });
    }
  };

  const onAdminSubmit = async (values: AdminLoginFormValues) => {
    try {
      await adminLogin({
        role: "ADMIN",
        ...values,
        deviceId: crypto.randomUUID(),
        deviceInfo: navigator.userAgent,
      });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ?? "Email hoặc mật khẩu không đúng.";

      adminForm.setError("root", {
        message,
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <ParticleBackground variant="gold" dust />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10 lg:px-8">
        <div className="grid w-full max-w-[940px] items-center gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,380px)] lg:gap-8">
          {/* LEFT — branding */}
          <div className="hidden flex-col justify-center gap-10 lg:flex">
            <div className="space-y-8 motion-safe:animate-[fade-up_700ms_ease-out_both]">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-400/25 bg-[#0d0d0d]/80 px-4 py-2 text-sm font-semibold tracking-[0.14em] text-amber-200/90 uppercase">
                <span className="size-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]" />
                Học trực tuyến
              </div>

              <div className="space-y-2">
                <h1 className="text-[3.1rem] font-bold leading-[1.06] tracking-tight text-white">
                  Hệ thống học tập
                  <br />
                  &amp; giảng dạy
                </h1>
                <p className="text-[3.1rem] font-bold leading-[1.06] text-amber-400">
                  Smart Dashboard
                </p>
                <p className="pt-1.5 text-2xl font-medium text-sky-300">
                  Video, tài liệu &amp; quản lý lớp
                </p>
              </div>

              <p className="text-[17px] leading-relaxed text-zinc-500">
                Tập trung lớp học, video và tài liệu trên một bảng điều khiển.
              </p>

              <div className="flex max-w-md flex-col gap-3">
                {featureTags.map((tag, index) => (
                  <span
                    key={tag}
                    className={`float-card inline-flex w-fit max-w-full items-center gap-2.5 rounded-full border border-white/10 bg-[#111111]/90 px-5 py-2.5 text-base text-zinc-300 ${
                      index % 2 === 0 ? "self-start" : "self-end"
                    }`}
                    style={{ animationDelay: `${index * 1.2}s` }}
                  >
                    <span className="size-2 shrink-0 rounded-full bg-amber-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-sm font-bold text-amber-300">
                CL
              </div>
              <div className="leading-tight">
                <p className="text-lg font-semibold text-white">
                  Course Learning Platform
                </p>
                <p className="text-sm text-zinc-500">
                  Trung tâm học tập trực tuyến
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT — login card */}
          <div className="w-full motion-safe:animate-[fade-up_700ms_ease-out_both] motion-safe:[animation-delay:120ms] lg:min-w-0">
            <div className="float-bob-slow relative w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <div className="h-px w-full bg-gradient-to-r from-amber-400/30 via-amber-300/20 to-sky-400/30" />

              <div className="space-y-4 px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-semibold text-zinc-100">
                      Đăng nhập hệ thống
                    </h2>
                    <p className="text-xs text-zinc-500">
                      Truy cập nền tảng học tập
                    </p>
                  </div>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      form.handleSubmit(onSubmit)(event);
                    }}
                    className="space-y-3.5"
                    noValidate
                  >
                    <FormField
                      control={form.control}
                      name="role"
                      rules={{ required: "Vui lòng chọn vai trò." }}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                            Vai trò
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/10 bg-[#111111]/80 p-1">
                              <label className="cursor-pointer">
                                <input
                                  className="peer sr-only"
                                  type="radio"
                                  name={field.name}
                                  value="STUDENT"
                                  checked={field.value === "STUDENT"}
                                  onChange={() => {
                                    field.onChange("STUDENT");
                                    resetValidation();
                                  }}
                                />
                                <span className="block rounded-xl px-2 py-2 text-center text-xs font-medium text-zinc-400 transition peer-checked:bg-amber-400 peer-checked:text-zinc-900">
                                  Học sinh
                                </span>
                              </label>
                              <label className="cursor-pointer">
                                <input
                                  className="peer sr-only"
                                  type="radio"
                                  name={field.name}
                                  value="TEACHER"
                                  checked={field.value === "TEACHER"}
                                  onChange={() => {
                                    field.onChange("TEACHER");
                                    resetValidation();
                                  }}
                                />
                                <span className="block rounded-xl px-2 py-2 text-center text-xs font-medium text-zinc-400 transition peer-checked:bg-amber-400 peer-checked:text-zinc-900">
                                  Giáo viên
                                </span>
                              </label>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      rules={{
                        required: "Vui lòng nhập email.",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Email không đúng định dạng.",
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                            Email
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                              <Input
                                {...field}
                                type="email"
                                placeholder="phuc@gmail.com"
                                autoComplete="email"
                                className="h-10 rounded-2xl border-white/10 bg-[#111111]/80 pr-3 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/30 focus-visible:outline-none"
                              />
                            </div>
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
                          value: 6,
                          message:
                            "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.",
                        },
                        validate: (value) => {
                          const hasUppercase = /[A-Z]/.test(value);
                          const hasNumber = /\d/.test(value);
                          const hasSpecial = /[^A-Za-z0-9]/.test(value);

                          if (hasUppercase && hasNumber && hasSpecial) {
                            return true;
                          }

                          return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.";
                        },
                      }}
                      render={({ field }) => (
                        <FormItem className="space-y-1">
                          <FormLabel className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                            Mật khẩu
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="h-10 rounded-2xl border-white/10 bg-[#111111]/80 pr-9 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/30 focus-visible:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 transition hover:text-amber-300"
                              >
                                {showPassword ? (
                                  <EyeOff className="h-3.5 w-3.5 cursor-pointer" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5 cursor-pointer" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={isLoginPending}
                      aria-busy={isLoginPending}
                      className="login-btn-gold h-10 w-full cursor-pointer rounded-2xl border-0 text-sm font-bold text-zinc-900 transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      {isLoginPending ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang đăng nhập...
                        </span>
                      ) : (
                        "Xác thực & Đăng nhập"
                      )}
                    </Button>

                    {form.formState.errors.root?.message ? (
                      <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                        {form.formState.errors.root.message}
                      </p>
                    ) : null}
                  </form>
                </Form>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <Link
                    className="text-[11px] text-amber-400 transition hover:text-amber-300"
                    href="/forgot"
                    onClick={resetValidation}
                  >
                    Quên mật khẩu?
                  </Link>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        onClick={resetAdminValidation}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-2xl border border-white/10 bg-[#111111]/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition hover:border-amber-400/30 hover:text-amber-300"
                      >
                        <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                        Quản trị viên
                      </button>
                    </DialogTrigger>
                    <DialogContent
                      overlayClassName="bg-black/70 backdrop-blur-sm"
                      className="gap-0 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.04] p-0 text-zinc-100 shadow-[0_24px_60px_rgba(0,0,0,0.55)] ring-0 backdrop-blur-2xl sm:max-w-[380px] [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:rounded-xl [&_[data-slot=dialog-close]]:text-zinc-500 hover:[&_[data-slot=dialog-close]]:bg-white/10 hover:[&_[data-slot=dialog-close]]:text-amber-300"
                    >
                      <div className="h-px w-full bg-gradient-to-r from-amber-400/40 via-amber-300/30 to-sky-400/40" />

                      <div className="space-y-4 p-6">
                        <DialogHeader className="flex-row items-center gap-3 space-y-0 text-left">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-400/10 text-amber-300">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div className="space-y-1 pr-8">
                            <DialogTitle className="text-base font-semibold text-zinc-100">
                              Đăng nhập quản trị
                            </DialogTitle>
                            <DialogDescription className="text-xs text-zinc-500">
                              Dành riêng cho quản trị hệ thống
                            </DialogDescription>
                          </div>
                        </DialogHeader>

                        <Form {...adminForm}>
                          <form
                            onSubmit={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              adminForm.handleSubmit(onAdminSubmit)(event);
                            }}
                            className="space-y-3.5"
                            noValidate
                          >
                            <FormField
                              control={adminForm.control}
                              name="email"
                              rules={{
                                required: "Vui lòng nhập email.",
                                pattern: {
                                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                  message: "Email không đúng định dạng.",
                                },
                              }}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                                    Email
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <User className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                                      <Input
                                        {...field}
                                        type="email"
                                        placeholder="admin@domain.com"
                                        autoComplete="email"
                                        className="h-10 rounded-2xl border-white/10 bg-[#111111]/80 pr-3 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/30 focus-visible:outline-none"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={adminForm.control}
                              name="password"
                              rules={{
                                required: "Vui lòng nhập mật khẩu.",
                                minLength: {
                                  value: 6,
                                  message:
                                    "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.",
                                },
                                validate: (value) => {
                                  const hasUppercase = /[A-Z]/.test(value);
                                  const hasNumber = /\d/.test(value);
                                  const hasSpecial = /[^A-Za-z0-9]/.test(value);

                                  if (
                                    hasUppercase &&
                                    hasNumber &&
                                    hasSpecial
                                  ) {
                                    return true;
                                  }

                                  return "Mật khẩu phải có ít nhất 6 ký tự, bao gồm in hoa, số và ký tự đặc biệt.";
                                },
                              }}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormLabel className="text-[10px] font-semibold tracking-[0.14em] text-zinc-500 uppercase">
                                    Mật khẩu
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Lock className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
                                      <Input
                                        {...field}
                                        type={
                                          showAdminPassword
                                            ? "text"
                                            : "password"
                                        }
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        className="h-10 rounded-2xl border-white/10 bg-[#111111]/80 pr-9 pl-9 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/30 focus-visible:outline-none"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setShowAdminPassword((prev) => !prev)
                                        }
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 transition hover:text-amber-300"
                                      >
                                        {showAdminPassword ? (
                                          <EyeOff className="h-3.5 w-3.5 cursor-pointer" />
                                        ) : (
                                          <Eye className="h-3.5 w-3.5 cursor-pointer" />
                                        )}
                                      </button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="submit"
                              disabled={isAdminPending}
                              aria-busy={isAdminPending}
                              className="login-btn-gold h-10 w-full cursor-pointer rounded-2xl border-0 text-sm font-bold text-zinc-900 transition-all duration-200 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-80"
                            >
                              {isAdminPending ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Đang đăng nhập...
                                </span>
                              ) : (
                                "Xác thực & Đăng nhập"
                              )}
                            </Button>

                            {adminForm.formState.errors.root?.message ? (
                              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                                {adminForm.formState.errors.root.message}
                              </p>
                            ) : null}
                          </form>
                        </Form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
