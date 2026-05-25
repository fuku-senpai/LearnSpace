"use client";
import { uploadFileToCloudinary } from "@/app/service/upload.service";
import { useState } from "react";
export const useUploadFile = () => {
  const [isUploading, setUploading] = useState(false);
  const upload = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadFileToCloudinary(file);
      return url;
    } finally {
      setUploading(false);
    }
  };
  return {upload,isUploading,};
};
