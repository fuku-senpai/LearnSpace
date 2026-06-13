import { env } from "@/config/env";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const isImageFile = (file: File) => file.type.startsWith("image/");

export const uploadAvatarToCloudinary = async (file: File): Promise<string> => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Thiếu cấu hình Cloudinary");
  }

  if (!file) {
    throw new Error("File không hợp lệ");
  }

  if (!isImageFile(file)) {
    throw new Error("Chỉ hỗ trợ file ảnh (JPG, PNG, WEBP...)");
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("Ảnh đại diện tối đa 5MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Upload ảnh thất bại");
  }

  const data = await response.json();
  const mediaUrl = data?.secure_url || data?.url;

  if (!mediaUrl) {
    throw new Error("Không lấy được URL ảnh");
  }

  return mediaUrl;
};
