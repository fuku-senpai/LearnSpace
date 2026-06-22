"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  FileText,
  ListTree,
  Loader2,
  Pencil,
  PenLine,
  Plus,
  Search,
  Sparkles,
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
import { QuizContentEditDialog } from "./QuizContentEditDialog";
import { QuizCreateDialog } from "./QuizCreateDialog";
import { QuizCodeBadge } from "./QuizCodeBadge";
import { QuizDetailDialog } from "./QuizDetailDialog";
import { QuizEditDialog } from "./QuizEditDialog";
import { QuizVersionBadge } from "./QuizVersionBadge";

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

const desktopRowGridClass =
  "grid grid-cols-[9rem_minmax(0,1fr)_minmax(8.5rem,10.5rem)_minmax(12rem,1fr)] items-center gap-x-4 xl:grid-cols-[10rem_minmax(0,1fr)_9.5rem_minmax(14rem,1fr)] xl:gap-x-6";

function QuizCodeVersionCell({ quiz }: { quiz: QuizBankItem }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <QuizCodeBadge code={quiz.lessonQuizCode} />
      <QuizVersionBadge version={quiz.version} />
    </div>
  );
}

function QuizRowActions({
  onEdit,
  onEditContent,
  onViewDetail,
  layout = "desktop",
}: {
  onEdit: () => void;
  onEditContent: () => void;
  onViewDetail: () => void;
  layout?: "mobile" | "desktop";
}) {
  const isMobile = layout === "mobile";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-9 cursor-pointer rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm group-hover:border-sky-200 group-hover:text-sky-800",
          isMobile
            ? "min-w-0 flex-1 px-2 sm:px-2.5"
            : "shrink-0 px-2.5 xl:px-3",
        )}
        onClick={onEdit}
      >
        <Pencil className={cn("h-4 w-4", !isMobile && "xl:mr-1.5")} />
        <span className={cn(isMobile ? "ml-1.5 text-xs sm:text-sm" : "hidden xl:inline")}>
          {isMobile ? "Thông tin" : "Sửa thông tin"}
        </span>
        {!isMobile ? (
          <span className="hidden sm:inline xl:hidden">Thông tin</span>
        ) : null}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        title="Sửa câu hỏi và đáp án của đề hiện tại"
        className={cn(
          "h-9 cursor-pointer rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm group-hover:border-sky-200 group-hover:text-sky-800",
          isMobile
            ? "min-w-0 flex-1 px-2 sm:px-2.5"
            : "shrink-0 px-2.5 xl:px-3",
        )}
        onClick={onEditContent}
      >
        <ListTree className={cn("h-4 w-4", isMobile ? "shrink-0" : "sm:mr-1")} />
        <span
          className={cn(
            isMobile
              ? "ml-1 hidden truncate text-xs min-[420px]:inline sm:text-sm"
              : "hidden sm:inline",
          )}
        >
          Nội dung
        </span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={cn(
          "h-9 cursor-pointer rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm group-hover:border-sky-200 group-hover:text-sky-800",
          isMobile
            ? "min-w-0 flex-1 px-2 sm:px-2.5"
            : "shrink-0 px-2.5 xl:px-3",
        )}
        onClick={onViewDetail}
      >
        <Eye className={cn("h-4 w-4", !isMobile && "xl:mr-1.5")} />
        <span className={cn(isMobile ? "ml-1.5 text-xs sm:text-sm" : "hidden xl:inline")}>
          Chi tiết
        </span>
      </Button>
    </>
  );
}

