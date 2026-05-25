"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";

import { ParticleBackground } from "@/components/particle-background";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

type LoginFormValues = {
  role: "STUDENT" | "TEACHER";
  email: string;
  password: string;
};

const LoginPage = () => {
  const form = useForm<LoginFormValues>({
    defaultValues: {
      role: "STUDENT",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const { mutateAsync, isPending } = useLogin();
  const resetValidation = () => form.clearErrors();

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await mutateAsync({
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f6fb]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(59,130,246,0.12)_0%,transparent_60%),radial-gradient(900px_600px_at_100%_0%,rgba(16,185,129,0.12)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0)_55%)]" />
      <ParticleBackground />

      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16">
        <div className="grid w-full items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-7 motion-safe:animate-[fade-up_700ms_ease-out_both]">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <span className="size-2 rounded-full bg-emerald-500" />
              Nền tảng học trực tuyến
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Học tập và giảng dạy trực tuyến
              </h1>
            </div>

            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Giáo viên quản lý video và tài liệu học tập.
              </div>

              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Học viên xem lại bài giảng mọi lúc.
              </div>
            </div>
          </div>

          <Card className="w-full max-w-md border-slate-200/80 bg-white shadow-xl md:justify-self-end motion-safe:animate-[fade-up_700ms_ease-out_both] motion-safe:[animation-delay:120ms]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-slate-900">Đăng nhập</CardTitle>
              <CardDescription className="text-slate-500">
                Chọn vai trò và nhập thông tin tài khoản.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    form.handleSubmit(onSubmit)(event);
                  }}
                  className="space-y-5"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="role"
                    rules={{ required: "Vui lòng chọn vai trò." }}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
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
                              <span className="block rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-600 transition peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm">
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
                              <span className="block rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-600 transition peer-checked:bg-white peer-checked:text-slate-900 peer-checked:shadow-sm">
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
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="phuc@gmail.com"
                            autoComplete="email"
                            className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70 shadow-sm hover:border-slate-300/70 focus-visible:border-slate-300 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none"
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
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70 shadow-sm hover:border-slate-300/70 focus-visible:border-slate-300 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-11 font-bold rounded-2xl cursor-pointer bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Đăng nhập
                  </Button>
                  {form.formState.errors.root?.message ? (
                    <p className="text-xs text-red-500">
                      {form.formState.errors.root.message}
                    </p>
                  ) : null}
                </form>
              </Form>
            </CardContent>
            <CardFooter className="justify-between text-xs text-slate-500">
              <Link
                className="transition hover:text-slate-900"
                href="/forgot"
                onClick={resetValidation}
              >
                Quên mật khẩu?
              </Link>
              <div>
                Chưa có tài khoản?{" "}
                <Link
                  className="font-medium text-slate-900"
                  href="/register"
                  onClick={resetValidation}
                >
                  Đăng ký
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
