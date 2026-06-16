import type { QuizType } from "@/app/service/lessonQuiz.service";

export type OptionForm = {
  content: string;
  correct: boolean;
};

export type QuestionForm = {
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
