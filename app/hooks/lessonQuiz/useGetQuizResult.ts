import { useQuery } from "@tanstack/react-query";
import { LessonQuizService } from "@/app/service/lessonQuiz.service";

export const useGetQuizResultQuery = (quizId?: string, enabled = true) =>
  useQuery({
    queryKey: ["quiz-result", quizId],
    queryFn: () => LessonQuizService.getQuizResult(quizId as string),
    enabled: Boolean(quizId) && enabled,
    retry: false,
  });
