import { AxiosResponse } from "axios";
import { axiosClient } from "../lib/axiosClient";

export type QuizType = "MULTIPLE_CHOICE" | "ESSAY";

export type QuizOptionPayload = {
  content: string;
  correct: boolean;
};

export type QuizQuestionPayload = {
  content: string;
  points: number;
  essayAnswer?: string;
  options?: QuizOptionPayload[];
};

export type CreateLessonQuizPayload = {
  title: string;
  description: string;
  snapLessonId: string;
  durationMinutes: number;
  passScore: number;
  quizType: QuizType;
  questions: QuizQuestionPayload[];
};

export type CreateLessonQuizResponse = {
  message?: string;
};

export type QuizOptionDetail = {
  optionId: string;
  content: string;
  correct: boolean;
};

export type QuizQuestionDetail = {
  questionId: string;
  content: string;
  points: number;
  essayAnswer: string | null;
  options: QuizOptionDetail[];
};

export type LessonQuizDetail = {
  quizId: string;
  title: string;
  description: string;
  durationMinutes: number;
  passScore: number;
  quizType: QuizType;
  questions: QuizQuestionDetail[];
};

export type SubmitQuizAnswerPayload = {
  questionId: string;
  selectedOptionId?: string;
  essayAnswer?: string;
};

export type SubmitQuizPayload = {
  answers: SubmitQuizAnswerPayload[];
};

export type SubmitQuizResponse = {
  message?: string;
  earnedPoints?: number;
  totalPoints?: number;
  passScore?: number;
  passed?: boolean;
};

export type QuizResultOption = {
  optionId: string;
  content: string;
  correct: boolean;
};

export type QuizResultQuestion = {
  questionId: string;
  questionContent: string;
  points: number;
  correct: boolean;
  selectedOptionId: string | null;
  essayAnswer: string | null;
  options: QuizResultOption[];
};

export type QuizSubmissionResult = {
  submissionId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  passScore: number;
  passed: boolean;
  status: string;
  questions: QuizResultQuestion[];
};

export const buildSubmitQuizPayload = (
  quiz: LessonQuizDetail,
  answers: Record<string, string>,
): SubmitQuizPayload => ({
  answers: quiz.questions.map((question) => {
    const value = answers[question.questionId]?.trim() ?? "";

    if (quiz.quizType === "MULTIPLE_CHOICE") {
      return {
        questionId: question.questionId,
        ...(value ? { selectedOptionId: value } : {}),
      };
    }

    return {
      questionId: question.questionId,
      essayAnswer: value,
    };
  }),
});

export const LessonQuizService = {
  createLessonQuiz: async (
    payload: CreateLessonQuizPayload,
  ): Promise<CreateLessonQuizResponse> => {
    const res: AxiosResponse<CreateLessonQuizResponse> = await axiosClient.post(
      "/lesson-quiz",
      payload,
    );
    return res.data;
  },

  getLessonQuizById: async (quizId: string): Promise<LessonQuizDetail> => {
    const res: AxiosResponse<LessonQuizDetail> = await axiosClient.get(
      `/lesson-quiz/${quizId}`,
    );
    return res.data;
  },

  submitQuiz: async (
    quizId: string,
    payload: SubmitQuizPayload,
  ): Promise<SubmitQuizResponse> => {
    const res: AxiosResponse<SubmitQuizResponse> = await axiosClient.post(
      `/student/quizzes/${quizId}/submit`,
      payload,
    );
    return res.data;
  },

  getQuizResult: async (quizId: string): Promise<QuizSubmissionResult> => {
    const res: AxiosResponse<QuizSubmissionResult> = await axiosClient.get(
      `/student/quizzes/${quizId}/result`,
    );
    return res.data;
  },
};
