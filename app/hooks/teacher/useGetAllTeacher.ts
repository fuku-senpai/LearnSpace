"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
	GetAllTeachersFilter,
	TeacherService,
} from "@/app/service/teacher.service";

export const useGetAllTeacherQuery = (filter: GetAllTeachersFilter) =>
	useQuery({
		queryKey: ["teachers", filter],
		queryFn: () => TeacherService.getAllTeachers(filter),
		placeholderData: keepPreviousData,
	});

