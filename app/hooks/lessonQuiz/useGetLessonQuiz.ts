import { useQuery } from "@tanstack/react-query";
import { LessonQuizService } from "@/app/service/lessonQuiz.service";

export const useGetLessonQuizQuery = (quizId?: string) =>
  useQuery({
    queryKey: ["lesson-quiz", quizId],
    queryFn: () => LessonQuizService.getLessonQuizById(quizId as string),
    enabled: Boolean(quizId),
  });
