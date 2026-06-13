"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import {
  ClassService,
  type GetAllClassesFilter,
} from "@/app/service/classroom.service";

type UseGetClassesInfiniteOptions = Partial<
  Pick<GetAllClassesFilter, "code" | "name">
> & {
  size?: number;
};

export const useGetClassesInfiniteQuery = (
  options: UseGetClassesInfiniteOptions = {},
) => {
  const size = options.size ?? 8;
  const code = options.code ?? "";
  const name = options.name ?? "";

  return useInfiniteQuery({
    queryKey: ["classes", "infinite", size, code, name],
    queryFn: ({ pageParam }) =>
      ClassService.getAllClasses({
        page: pageParam,
        size,
        code,
        name,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.number ?? lastPage.pageable?.pageNumber ?? 0;
      const totalPages = lastPage.totalPages ?? 0;

      return currentPage + 1 < totalPages ? currentPage + 1 : undefined;
    },
  });
};
