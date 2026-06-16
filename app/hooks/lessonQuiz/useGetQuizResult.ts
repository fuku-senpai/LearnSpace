import { useQuery } from "@tanstack/react-query";
import { LessonQuizService } from "@/app/service/lessonQuiz.service";

export const useGetQuizResultQuery = (
  snapLessonQuizId?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["quiz-result", snapLessonQuizId],
    queryFn: () =>
      LessonQuizService.getQuizResult(snapLessonQuizId as string),
    enabled: Boolean(snapLessonQuizId) && enabled,
    retry: false,
  });
