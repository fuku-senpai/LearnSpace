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
  durationMinutes: number;
  passScore: number;
  quizType: QuizType;
  questions: QuizQuestionPayload[];
};

export type CreateLessonQuizResponse = {
  message?: string;
};

export type AssignQuizPayload = {
  snapLessonId: string;
  lessonQuizId: string;
  required: boolean;
  maxAttempts: number;
  displayOrder: number;
};

export type AssignQuizResponse = {
  message?: string;
};

export type UpdateAssignQuizPayload = {
  lessonQuizId: string;
  required: boolean;
  maxAttempts: number;
  displayOrder: number;
};

export type UpdateAssignQuizResponse = {
  message?: string;
};

export type LessonAssignedQuiz = {
  snapLessonQuizId: string;
  lessonQuizId: string;
  title: string;
  description: string;
  quizType: QuizType;
  durationMinutes: number;
  passScore: number;
  required: boolean;
  maxAttempts: number;
  displayOrder: number;
};

export type LessonQuizListItem = {
  quizId: string;
  snapLessonQuizId?: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  passScore?: number;
  quizType?: QuizType;
  required?: boolean;
  maxAttempts?: number;
  displayOrder?: number;
};

export const mapAssignedQuizzesToListItems = (
  quizzes: LessonAssignedQuiz[],
): LessonQuizListItem[] =>
  [...quizzes]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((quiz) => ({
      quizId: quiz.lessonQuizId,
      snapLessonQuizId: quiz.snapLessonQuizId,
      title: quiz.title,
      description: quiz.description,
      durationMinutes: quiz.durationMinutes,
      passScore: quiz.passScore,
      quizType: quiz.quizType,
      required: quiz.required,
      maxAttempts: quiz.maxAttempts,
      displayOrder: quiz.displayOrder,
    }));

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

export type QuizResultAttempt = {
  submissionId: string;
  attemptNo: number;
  score: number;
  passed: boolean;
  status: string;
  submittedAt: string;
  questions: QuizResultQuestion[];
};

export type QuizResultSummary = {
  quizId: string;
  quizTitle: string;
  passScore: number;
  attempts: QuizResultAttempt[];
};

/** Mapped view for a single attempt detail panel */
export type QuizSubmissionResult = {
  submissionId: string;
  quizId: string;
  quizTitle: string;
  score: number;
  passScore: number;
  passed: boolean;
  status: string;
  submittedAt?: string;
  attemptNo?: number;
  questions: QuizResultQuestion[];
};

const normalizeResultQuestions = (
  questions?: QuizResultQuestion[] | null,
): QuizResultQuestion[] =>
  (questions ?? []).map((question) => ({
    ...question,
    options: question.options ?? [],
  }));

export const mapAttemptToSubmissionResult = (
  summary: QuizResultSummary,
  attempt: QuizResultAttempt,
): QuizSubmissionResult => ({
  submissionId: attempt.submissionId,
  quizId: summary.quizId,
  quizTitle: summary.quizTitle,
  score: attempt.score,
  passScore: summary.passScore,
  passed: attempt.passed,
  status: attempt.status,
  submittedAt: attempt.submittedAt,
  attemptNo: attempt.attemptNo,
  questions: normalizeResultQuestions(attempt.questions),
});

export type QuizBankItem = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  passScore: number;
  quizType: QuizType;
  totalQuestions: number;
};

export type QuizBankFilter = {
  page: number;
  size: number;
  title?: string;
  quizType?: QuizType;
};

export type QuizBankResponse = {
  items: QuizBankItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type QuizBankApiResponse = {
  content: QuizBankItem[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

const normalizeQuizBankResponse = (
  response: QuizBankApiResponse,
  fallbackSize: number,
): QuizBankResponse => ({
  items: response.content ?? [],
  page: response.page?.number ?? 0,
  size: response.page?.size ?? fallbackSize,
  totalElements: response.page?.totalElements ?? response.content?.length ?? 0,
  totalPages: response.page?.totalPages ?? 1,
});

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
    snapLessonQuizId: string,
    payload: SubmitQuizPayload,
  ): Promise<SubmitQuizResponse> => {
    const res: AxiosResponse<SubmitQuizResponse> = await axiosClient.post(
      `/student/quizzes/${snapLessonQuizId}/submit`,
      payload,
    );
    return res.data;
  },

  getQuizResult: async (
    snapLessonQuizId: string,
  ): Promise<QuizResultSummary> => {
    const res: AxiosResponse<QuizResultSummary> = await axiosClient.get(
      `/student/quizzes/${snapLessonQuizId}/result`,
    );
    const data = res.data;
    return {
      ...data,
      attempts: data?.attempts ?? [],
    };
  },

  getQuizBank: async (filter: QuizBankFilter): Promise<QuizBankResponse> => {
    const res: AxiosResponse<QuizBankApiResponse> = await axiosClient.get(
      "/lesson-quizs",
      {
        params: {
          page: filter.page,
          size: filter.size,
          title: filter.title || undefined,
          quizType: filter.quizType || undefined,
        },
      },
    );
    return normalizeQuizBankResponse(res.data, filter.size);
  },

  assignQuiz: async (payload: AssignQuizPayload): Promise<AssignQuizResponse> => {
    const res: AxiosResponse<AssignQuizResponse> = await axiosClient.post(
      "/assign",
      payload,
    );
    return res.data;
  },

  updateAssignQuiz: async (
    snapLessonQuizId: string,
    payload: UpdateAssignQuizPayload,
  ): Promise<UpdateAssignQuizResponse> => {
    const res: AxiosResponse<UpdateAssignQuizResponse> = await axiosClient.put(
      `/assign/${snapLessonQuizId}`,
      payload,
    );
    return res.data;
  },

  getLessonQuizzes: async (
    snapLessonId: string,
  ): Promise<LessonAssignedQuiz[]> => {
    const res: AxiosResponse<LessonAssignedQuiz[]> = await axiosClient.get(
      `/lesson/${snapLessonId}`,
    );
    return res.data ?? [];
  },
};