function QuizListRow({
  quiz,
  onViewDetail,
  onEdit,
  onEditContent,
}: {
  quiz: QuizBankItem;
  onViewDetail: (quiz: QuizBankItem) => void;
  onEdit: (quiz: QuizBankItem) => void;
  onEditContent: (quiz: QuizBankItem) => void;
}) {
  const theme = quizTypeTheme[quiz.quizType];
  const Icon = theme.icon;

  return (
    <div className="group border-b border-slate-100 transition-colors last:border-b-0 hover:bg-sky-50/40">
      {/* Mobile & tablet: card layout */}
      <div className="space-y-3 px-4 py-4 sm:px-6 lg:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                theme.iconWrap,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <span
              className={cn(
                "inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase",
                theme.badge,
              )}
            >
              {quizTypeLabels[quiz.quizType]}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <QuizCodeBadge code={quiz.lessonQuizCode} />
            <QuizVersionBadge version={quiz.version} />
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-900 wrap-break-word">
            {quiz.title}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500 wrap-break-word line-clamp-2">
            {quiz.description || "Chưa có mô tả"}
          </p>
        </div>

        <div className="flex gap-2 pt-0.5">
          <QuizRowActions
            layout="mobile"
            onEdit={() => onEdit(quiz)}
            onEditContent={() => onEditContent(quiz)}
            onViewDetail={() => onViewDetail(quiz)}
          />
        </div>
      </div>

      {/* Desktop: table row */}
      <div
        className={cn(
          "hidden gap-4 px-6 py-4 lg:grid xl:px-8",
          desktopRowGridClass,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
              theme.iconWrap,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "inline-flex max-w-full items-center truncate rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] uppercase",
              theme.badge,
            )}
          >
            {quizTypeLabels[quiz.quizType]}
          </span>
        </div>

        <div className="min-w-0 overflow-hidden pr-2">
          <h3 className="truncate text-base font-semibold text-slate-900">
            {quiz.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {quiz.description || "Chưa có mô tả"}
          </p>
        </div>

        <div className="min-w-0 self-center">
          <QuizCodeVersionCell quiz={quiz} />
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 xl:flex-nowrap">
          <QuizRowActions
            layout="desktop"
            onEdit={() => onEdit(quiz)}
            onEditContent={() => onEditContent(quiz)}
            onViewDetail={() => onViewDetail(quiz)}
          />
        </div>
      </div>
    </div>
  );
}

export function QuestionBankPanel() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailQuiz, setDetailQuiz] = useState<QuizBankItem | null>(null);
  const [editQuiz, setEditQuiz] = useState<QuizBankItem | null>(null);
  const [contentEditQuiz, setContentEditQuiz] = useState<QuizBankItem | null>(
    null,
  );
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
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-size-[32px_32px]" />

      <header className="relative shrink-0 border-b border-slate-200 bg-white/95 px-4 py-5 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-sky-600 uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Ngân hàng câu hỏi
            </span>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Kho đề
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">
                <span className="sm:hidden">
                  Quản lý đề và chia sẻ{" "}
                  <span className="font-medium text-amber-800">mã đề</span> cho
                  học sinh.
                </span>
                <span className="hidden sm:inline">
                  Quản lý toàn bộ đề trắc nghiệm và tự luận. Chia sẻ{" "}
                  <span className="font-medium text-amber-800">mã đề</span> cho
                  học sinh — họ cần nhập mã mới có thể làm bài.{" "}
                  <span className="font-medium text-slate-600">
                    Sửa thông tin
                  </span>{" "}
                  có sẵn;{" "}
                  <span className="font-medium text-slate-600">
                    Sửa nội dung
                  </span>{" "}
                  cập nhật trực tiếp câu hỏi và đáp án của đề.
                </span>
              </p>
            </div>
          </div>
          <Button
            type="button"
            className="h-10 shrink-0 cursor-pointer self-start rounded-xl bg-sky-700 px-5 hover:bg-sky-800 lg:self-auto"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo đề mới
          </Button>
        </div>
      </header>

      <div className="relative shrink-0 border-b border-slate-200 bg-slate-50/60 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1 xl:max-w-md">
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

      <div className="relative min-h-0 flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex h-full min-h-[240px] items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-sky-600" />
            Đang tải kho đề...
          </div>
        ) : error ? (
          <div className="flex h-full min-h-[240px] flex-col items-center justify-center px-6 py-14 text-center">
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
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              {debouncedTitle || quizTypeFilter !== "ALL"
                ? "Không tìm thấy đề phù hợp"
                : "Kho đề đang trống"}
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
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
          <div className="w-full bg-white">
            <div className="lg:overflow-x-auto xl:overflow-visible">
              <div className="lg:min-w-[46rem] xl:min-w-0">
                <div
                  className={cn(
                    "hidden border-b border-slate-200 bg-slate-50/80 px-6 py-2.5 text-[11px] font-semibold tracking-wide text-slate-500 uppercase lg:grid xl:px-8",
                    desktopRowGridClass,
                  )}
                >
                  <span>Loại đề</span>
                  <span>Tiêu đề &amp; mô tả</span>
                  <span>
                    <span className="text-amber-700">Mã đề</span>
                    <span className="mt-0.5 block font-normal normal-case text-violet-600">
                      Phiên bản
                    </span>
                  </span>
                  <span className="text-right">Thao tác</span>
                </div>
                {items.map((quiz) => (
                  <QuizListRow
                    key={quiz.id}
                    quiz={quiz}
                    onViewDetail={setDetailQuiz}
                    onEdit={setEditQuiz}
                    onEditContent={setContentEditQuiz}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="relative shrink-0 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            {totalElements} đề trong kho
            {totalPages > 1 ? (
              <span className="text-slate-400">
                {" "}
                · Trang {currentPage + 1}/{totalPages}
              </span>
            ) : null}
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
      </footer>

      <QuizCreateDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => refetch()}
      />

      <QuizEditDialog
        open={Boolean(editQuiz)}
        quiz={editQuiz}
        onOpenChange={(open) => {
          if (!open) setEditQuiz(null);
        }}
        onSuccess={() => refetch()}
      />

      <QuizContentEditDialog
        open={Boolean(contentEditQuiz)}
        quiz={contentEditQuiz}
        onOpenChange={(open) => {
          if (!open) setContentEditQuiz(null);
        }}
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
