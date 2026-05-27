"use client";
import { uploadDocumentToCloudinary } from "@/app/service/upload-document.service";
import { uploadVideoToCloudinary } from "@/app/service/upload-video.service";
import { useState } from "react";

type UploadKind = "document" | "video";

export const useUploadFile = (kind: UploadKind = "document") => {
  const [isUploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    try {
      setUploading(true);
      const url =
        kind === "video"
          ? await uploadVideoToCloudinary(file)
          : await uploadDocumentToCloudinary(file);
      return url;
    } finally {
      setUploading(false);
    }
  };
  return { upload, isUploading };
};
