import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  GradeSubmissionPayload,
  GradeSubmissionResponse,
  LessonQuizService,
} from "@/app/service/lessonQuiz.service";

type ErrorResponse = {
  message?: string;
};

type GradeQuizSubmissionVariables = {
  submissionId: string;
  snapLessonQuizId: string;
  payload: GradeSubmissionPayload;
};

export const useGradeQuizSubmissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    GradeSubmissionResponse,
    AxiosError<ErrorResponse>,
    GradeQuizSubmissionVariables
  >({
    mutationKey: ["gradeQuizSubmission"],
    mutationFn: ({ submissionId, payload }) =>
      LessonQuizService.gradeSubmission(submissionId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["pending-quiz-submissions", variables.snapLessonQuizId],
      });
      queryClient.invalidateQueries({
        queryKey: ["graded-quiz-submissions", variables.snapLessonQuizId],
      });
    },
  });
};
