import { useQuery } from "@tanstack/react-query";
import { LessonQuizService } from "@/app/service/lessonQuiz.service";

export const useGetGradedQuizSubmissionsQuery = (
  snapLessonQuizId?: string,
  enabled = true,
) =>
  useQuery({
    queryKey: ["graded-quiz-submissions", snapLessonQuizId],
    queryFn: () =>
      LessonQuizService.getGradedSubmissions(snapLessonQuizId as string),
    enabled: Boolean(snapLessonQuizId) && enabled,
    retry: false,
  });
