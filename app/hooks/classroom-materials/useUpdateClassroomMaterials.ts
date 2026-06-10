"use client";

import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
	ClassroomMaterialService,
	UpdateClassroomMaterialPayload,
	UpdateClassroomMaterialResponse,
} from "@/app/service/classroomMaterial.service";

type ErrorResponse = {
	message?: string;
	data?: Record<string, string>;
};

export const useUpdateClassroomMaterials = () => {
	return useMutation<
		UpdateClassroomMaterialResponse,
		AxiosError<ErrorResponse>,
		UpdateClassroomMaterialPayload
	>({
		mutationKey: ["update-classroom-material"],
		mutationFn: (payload) =>
			ClassroomMaterialService.updateClassroomMaterial(payload),
	});
};
