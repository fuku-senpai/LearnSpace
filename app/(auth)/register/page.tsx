
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

type RegisterFormValues = {
  role: "student" | "teacher";
  email: string;
  password: string;
};

const RegisterPage = () => {
  const form = useForm<RegisterFormValues>({
    defaultValues: {
      role: "student",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = (_values: RegisterFormValues) => {};
  const resetValidation = () => form.clearErrors();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f6fb]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(99,102,241,0.12)_0%,transparent_60%),radial-gradient(900px_600px_at_100%_0%,rgba(245,158,11,0.12)_0%,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.06)_0%,rgba(15,23,42,0)_55%)]" />
      <ParticleBackground />

      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-16">
        <div className="grid w-full items-center gap-12 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
              <span className="size-2 rounded-full bg-indigo-500" />
              Tạo tài khoản mới
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Đăng ký nhanh cho học sinh hoặc giáo viên
              </h1>
              <p className="text-sm text-slate-600 sm:text-base">
                Chỉ cần email và mật khẩu để bắt đầu sử dụng hệ thống lớp học.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Tài khoản phân quyền rõ ràng theo vai trò.
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Đồng bộ dữ liệu lớp học ngay lập tức.
              </div>
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-slate-400" />
                Hỗ trợ truy cập mọi lúc, mọi nơi.
              </div>
            </div>
          </div>

          <Card className="w-full max-w-md border-slate-200/80 bg-white shadow-xl md:justify-self-end">
            <CardHeader className="space-y-2">
              <CardTitle className="text-slate-900">Đăng ký</CardTitle>
              <CardDescription className="text-slate-500">
                Chọn vai trò và thiết lập mật khẩu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                  noValidate
                >
                  <FormField
                    control={form.control}
                    name="role"
                    rules={{ required: "Vui lòng chọn vai trò." }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vai trò</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
                            <label className="cursor-pointer">
                              <input
                                className="peer sr-only"
                                type="radio"
                                name={field.name}
                                value="student"
                                checked={field.value === "student"}
                                onChange={() => {
                                  field.onChange("student");
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
                                value="teacher"
                                checked={field.value === "teacher"}
                                onChange={() => {
                                  field.onChange("teacher");
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
                    rules={{ required: "Vui lòng nhập email." }}
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
                    rules={{ required: "Vui lòng nhập mật khẩu." }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder="Tối thiểu 8 ký tự"
                            autoComplete="new-password"
                            className="h-10 border-slate-200/70 bg-white text-slate-900 placeholder:text-slate-300/70 shadow-sm hover:border-slate-300/70 focus-visible:border-slate-300 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:outline-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Tạo tài khoản
                  </Button>

                  <div className="text-xs text-slate-500">
                    Bằng việc đăng ký, bạn đồng ý với điều khoản sử dụng và chính
                    sách bảo mật.
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="justify-between text-xs text-slate-500">
              <div>
                Đã có tài khoản?{" "}
                <Link
                  className="font-medium text-slate-900"
                  href="/login"
                  onClick={resetValidation}
                >
                  Đăng nhập
                </Link>
              </div>
              <Link
                className="transition hover:text-slate-900"
                href="/support"
                onClick={resetValidation}
              >
                Cần hỗ trợ?
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
