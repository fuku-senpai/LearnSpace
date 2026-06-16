"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock,
  Eye,
  FileText,
  Layers,
  Loader2,
  PenLine,
  Plus,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import { useGetQuizBankQuery } from "@/app/hooks/lessonQuiz/useGetQuizBank";
import type {
  QuizBankFilter,
  QuizBankItem,
  QuizType,
} from "@/app/service/lessonQuiz.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { QuizCreateDialog } from "./QuizCreateDialog";
import { QuizDetailDialog } from "./QuizDetailDialog";

const PAGE_SIZE = 10;

type QuizTypeFilter = "ALL" | QuizType;

const quizTypeLabels: Record<QuizType, string> = {
  MULTIPLE_CHOICE: "Trắc nghiệm",
  ESSAY: "Tự luận",
};

const quizTypeTheme: Record<
  QuizType,
  {
    iconWrap: string;
    icon: typeof CircleDot;
    badge: string;
  }
> = {
  MULTIPLE_CHOICE: {
    iconWrap: "bg-sky-100 text-sky-700",
    icon: CircleDot,
    badge: "border-sky-200 bg-sky-50 text-sky-800",
  },
  ESSAY: {
    iconWrap: "bg-amber-100 text-amber-800",
    icon: PenLine,
    badge: "border-amber-200 bg-amber-50 text-amber-900",
  },
};

const filterOptions: { value: QuizTypeFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { value: "ESSAY", label: "Tự luận" },
];

function QuizListRow({
  quiz,
  onViewDetail,
}: {
  quiz: QuizBankItem;
  onViewDetail: (quiz: QuizBankItem) => void;
}) {
  const theme = quizTypeTheme[quiz.quizType];
  const Icon = theme.icon;

  return (
    <div className="group flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-sky-50/40 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
            theme.iconWrap,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-[0.12em] uppercase",
                theme.badge,
              )}
            >
              {quizTypeLabels[quiz.quizType]}
            </span>
          </div>
          <h3 className="mt-1.5 line-clamp-1 text-base font-semibold text-slate-900">
            {quiz.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">
            {quiz.description || "Chưa có mô tả"}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              {quiz.totalQuestions} câu
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {quiz.durationMinutes} phút
            </span>
            <span className="inline-flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              Đạt {quiz.passScore}đ
            </span>
          </p>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 shrink-0 cursor-pointer rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm group-hover:border-sky-200 group-hover:bg-white group-hover:text-sky-800"
        onClick={() => onViewDetail(quiz)}
      >
        <Eye className="mr-1.5 h-4 w-4" />
        Chi tiết
      </Button>
    </div>
  );
}

export function QuestionBankPanel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailQuiz, setDetailQuiz] = useState<QuizBankItem | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [debouncedTitle, setDebouncedTitle] = useState("");
  const [quizTypeFilter, setQuizTypeFilter] = useState<QuizTypeFilter>("ALL");
  const [filter, setFilter] = useState<QuizBankFilter>({
    page: 0,
    size: PAGE_SIZE,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedTitle(titleInput.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [titleInput]);

  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      page: 0,
      title: debouncedTitle || undefined,
      quizType: quizTypeFilter === "ALL" ? undefined : quizTypeFilter,
    }));
  }, [debouncedTitle, quizTypeFilter]);

  const { data, isLoading, isFetching, error, refetch } =
    useGetQuizBankQuery(filter);

  const items = data?.items ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const currentPage = filter.page;
  const isLastPage = currentPage >= totalPages - 1;

  const handlePageChange = (nextPage: number) => {
    setFilter((prev) => ({ ...prev, page: Math.max(0, nextPage) }));
  };

  return (
    <div className="relative h-full overflow-y-auto">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[length:32px_32px]" />

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <section className="space-y-5 border-b border-slate-200 pb-8">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-sky-600 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Ngân hàng câu hỏi
          </span>
          <div className="h-px w-full max-w-[120px] bg-sky-400" />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Kho đề
              </h2>
              <p className="text-sm leading-relaxed text-slate-500">
                Tạo và quản lý đề trắc nghiệm, tự luận. Gắn đề vào buổi học tại
                Video &amp; Tài liệu → tab Bài tập.
              </p>
            </div>
            <Button
              type="button"
              className="h-10 shrink-0 cursor-pointer rounded-xl bg-sky-700 px-5 hover:bg-sky-800"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo đề mới
            </Button>
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-10 rounded-xl border-slate-200 bg-white pl-9"
                  placeholder="Tìm theo tiêu đề..."
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {filterOptions.map((option) => {
                  const active = quizTypeFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setQuizTypeFilter(option.value)}
                      className={cn(
                        "cursor-pointer rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
                        active
                          ? "border-sky-700 bg-sky-700 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:border-sky-200 hover:text-sky-800",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
                {isFetching && !isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                ) : null}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-20 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
              Đang tải kho đề...
            </div>
          ) : error ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-medium text-rose-800">
                Không thể tải danh sách đề
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4 cursor-pointer rounded-xl"
                onClick={() => refetch()}
              >
                Thử lại
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                {debouncedTitle || quizTypeFilter !== "ALL"
                  ? "Không tìm thấy đề phù hợp"
                  : "Kho đề đang trống"}
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {debouncedTitle || quizTypeFilter !== "ALL"
                  ? "Thử đổi từ khóa hoặc bộ lọc."
                  : "Tạo đề trắc nghiệm hoặc tự luận để bắt đầu."}
              </p>
              {!debouncedTitle && quizTypeFilter === "ALL" ? (
                <Button
                  type="button"
                  className="mt-5 h-10 cursor-pointer rounded-xl bg-sky-700 px-5 hover:bg-sky-800"
                  onClick={() => setIsCreateOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo đề mới
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {items.map((quiz) => (
                  <QuizListRow
                    key={quiz.id}
                    quiz={quiz}
                    onViewDetail={setDetailQuiz}
                  />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-3.5 sm:px-6">
                <span className="text-sm text-slate-500">
                  {totalElements} đề trong kho
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 cursor-pointer rounded-lg border-slate-200 bg-white"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 0 || isFetching}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 cursor-pointer rounded-lg border-slate-200 bg-white"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={isLastPage || isFetching}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <QuizCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => refetch()}
      />

      <QuizDetailDialog
        quizId={detailQuiz?.id ?? null}
        fallbackTitle={detailQuiz?.title}
        open={Boolean(detailQuiz)}
        onOpenChange={(open) => {
          if (!open) setDetailQuiz(null);
        }}
      />
    </div>
  );
}
