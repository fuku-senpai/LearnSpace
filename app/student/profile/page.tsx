"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Camera,
  Loader2,
  Mail,
  MapPin,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { useGetStudentProfileQuery } from "@/app/hooks/profile/useGetStudentProfile";
import { useUpdateProfileMutation } from "@/app/hooks/profile/useUpdateProfile";
import { uploadAvatarToCloudinary } from "@/app/service/upload-avatar.service";
import { useAuthStore } from "@/app/store/auth.store";
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
import { Textarea } from "@/components/ui/textarea";

type ProfileFormValues = {
  fullName: string;
  email: string;
  address: string;
  avatar: string;
};

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

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

  return "Không thể cập nhật thông tin.";
};

const StudentProfilePage = () => {
  const authUser = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading, isError } = useGetStudentProfileQuery();
  const updateProfile = useUpdateProfileMutation();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      avatar: "",
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      fullName: profile.fullName || authUser?.fullName || "",
      email: profile.email || "",
      address: profile.address || "",
      avatar: profile.avatar || "",
    });
  }, [profile, authUser?.fullName, form]);

  const displayName =
    form.watch("fullName") || profile?.fullName || authUser?.fullName || "—";
  const avatarUrl = form.watch("avatar") || profile?.avatar || "";
  const emailValue = form.watch("email") || profile?.email || "";
  const isSaving = updateProfile.isPending || isUploadingAvatar;

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      setIsUploadingAvatar(true);

      try {
        const uploadedUrl = await uploadAvatarToCloudinary(file);
        form.setValue("avatar", uploadedUrl, { shouldDirty: true });
        toast.success("Tải ảnh lên thành công.");
      } catch (error: unknown) {
        toast.error(getErrorMessage(error));
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [form],
  );

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void handleAvatarUpload(file);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleAvatarUpload(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const response = await updateProfile.mutateAsync({
        fullName: values.fullName.trim(),
        address: values.address.trim(),
        avatar: values.avatar.trim(),
      });
      toast.success(response.message || "Cập nhật thông tin thành công.");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 p-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        Đang tải hồ sơ...
      </div>
    );
  }

  if (isError && !profile) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-900">
            Không thể tải thông tin cá nhân
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Vui lòng thử lại sau hoặc liên hệ quản trị viên.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="space-y-4 border-b border-slate-200 pb-6">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-violet-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Tài khoản
          </span>
          <div className="h-px w-full max-w-[100px] bg-gradient-to-r from-violet-400 to-transparent" />
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Thông tin cá nhân
            </h2>
            <p className="text-sm text-slate-500">
              Quản lý ảnh đại diện và thông tin liên hệ của bạn.
            </p>
          </div>
        </section>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-8"
          >
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div
                onDragEnter={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                }}
                onDrop={handleDrop}
                className={`rounded-2xl border bg-white p-6 shadow-sm transition ${
                  isDragActive
                    ? "border-violet-300 ring-2 ring-violet-100"
                    : "border-slate-200/80"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                <div className="flex flex-col items-center text-center">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                    className="group relative cursor-pointer disabled:cursor-not-allowed"
                  >
                    <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-md ring-1 ring-slate-200">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-2xl font-semibold text-slate-500">
                          {getInitials(displayName)}
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition group-hover:bg-slate-900/45">
                        <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-800 opacity-0 shadow-sm transition group-hover:opacity-100">
                          {isUploadingAvatar ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Đang tải...
                            </>
                          ) : (
                            <>
                              <Camera className="h-3.5 w-3.5" />
                              Đổi ảnh
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </button>

                  <h3 className="mt-5 text-lg font-semibold text-slate-900">
                    {displayName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">{emailValue}</p>

                 
                </div>

                <div className="mt-6 space-y-2 border-t border-slate-100 pt-5">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full cursor-pointer rounded-xl border-slate-200/80"
                    disabled={isUploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingAvatar ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
                  </Button>
                  {avatarUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 w-full cursor-pointer gap-2 text-slate-500 hover:text-rose-600"
                      onClick={() =>
                        form.setValue("avatar", "", { shouldDirty: true })
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Gỡ ảnh đại diện
                    </Button>
                  ) : null}
                
                </div>
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
                <h3 className="text-base font-semibold text-slate-900">
                  Chi tiết hồ sơ
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Thông tin hiển thị với giáo viên và quản trị viên.
                </p>
              </div>

              <div className="space-y-6 px-6 py-6 sm:px-8">
                <FormField
                  control={form.control}
                  name="fullName"
                  rules={{ required: "Vui lòng nhập họ tên." }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        Họ và tên
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <UserRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            className="h-11 rounded-xl border-slate-200/80 bg-white pl-10"
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel className="text-sm font-medium text-slate-700">
                          Email
                        </FormLabel>
                       
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <Input
                            {...field}
                            readOnly
                            className="h-11 cursor-not-allowed rounded-xl border-slate-200/80 bg-slate-50 pl-10 text-slate-600"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        Địa chỉ
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="pointer-events-none absolute top-3.5 left-3.5 h-4 w-4 text-slate-400" />
                          <Textarea
                            {...field}
                            className="min-h-[120px] resize-none rounded-xl border-slate-200/80 bg-white pl-10"
                            placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-slate-400">
                        Tuỳ chọn — dùng khi cần liên hệ ngoài lớp học.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <input type="hidden" {...form.register("avatar")} />

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
               
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-11 min-w-[148px] cursor-pointer rounded-xl bg-slate-900 px-6 text-white hover:bg-slate-800"
                >
                  {updateProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </section>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default StudentProfilePage;
