import { env } from "@/config/env";

const isVideoFile = (file: File) => file.type.startsWith("video/");

export const uploadVideoToCloudinary = async (
  file: File,
): Promise<string> => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Thiếu cấu hình Cloudinary");
  }

  if (!file) {
    throw new Error("File không hợp lệ");
  }

  if (!isVideoFile(file)) {
    throw new Error("Chỉ hỗ trợ file video");
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
  const mediaUrl = data?.capture_url || data?.playback_url || data?.secure_url || data?.url;

  if (!mediaUrl) {
    throw new Error("Không lấy được URL file");
  }

  return mediaUrl;
};