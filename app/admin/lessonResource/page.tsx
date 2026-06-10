"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { useCreateLessonResourceMutation } from "@/app/hooks/lessonResource/useCreateLessonResource";
import { useGetLessonResourcesQuery } from "@/app/hooks/lessonResource/useGetLessonResources";
import { useUploadFile } from "@/app/hooks/lessonResource/useUploadAuto";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type UploadedFile = {
  name: string;
  url: string;
  size: number;
};

type FormValues = {
  title: string;
  note: string;
  type: string;
  url: string;
  snapLessonId: string;
};

const LessonResourceContent = () => {
  const searchParams = useSearchParams();

  const snapLessonIdFromQuery = searchParams.get("snapLessonId") ?? "";
  const lessonTitleFromQuery = searchParams.get("lessonTitle") ?? "";
  const classTitleFromQuery = searchParams.get("classTitle") ?? "";
  const materialTitleFromQuery = searchParams.get("materialTitle") ?? "";

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { mutateAsync, isPending, error } = useCreateLessonResourceMutation();

  const { upload, isUploading } = useUploadFile("document");

  const { register, handleSubmit, setValue, watch, reset } =
    useForm<FormValues>({
      defaultValues: {
        title: "",
        note: "",
        type: "FILE",
        url: "",
        snapLessonId: snapLessonIdFromQuery,
      },
    });

  const type = watch("type");
  const title = watch("title");
  const url = watch("url");
  const snapLessonId = watch("snapLessonId");

  const { data: resources, isLoading: isLoadingResources } =
    useGetLessonResourcesQuery(snapLessonId);

  useEffect(() => {
    setValue("snapLessonId", snapLessonIdFromQuery);
  }, [snapLessonIdFromQuery, setValue]);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const uploadedUrl = await upload(file);

          return {
            name: file.name,
            url: uploadedUrl,
            size: file.size,
          };
        }),
      );

      setUploadedFiles((prev) => [...prev, ...uploaded]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    await handleUploadFiles(event.target.files);

    // clear input so selecting the same file again triggers onChange
    try {
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (e) {
      /* ignore */
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    setIsDragging(false);

    await handleUploadFiles(event.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = useMemo(() => {
    if (isPending || isUploading) return false;

    const hasResource =
      type === "FILE" ? uploadedFiles.length > 0 : url?.trim().length > 0;

    return (
      title?.trim().length > 0 &&
      snapLessonId?.trim().length > 0 &&
      hasResource
    );
  }, [title, snapLessonId, type, uploadedFiles, url, isPending, isUploading]);

  const onSubmit = async (data: FormValues) => {
    if (!canSubmit) return;

    try {
      const urls =
        data.type === "FILE"
          ? uploadedFiles.map((file) => file.url)
          : [data.url.trim()];

      const payload = {
        title: data.title.trim(),
        note: data.note.trim(),
        type: data.type,
        urls,
        snapLessonId: data.snapLessonId.trim(),
      };

      await mutateAsync(payload);

      reset({
        title: "",
        note: "",
        type: "FILE",
        url: "",
        snapLessonId: snapLessonIdFromQuery,
      });

      setUploadedFiles([]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Tài liệu cụ thể buổi học theo lớp
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Upload file hoặc thêm link cho buổi học.
          </p>
          {/* <p className="mt-2 text-sm font-medium text-slate-900">
            Lớp học: {classTitleFromQuery || "Chưa chọn lớp"}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Chủ đề: {materialTitleFromQuery || "Chưa chọn chủ đề"}
          </p>
          <p className="mt-2 text-sm font-medium text-slate-900">
            Buổi học: {lessonTitleFromQuery || snapLessonIdFromQuery || "Chưa chọn buổi học"}
          </p> */}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          <Card className="border-slate-200/80 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Danh sách tài liệu</CardTitle>

              <CardDescription>
                Danh sách tài liệu cho buổi học hiện tại.
              </CardDescription>
            </CardHeader>

           <CardContent>
  {!snapLessonId ? (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
      Chọn buổi học để xem tài liệu.
    </div>
  ) : isLoadingResources ? (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
      Đang tải danh sách tài liệu...
    </div>
  ) : resources?.length ? (
    <div className="space-y-4">
      {resources.map((r) => (
        <div
          key={r.id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                📄
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {r.title}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {r.note || "Không có mô tả"}
                </p>

                <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {r.type}
                </div>
              </div>
            </div>
          </div>

          {r.urls?.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                Tài nguyên
              </p>

              <div className="space-y-2">
                {r.urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm transition hover:bg-slate-50"
                  >
                    <span className="truncate text-slate-700">
                      File {index + 1}
                    </span>

                    <span className="text-slate-500">
                      Mở →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
      Chưa có tài liệu cho buổi học này.
    </div>
  )}
</CardContent>
          </Card>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Card className="border-slate-200/80 bg-white shadow-sm">
              <CardHeader>
                <CardTitle>Tạo tài liệu</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <Input placeholder="Tên tài liệu" {...register("title")} />

                <Select
                  value={type}
                  onValueChange={(value) => setValue("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="FILE">FILE</SelectItem>
                    <SelectItem value="LINK">LINK</SelectItem>
                  </SelectContent>
                </Select>

                {type === "FILE" ? (
                  <>
                    <label
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setIsDragging(true)}
                      onDragLeave={() => setIsDragging(false)}
                      className={`relative flex min-h-55 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition ${
                        isDragging
                          ? "border-slate-500 bg-slate-100"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />

                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <span className="text-4xl text-slate-500">+</span>
                      </div>

                      <p className="text-sm font-medium text-slate-800">
                        Kéo thả file vào đây
                      </p>

                      <p className="text-xs text-slate-500">
                        hoặc bấm dấu + để upload
                      </p>

                      {isUploading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/80">
                          <div className="flex items-center gap-3">
                            <svg className="h-5 w-5 animate-spin text-slate-700" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                            </svg>
                            <span className="text-sm font-medium text-slate-700">Đang upload...</span>
                          </div>
                        </div>
                      )}
                    </label>

                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-xl bg-white p-3"
                          >
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>

                              <p className="text-xs text-slate-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>

                            <Button
                              className="cursor-pointer"
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              Xóa
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Input placeholder="https://..." {...register("url")} />
                )}
                <Textarea
                  placeholder="Ghi chú"
                  className="min-h-62.5"
                  {...register("note")}
                />
                <Input
                  hidden
                  placeholder="Lesson ID"
                  {...register("snapLessonId")}
                />

                {error?.response?.data?.message && (
                  <p className="text-xs text-rose-600">
                    {error.response.data.message}
                  </p>
                )}
              </CardContent>

              <CardFooter className="justify-end border-t bg-slate-50">
                <Button className="cursor-pointer" type="submit" disabled={!canSubmit}>
                  {isUploading
                    ? "Đang upload..."
                    : isPending
                      ? "Đang lưu..."
                      : "Tạo tài liệu"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function LessonResource() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-sm text-slate-500">
          Đang tải tài liệu buổi học...
        </div>
      }
    >
      <LessonResourceContent />
    </Suspense>
  );
}
