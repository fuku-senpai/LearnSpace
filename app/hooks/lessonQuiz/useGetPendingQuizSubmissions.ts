import { useQuery } from "@tanstack/react-query";
import { LessonQuizService } from "@/app/service/lessonQuiz.service";

export const useGetPendingQuizSubmissionsQuery = (
  snapLessonQuizId?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["pending-quiz-submissions", snapLessonQuizId],
    queryFn: () =>
      LessonQuizService.getPendingSubmissions(snapLessonQuizId as string),
    enabled: Boolean(snapLessonQuizId) && enabled,
    retry: false,
  });
