"use client";
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
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Users,
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

const roleTabs = [
  {
    value: "STUDENT" as const,
    label: "Học sinh",
    description: "Học tập & làm bài",
    icon: GraduationCap,
  },
  {
    value: "TEACHER" as const,
    label: "Giáo viên",
    description: "Quản lý lớp học",
    icon: Users,
  },
];

const loginInputClass =
  "h-12 rounded-2xl border-white/10 bg-[#111111]/80 text-[15px] leading-normal text-zinc-100 placeholder:text-zinc-500 focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/30 focus-visible:outline-none";

const loginInputIconClass =
  "pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 text-zinc-500 transition-colors duration-200 group-focus-within:text-amber-400/90";

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
          </div>

          {/* RIGHT — login card */}
          <div className="w-full motion-safe:animate-[fade-up_700ms_ease-out_both] motion-safe:[animation-delay:120ms] lg:min-w-0">
            <div className="float-bob-slow relative w-full">
              <div className="space-y-4 px-6 py-6">
                <div className="flex items-center gap-3">
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
                        <FormItem className="space-y-2">
                          <FormLabel className="text-[11px] font-semibold tracking-[0.12em] text-zinc-500 uppercase">
                            Vai trò
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#111111]/80 p-1.5">
                              {roleTabs.map((role) => {
                                const Icon = role.icon;

                                return (
                                  <label
                                    key={role.value}
                                    className="group cursor-pointer"
                                  >
                                    <input
                                      className="peer sr-only"
                                      type="radio"
                                      name={field.name}
                                      value={role.value}
                                      checked={field.value === role.value}
                                      onChange={() => {
                                        field.onChange(role.value);
                                        resetValidation();
                                      }}
                                    />
                                    <span
                                      className={cn(
                                        "flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-transparent px-3 py-3 text-center transition-all duration-200",
                                        "text-zinc-400",
                                        "group-hover:border-white/10 group-hover:bg-white/[0.03] group-hover:text-white",
                                        "peer-checked:border-amber-400/30 peer-checked:bg-amber-400 peer-checked:text-zinc-900 peer-checked:shadow-[0_6px_20px_rgba(251,191,36,0.28)]",
                                        "group-hover:peer-checked:border-amber-300/60 group-hover:peer-checked:bg-amber-300 group-hover:peer-checked:text-zinc-900 group-hover:peer-checked:shadow-[0_8px_26px_rgba(251,191,36,0.45)]",
                                      )}
                                    >
                                      <Icon className="h-5 w-5 shrink-0 transition-colors duration-200" />
                                      <span className="text-sm font-semibold leading-none">
                                        {role.label}
                                      </span>
                                      <span className="text-[10px] font-medium leading-none opacity-70">
                                        {role.description}
                                      </span>
                                    </span>
                                  </label>
                                );
                              })}
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
                            <div className="group relative">
                              <Mail
                                className={loginInputIconClass}
                                strokeWidth={1.5}
                              />
                              <Input
                                {...field}
                                type="email"
                                placeholder="phuc@gmail.com"
                                autoComplete="email"
                                className={cn(loginInputClass, "pr-4 pl-11")}
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
                            <div className="group relative">
                              <Lock
                                className={loginInputIconClass}
                                strokeWidth={1.5}
                              />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className={cn(loginInputClass, "pr-11 pl-11")}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={
                                  showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                                }
                                className="absolute top-1/2 right-3.5 -translate-y-1/2 text-zinc-500 transition hover:text-amber-300"
                              >
                                {showPassword ? (
                                  <EyeOff
                                    className="h-[18px] w-[18px] cursor-pointer"
                                    strokeWidth={1.5}
                                  />
                                ) : (
                                  <Eye
                                    className="h-[18px] w-[18px] cursor-pointer"
                                    strokeWidth={1.5}
                                  />
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

                <div className="flex items-center justify-end pt-3">
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
