import type {
  LessonQuizDetail,
  QuizQuestionPayload,
  QuizQuestionUpdatePayload,
  QuizType,
} from "@/app/service/lessonQuiz.service";

export type OptionForm = {
  optionId?: string;
  content: string;
  correct: boolean;
};

export type QuestionForm = {
  questionId?: string;
  content: string;
  points: string;
  essayAnswer: string;
  options: OptionForm[];
};

export const createEmptyOption = (correct = false): OptionForm => ({
  content: "",
  correct,
});

export const createEmptyQuestion = (quizType: QuizType): QuestionForm => ({
  content: "",
  points: "1",
  essayAnswer: "",
  options:
    quizType === "MULTIPLE_CHOICE"
      ? [createEmptyOption(true), createEmptyOption(false)]
      : [],
});

export const getQuestionPreview = (question: QuestionForm) => {
  const text = question.content.trim();
  if (!text) return "Chưa nhập nội dung";
  return text.length > 48 ? `${text.slice(0, 48)}...` : text;
};

export const isQuestionFilled = (question: QuestionForm, quizType: QuizType) =>
  Boolean(question.content.trim()) &&
  (quizType === "ESSAY"
    ? Boolean(question.essayAnswer.trim())
    : question.options.filter((option) => option.content.trim()).length >= 2);

export const mapLessonQuizDetailToQuestionForms = (
  quiz: LessonQuizDetail,
): QuestionForm[] =>
  quiz.questions.length > 0
    ? quiz.questions.map((question) => ({
        questionId: question.questionId,
        content: question.content,
        points: String(question.points),
        essayAnswer: question.essayAnswer ?? "",
        options:
          quiz.quizType === "MULTIPLE_CHOICE"
            ? question.options.map((option) => ({
                optionId: option.optionId,
                content: option.content,
                correct: option.correct,
              }))
            : [],
      }))
    : [createEmptyQuestion(quiz.quizType)];

export const buildQuestionsPayload = (
  quizType: QuizType,
  questions: QuestionForm[],
): QuizQuestionPayload[] =>
  questions.map((question) => {
    if (quizType === "ESSAY") {
      return {
        content: question.content.trim(),
        points: Number(question.points),
        essayAnswer: question.essayAnswer.trim(),
      };
    }

    return {
      content: question.content.trim(),
      points: Number(question.points),
      options: question.options
        .filter((option) => option.content.trim())
        .map((option) => ({
          content: option.content.trim(),
          correct: option.correct,
        })),
    };
  });

export const buildUpdateQuestionsPayload = (
  quizType: QuizType,
  questions: QuestionForm[],
): QuizQuestionUpdatePayload[] =>
  questions.map((question) => {
    if (quizType === "ESSAY") {
      return {
        ...(question.questionId ? { id: question.questionId } : {}),
        content: question.content.trim(),
        points: Number(question.points),
        essayAnswer: question.essayAnswer.trim(),
      };
    }

    return {
      ...(question.questionId ? { id: question.questionId } : {}),
      content: question.content.trim(),
      points: Number(question.points),
      options: question.options
        .filter((option) => option.content.trim())
        .map((option) => ({
          ...(option.optionId ? { id: option.optionId } : {}),
          content: option.content.trim(),
          correct: option.correct,
        })),
    };
  });

export const validateQuizQuestions = (
  quizType: QuizType,
  questions: QuestionForm[],
): boolean => {
  if (questions.length === 0) {
    return false;
  }

  for (let i = 0; i < questions.length; i += 1) {
    const question = questions[i];
    if (!question.content.trim()) {
      return false;
    }

    const points = Number(question.points);
    if (!Number.isFinite(points) || points <= 0) {
      return false;
    }

    if (quizType === "ESSAY") {
      if (!question.essayAnswer.trim()) {
        return false;
      }
    } else {
      const filledOptions = question.options.filter((option) =>
        option.content.trim(),
      );
      if (filledOptions.length < 2) {
        return false;
      }
      if (!question.options.some((option) => option.correct)) {
        return false;
      }
      if (
        question.options.some(
          (option) => option.correct && !option.content.trim(),
        )
      ) {
        return false;
      }
    }
  }

  return true;
};

export const getQuizQuestionsValidationError = (
  quizType: QuizType,
  questions: QuestionForm[],
): string | null => {
  if (questions.length === 0) {
    return "Đề cần ít nhất một câu hỏi";
  }

  for (let i = 0; i < questions.length; i += 1) {
    const question = questions[i];
    if (!question.content.trim()) {
      return `Vui lòng nhập nội dung câu hỏi ${i + 1}`;
    }

    const points = Number(question.points);
    if (!Number.isFinite(points) || points <= 0) {
      return `Điểm câu hỏi ${i + 1} phải lớn hơn 0`;
    }

    if (quizType === "ESSAY") {
      if (!question.essayAnswer.trim()) {
        return `Vui lòng nhập đáp án mẫu cho câu hỏi ${i + 1}`;
      }
    } else {
      const filledOptions = question.options.filter((option) =>
        option.content.trim(),
      );
      if (filledOptions.length < 2) {
        return `Câu hỏi ${i + 1} cần ít nhất 2 đáp án`;
      }
      if (!question.options.some((option) => option.correct)) {
        return `Câu hỏi ${i + 1} cần chọn đáp án đúng`;
      }
      if (
        question.options.some(
          (option) => option.correct && !option.content.trim(),
        )
      ) {
        return `Đáp án đúng của câu ${i + 1} không được để trống`;
      }
    }
  }

  return null;
};
