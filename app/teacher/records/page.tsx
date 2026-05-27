"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useUploadFile } from "@/app/hooks/lessonResource/useUploadAuto";
import { useGetRecordsByLessonQuery } from "@/app/hooks/records/useGetRecords";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateNewRecord } from "@/app/hooks/records/useCreateNewRecord";
import { RecordItem as RecordApiItem } from "@/app/service/record.service";

type MediaType = "audio" | "video";

type UploadedMedia = {
  previewUrl: string;
  uploadUrl?: string;
  type: MediaType;
  name: string;
};

const RecordsManagementContent = () => {
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lessonId") ?? "";
  const lessonTitle = searchParams.get("lessonTitle") ?? "";
  const materialTitle = searchParams.get("materialTitle") ?? "";
  const classTitle = searchParams.get("classTitle") ?? "";
  const { mutateAsync: createRecord } = useCreateNewRecord();
  const { upload, isUploading } = useUploadFile("video");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedMedia[]>([]);

  const [title, setTitle] = useState("");
  const { data: records = [], isLoading, isFetching } = useGetRecordsByLessonQuery(
    lessonId,
  );

  const recordItems = records as RecordApiItem[];

  useEffect(() => {
    return () => {
      uploadedFiles.forEach((file) => {
        if (file.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, [uploadedFiles]);

  // upload file
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const mediaType: MediaType = file.type.startsWith("video")
      ? "video"
      : "audio";
    const previewUrl = URL.createObjectURL(file);

    setUploadedFiles([
      {
        previewUrl,
        type: mediaType,
        name: file.name,
      },
    ]);

    try {
      const url = await upload(file);

      setUploadedFiles([
        {
          previewUrl,
          uploadUrl: url,
          type: mediaType,
          name: file.name,
        },
      ]);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  //  validate
  const canCreate = useMemo(() => {
    return (
      lessonId.length > 0 &&
      title.trim().length > 0 &&
      uploadedFiles.length === 1 &&
      Boolean(uploadedFiles[0]?.uploadUrl) &&
      !isUploading
    );
  }, [lessonId, title, uploadedFiles, isUploading]);

  //  create record
 const handleCreate = async () => {
  if (!canCreate) return;

  try {
     const videoUrl = uploadedFiles[0]?.uploadUrl;

    const payload = {
      title: title.trim(),
      videoUrl: videoUrl || "",
      lessonId,
    };
   console.log("Payload:", payload)
    await createRecord(payload);

    // reset
    setTitle("");
    setUploadedFiles([]);
  } catch (error) {
    console.error("❌ Create record failed", error);
  }
};

  return (
    <div className="min-h-screen bg-[#f4f6fb]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <div className="rounded-2xl border bg-white px-6 py-5 shadow-sm">
          <h1 className="text-2xl font-semibold">Tài liệu buổi học</h1>

          <div className="mt-2 text-sm text-slate-600">
            Các record theo buổi học sẽ được hiển thị ở đây. Chọn buổi học để xem hoặc tạo bản ghi mới.
          </div>
         
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
          {/* LIST */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách bản ghi</CardTitle>
            </CardHeader>

            <CardContent>
              {!lessonId ? (
                <div className="rounded-xl border bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Chọn buổi học để xem dữ liệu
                </div>
              ) : isLoading || isFetching ? (
                <div className="rounded-xl border bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Đang tải danh sách bản ghi...
                </div>
              ) : recordItems.length === 0 ? (
                <div className="rounded-xl border bg-slate-50 p-6 text-center text-sm text-slate-500">
                  Chưa có bản ghi
                </div>
              ) : (
                <div className="space-y-4">
                  {recordItems.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl border bg-white p-4 shadow-sm"
                    >
                      <div className="font-semibold">{r.title}</div>

                      <div className="mt-3 space-y-3">
                        <div className="aspect-video overflow-hidden rounded-lg bg-black">
                          <video
                            src={r.videoUrl}
                            controls
                            preload="metadata"
                            playsInline
                            crossOrigin="anonymous"
                            className="h-full w-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* CREATE */}
          <Card>
            <CardHeader>
              <CardTitle>Tạo bản ghi</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Input
                placeholder="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* UPLOAD */}
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFile}
                />

                <div className="w-full max-w-md rounded-2xl border border-dashed p-5 bg-white shadow-sm">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-sm font-semibold text-gray-700">
                      Upload video bài học
                    </h3>

                    <p className="text-xs text-gray-500">
                      Hỗ trợ 1 file video duy nhất (MP4, MOV, AVI)
                    </p>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-2 cursor-pointer border-dashed hover:bg-gray-50"
                      onClick={() => fileRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading
                        ? "⏳ Đang upload..."
                        : "📁 Chọn video từ máy"}
                    </Button>

                    {/* trạng thái */}
                    {isUploading && (
                      <div className="mt-3 space-y-1">
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full w-1/2 bg-blue-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-blue-600">
                          Đang tải lên, vui lòng chờ...
                        </p>
                      </div>
                    )}

                    {/* note */}
                    <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                      <span>⚠️</span>
                      <span>
                        Chỉ được upload 1 file video. File mới sẽ thay thế file
                        cũ.
                      </span>
                    </div>
                  </div>
                </div>

                {/* PREVIEW FILE */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {uploadedFiles.map((f, i) => (
                      <div
                        key={i}
                        className="rounded-lg border bg-white p-2 relative"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="mb-2 text-xs text-slate-500">
                              {f.name}
                            </div>

                            {f.type === "video" ? (
                              <div className="aspect-video overflow-hidden rounded-md bg-black">
                                <video
                                  src={f.previewUrl}
                                  controls
                                  preload="metadata"
                                  playsInline
                                  crossOrigin="anonymous"
                                  className="h-full w-full"
                                />
                              </div>
                            ) : (
                              <audio src={f.previewUrl} controls className="w-full" />
                            )}
                          </div>

                          <div className="ml-3 shrink-0">
                            <Button
                              className="cursor-pointer"
                              variant="ghost"
                              onClick={() => {
                                uploadedFiles.forEach((file) => {
                                  if (file.previewUrl.startsWith("blob:")) {
                                    URL.revokeObjectURL(file.previewUrl);
                                  }
                                });
                                setUploadedFiles([]);
                                if (fileRef.current) fileRef.current.value = "";
                              }}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="justify-end border-t bg-slate-50">
              <Button
                className="cursor-pointer"
                onClick={handleCreate}
                disabled={!canCreate}
              >
                Tạo bản ghi
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function RecordsManagement() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-sm text-slate-500">
          Đang tải bản ghi...
        </div>
      }
    >
      <RecordsManagementContent />
    </Suspense>
  );
}
