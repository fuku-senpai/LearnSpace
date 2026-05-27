import { env } from "@/config/env";

const MAX_DOC_SIZE = 50 * 1024 * 1024;

const isPdfOrExcel = (file: File) => {
  return (
    file.type === "application/pdf" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel"
  );
};

export const uploadDocumentToCloudinary = async (
  file: File,
): Promise<string> => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Thiếu cấu hình Cloudinary");
  }

  if (!file) {
    throw new Error("File không hợp lệ");
  }

  if (!isPdfOrExcel(file)) {
    throw new Error("Chỉ hỗ trợ PDF hoặc Excel");
  }

  if (file.size > MAX_DOC_SIZE) {
    throw new Error("File tài liệu tối đa 50MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Cloudinary error:", errorData);

    throw new Error(errorData?.error?.message || "Upload thất bại");
  }

  const data = await response.json();
  const mediaUrl = data?.secure_url || data?.url;

  if (!mediaUrl) {
    throw new Error("Không lấy được URL file");
  }

  return mediaUrl;
};