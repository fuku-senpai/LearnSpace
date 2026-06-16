"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  LessonQuizService,
  QuizBankFilter,
} from "@/app/service/lessonQuiz.service";

const QUIZ_BANK_INFINITE_SIZE = 4;

export const useGetQuizBankQuery = (
  filter: QuizBankFilter,
  enabled = true,
) =>
  useQuery({
    queryKey: ["question-bank", filter],
    queryFn: () => LessonQuizService.getQuizBank(filter),
    placeholderData: keepPreviousData,
    enabled,
  });

type QuizBankInfiniteFilter = Omit<QuizBankFilter, "page">;

export const useGetQuizBankInfiniteQuery = (
  filter: QuizBankInfiniteFilter,
  enabled = true,
) =>
  useInfiniteQuery({
    queryKey: ["question-bank", "infinite", filter],
    queryFn: ({ pageParam = 0 }) =>
      LessonQuizService.getQuizBank({
        ...filter,
        page: pageParam,
        size: filter.size ?? QUIZ_BANK_INFINITE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
    enabled,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

export { QUIZ_BANK_INFINITE_SIZE };
