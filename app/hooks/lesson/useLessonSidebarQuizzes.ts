import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  LessonQuizService,
  mapAssignedQuizzesToListItems,
} from "@/app/service/lessonQuiz.service";

export type LessonSidebarQuizRef = {
  quizId: string;
  title: string;
};

export function useLessonSidebarQuizzes(lessonIds: string[]) {
  const stableKey = useMemo(
    () => Array.from(new Set(lessonIds.filter(Boolean))).sort().join(","),
    [lessonIds],
  );

  const stableIds = useMemo(
    () => (stableKey ? stableKey.split(",") : []),
    [stableKey],
  );

  const quizQueries = useQueries({
    queries: stableIds.map((id) => ({
      queryKey: ["lesson-quizzes", id],
      queryFn: async () => {
        const quizzes = await LessonQuizService.getLessonQuizzes(id);
        return mapAssignedQuizzesToListItems(quizzes);
      },
      enabled: Boolean(id),
      staleTime: 30_000,
    })),
  });

  return useMemo(() => {
    const map: Record<string, LessonSidebarQuizRef[]> = {};

    stableIds.forEach((id, index) => {
      const quizzes = quizQueries[index]?.data ?? [];
      map[id] = quizzes.map((quiz) => ({
        quizId: quiz.quizId,
        title: quiz.title,
      }));
    });

    return map;
  }, [stableIds, quizQueries]);
}

export function mergeLessonQuizzes(
  snapQuizzes: LessonSidebarQuizRef[],
  remote?: LessonSidebarQuizRef[],
): { hasQuiz: boolean; quizzes: LessonSidebarQuizRef[] } {
  const quizzes = (remote?.length ?? 0) > 0 ? remote! : snapQuizzes;

  return {
    hasQuiz: quizzes.length > 0,
    quizzes,
  };
}
