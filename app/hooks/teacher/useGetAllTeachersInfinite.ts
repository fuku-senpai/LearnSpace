"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { TeacherService } from "@/app/service/teacher.service";

type UseGetAllTeachersInfiniteOptions = {
  size?: number;
  keyword?: string;
};

export const useGetAllTeachersInfiniteQuery = (
  options: UseGetAllTeachersInfiniteOptions = {},
) => {
  const size = options.size ?? 8;
  const keyword = options.keyword ?? "";

  return useInfiniteQuery({
    queryKey: ["teachers", "infinite", size, keyword],
    queryFn: ({ pageParam }) =>
      TeacherService.getAllTeachers({
        page: pageParam,
        size,
        keyword,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.page + 1 < lastPage.totalPages ? lastPage.page + 1 : undefined,
  });
};
