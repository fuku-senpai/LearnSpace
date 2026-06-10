// import { env } from "@/config/env";

// const isVideoFile = (file: File) => file.type.startsWith("video/");

// const toPlayableCloudinaryVideoUrl = (url: string) => {
//   if (url.includes("f_mp4,q_auto")) {
//     return url;
//   }

//   return url.replace("/upload/", "/upload/f_mp4,q_auto/");
// };

// const waitForVideoMetadata = async (
//   url: string,
//   timeoutMs = 30000,
// ): Promise<void> => {
//   if (typeof document === "undefined") {
//     return;
//   }

//   await new Promise<void>((resolve, reject) => {
//     const video = document.createElement("video");
//     let settled = false;

//     const cleanup = () => {
//       video.removeAttribute("src");
//       video.load();
//     };

//     const finish = () => {
//       if (settled) return;
//       settled = true;
//       cleanup();
//       resolve();
//     };

//     const fail = () => {
//       if (settled) return;
//       settled = true;
//       cleanup();
//       reject(new Error("Video chưa sẵn sàng để phát"));
//     };

//     const timer = window.setTimeout(fail, timeoutMs);

//     video.preload = "metadata";
//     video.crossOrigin = "anonymous";
//     video.onloadedmetadata = () => {
//       window.clearTimeout(timer);
//       finish();
//     };
//     video.onerror = () => {
//       window.clearTimeout(timer);
//       fail();
//     };

//     video.src = url;
//     video.load();
//   });
// };

// export const uploadVideoToCloudinary = async (
//   file: File,
// ): Promise<string> => {
//   const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env;

//   if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
//     throw new Error("Thiếu cấu hình Cloudinary");
//   }

//   if (!file) {
//     throw new Error("File không hợp lệ");
//   }

//   if (!isVideoFile(file)) {
//     throw new Error("Chỉ hỗ trợ file video");
//   }

//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//   const response = await fetch(
//     `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
//     {
//       method: "POST",
//       body: formData,
//     },
//   );

//   if (!response.ok) {
//     const errorData = await response.json();
//     console.error("Cloudinary error:", errorData);

//     throw new Error(errorData?.error?.message || "Upload thất bại");
//   }

//   const data = await response.json();
//   const mediaUrl = data?.secure_url || data?.url;

//   if (!mediaUrl) {
//     throw new Error("Không lấy được secure_url cho video");
//   }

//   const playableUrl = toPlayableCloudinaryVideoUrl(mediaUrl);

//   await waitForVideoMetadata(playableUrl);

//   return playableUrl;
// };

import { env } from "@/config/env";

const CHUNK_SIZE = 20 * 1024 * 1024; // 20MB

export const uploadVideoToCloudinary = async (
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } = env;

  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("Thiếu CLOUDINARY_CLOUD_NAME");
  }

  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Thiếu CLOUDINARY_UPLOAD_PRESET");
  }

  if (!file.type.startsWith("video/")) {
    throw new Error("Chỉ hỗ trợ video");
  }

  const uploadId =
    crypto.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const totalSize = file.size;

  let lastResponse: any = null;

  for (let start = 0; start < totalSize; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE, totalSize);

    const chunk = file.slice(start, end);

    const formData = new FormData();

    formData.append("file", chunk);

    formData.append(
      "upload_preset",
      CLOUDINARY_UPLOAD_PRESET,
    );

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        headers: {
          "X-Unique-Upload-Id": uploadId,
          "Content-Range": `bytes ${start}-${end - 1}/${totalSize}`,
        },
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      throw new Error(
        data?.error?.message || "Upload thất bại",
      );
    }

    lastResponse = data;

    const progress = Math.round((end / totalSize) * 100);

    onProgress?.(progress);
  }

  if (!lastResponse?.secure_url) {
    throw new Error("Không lấy được URL video");
  }

  return lastResponse.secure_url;
};