// import { env } from "@/config/env";

// /**
//  * =========================
//  * CLOUDINARY UPLOAD (PRO)
//  * =========================
//  * - Support: audio / video / image / document
//  * - No strict MIME dependency
//  * - Safe for large video (LMS / Udemy style)
//  */

// const MAX_DOC_SIZE = 50 * 1024 * 1024; // 50MB (docs only)

// const isMediaFile = (file: File) => {
//   return (
//     file.type.startsWith("audio/") ||
//     file.type.startsWith("video/") ||
//     file.type.startsWith("image/")
//   );
// };

// const isDocument = (file: File) => {
//   return (
//     file.type.includes("pdf") ||
//     file.type.includes("word") ||
//     file.type.includes("excel") ||
//     file.type.includes("presentation") ||
//     file.type.includes("zip") ||
//     file.type.includes("rar")
//   );
// };

// export const uploadFileToCloudinary = async (
//   file: File,
// ): Promise<string> => {
//   const {
//     CLOUDINARY_CLOUD_NAME,
//     CLOUDINARY_UPLOAD_PRESET,
//   } = env;

//   // =========================
//   // CHECK CONFIG
//   // =========================
//   if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
//     throw new Error("Thiếu cấu hình Cloudinary");
//   }

//   if (!file) {
//     throw new Error("File không hợp lệ");
//   }

//   // =========================
//   // VALIDATE TYPE
//   // =========================
//   if (!isMediaFile(file) && !isDocument(file)) {
//     throw new Error("Định dạng file không hỗ trợ");
//   }

//   // =========================
//   // VALIDATE SIZE (ONLY DOCS)
//   // =========================
//   if (isDocument(file) && file.size > MAX_DOC_SIZE) {
//     throw new Error("File tài liệu tối đa 50MB");
//   }

//   // =========================
//   // UPLOAD TO CLOUDINARY
//   // =========================
//   const formData = new FormData();

//   formData.append("file", file);
//   formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
//     {
//       method: "POST",
//       body: formData,
//     },
//   );

//   if (!response.ok) {
//     const errorData = await response.json();
//     console.error("Cloudinary error:", errorData);

//     throw new Error(
//       errorData?.error?.message || "Upload thất bại",
//     );
//   }

//   const data = await response.json();

//   if (!data?.secure_url) {
//     throw new Error("Không lấy được URL file");
//   }

//   // =========================
//   // RETURN CLEAN URL
//   // =========================
//   return data.secure_url;
// };


import { env } from "@/config/env";

/**
 * =========================
 * CLOUDINARY UPLOAD (PRO)
 * =========================
 * - Support: audio / video / image / document
 * - Safari-safe video playback
 * - Safe for LMS / large upload
 */

const MAX_DOC_SIZE =
  50 * 1024 * 1024; // 50MB

const isMediaFile = (
  file: File,
) => {
  return (
    file.type.startsWith("audio/") ||
    file.type.startsWith("video/") ||
    file.type.startsWith("image/")
  );
};

const isDocument = (
  file: File,
) => {
  return (
    file.type.includes("pdf") ||
    file.type.includes("word") ||
    file.type.includes("excel") ||
    file.type.includes(
      "presentation"
    ) ||
    file.type.includes("zip") ||
    file.type.includes("rar")
  );
};

/**
 * Safari-safe video URL
 * Convert MKV/MOV/AVI -> MP4 output
 */
const normalizeCloudinaryUrl = (
  url: string,
  file: File,
): string => {
  // Only transform video
  if (
    file.type.startsWith("video/")
  ) {
    return url.replace(
      "/video/upload/",
      "/video/upload/f_mp4,q_auto/"
    );
  }

  return url;
};

export const uploadFileToCloudinary =
  async (
    file: File,
  ): Promise<string> => {
    const {
      CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_UPLOAD_PRESET,
    } = env;

    // =========================
    // CHECK CONFIG
    // =========================
    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_UPLOAD_PRESET
    ) {
      throw new Error(
        "Thiếu cấu hình Cloudinary",
      );
    }

    if (!file) {
      throw new Error(
        "File không hợp lệ",
      );
    }

    // =========================
    // VALIDATE TYPE
    // =========================
    if (
      !isMediaFile(file) &&
      !isDocument(file)
    ) {
      throw new Error(
        "Định dạng file không hỗ trợ",
      );
    }

    // =========================
    // VALIDATE SIZE
    // =========================
    if (
      isDocument(file) &&
      file.size > MAX_DOC_SIZE
    ) {
      throw new Error(
        "File tài liệu tối đa 50MB",
      );
    }

    // =========================
    // UPLOAD
    // =========================
    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET,
    );

    const response =
      await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

    if (!response.ok) {
      const errorData =
        await response.json();

      console.error(
        "Cloudinary error:",
        errorData,
      );

      throw new Error(
        errorData?.error
          ?.message ||
          "Upload thất bại",
      );
    }

    const data =
      await response.json();

    if (!data?.secure_url) {
      throw new Error(
        "Không lấy được URL file",
      );
    }

    // =========================
    // RETURN FINAL URL
    // =========================
    return normalizeCloudinaryUrl(
      data.secure_url,
      file,
    );
  };