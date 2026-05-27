import { env } from "@/config/env";

const isVideoFile = (file: File) => file.type.startsWith("video/");

const toPlayableCloudinaryVideoUrl = (url: string) => {
  if (url.includes("f_mp4,q_auto")) {
    return url;
  }

  return url.replace("/upload/", "/upload/f_mp4,q_auto/");
};

const waitForVideoMetadata = async (
  url: string,
  timeoutMs = 30000,
): Promise<void> => {
  if (typeof document === "undefined") {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const video = document.createElement("video");
    let settled = false;

    const cleanup = () => {
      video.removeAttribute("src");
      video.load();
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error("Video chưa sẵn sàng để phát"));
    };

    const timer = window.setTimeout(fail, timeoutMs);

    video.preload = "metadata";
    video.crossOrigin = "anonymous";
    video.onloadedmetadata = () => {
      window.clearTimeout(timer);
      finish();
    };
    video.onerror = () => {
      window.clearTimeout(timer);
      fail();
    };

    video.src = url;
    video.load();
  });
};

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
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
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
    throw new Error("Không lấy được secure_url cho video");
  }

  const playableUrl = toPlayableCloudinaryVideoUrl(mediaUrl);

  await waitForVideoMetadata(playableUrl);

  return playableUrl;
};