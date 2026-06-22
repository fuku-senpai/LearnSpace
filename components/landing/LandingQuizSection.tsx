"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Library,
  ListChecks,
  PenLine,
  Target,
  Users,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const quizFlow = [
  { icon: Library, label: "Kho đề" },
  { icon: Target, label: "Gắn bài" },
  { icon: ClipboardList, label: "Làm bài" },
  { icon: CheckCircle2, label: "Kết quả" },
];

const quizFormats = [
  {
    type: "MULTIPLE_CHOICE" as const,
    title: "Trắc nghiệm",
    tag: "Chấm tự động",
    icon: ListChecks,
    accentBar: "bg-amber-400",
    cardBorder: "border-amber-400/25 hover:border-amber-400/45",
    cardShadow: "hover:shadow-[0_24px_48px_rgba(251,191,36,0.12)]",
    iconWrap: "border-amber-400/45 bg-amber-400/15 text-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.15)]",
    tagStyle: "border-amber-400/40 bg-amber-400/15 text-amber-100",
    previewBorder: "border-amber-400/30",
    optionActive: "border-amber-400/60 bg-amber-400/18 text-amber-50",
    roleIcon: "text-amber-400",
    roles: [
      {
        role: "Giáo viên",
        icon: GraduationCap,
        summary: "Soạn đề và gắn vào buổi học",
      },
      {
        role: "Học sinh",
        icon: Users,
        summary: "Làm bài online, xem điểm ngay",
      },
    ],
  },
  {
    type: "ESSAY" as const,
    title: "Tự luận",
    tag: "Chấm thủ công",
    icon: PenLine,
    accentBar: "bg-sky-400",
    cardBorder: "border-sky-400/25 hover:border-sky-400/45",
    cardShadow: "hover:shadow-[0_24px_48px_rgba(56,189,248,0.12)]",
    iconWrap: "border-sky-400/45 bg-sky-400/15 text-sky-300 shadow-[0_0_24px_rgba(56,189,248,0.15)]",
    tagStyle: "border-sky-400/40 bg-sky-400/15 text-sky-100",
    previewBorder: "border-sky-400/30",
    optionActive: "",
    roleIcon: "text-sky-400",
    roles: [
      {
        role: "Giáo viên",
        icon: GraduationCap,
        summary: "Tạo đề và theo dõi bài nộp",
      },
      {
        role: "Học sinh",
        icon: Users,
        summary: "Nộp bài và xem kết quả",
      },
    ],
  },
];

const headerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

const cardInnerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.12 },
  },
};

const roleItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
};

function MultipleChoicePreview({
  borderClass,
  activeClass,
}: {
  borderClass: string;
  activeClass: string;
}) {
  const options = ["A", "B", "C", "D"];

  return (
    <div className={`rounded-xl border ${borderClass} bg-[#080808] p-3.5`}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-md border border-white/10 bg-[#111] text-[10px] font-bold text-zinc-500">
          1
        </span>
        <div className="h-2 flex-1 rounded-full bg-amber-400/25" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {options.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
              i === 1
                ? activeClass
                : "border-white/8 bg-[#0c0c0c] text-zinc-500"
            }`}
          >
            <span
              className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-semibold ${
                i === 1
                  ? "border-amber-400/60 bg-amber-400/20 text-amber-200"
                  : "border-white/15 bg-[#111]"
              }`}
            >
              {label}
            </span>
            <div className="h-1.5 flex-1 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EssayPreview({
  borderClass,
  accentClass,
}: {
  borderClass: string;
  accentClass: string;
}) {
  return (
    <div className={`rounded-xl border ${borderClass} bg-[#080808] p-3.5`}>
      <div className="mb-3 space-y-1.5">
        <div className="h-2 w-4/5 rounded-full bg-sky-400/20" />
        <div className="h-2 w-3/5 rounded-full bg-white/8" />
      </div>
      <div className={`rounded-lg border ${borderClass} bg-sky-400/5 p-3`}>
        <div className="mb-2 flex items-center gap-1.5">
          <PenLine className={`h-3 w-3 ${accentClass}`} />
          <span className={`text-[10px] font-medium ${accentClass}`}>
            Câu trả lời
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full rounded-full bg-sky-400/15" />
          <div className="h-1.5 w-[92%] rounded-full bg-sky-400/10" />
          <div className="h-1.5 w-[78%] rounded-full bg-white/8" />
        </div>
      </div>
      <div className="mt-2.5 flex justify-end">
        <span className="rounded-md border border-sky-400/35 bg-sky-400/15 px-2 py-0.5 text-[9px] font-medium text-sky-200">
          Nộp bài
        </span>
      </div>
    </div>
  );
}

function QuizFormatCard({
  format,
  cardIndex,
  reduceMotion,
}: {
  format: (typeof quizFormats)[number];
  cardIndex: number;
  reduceMotion: boolean | null;
}) {
  const FormatIcon = format.icon;
  const fromX = cardIndex === 0 ? -48 : 48;

  const cardMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: fromX, y: 16 },
        whileInView: { opacity: 1, x: 0, y: 0 },
        viewport: { once: true, amount: 0.25, margin: "-50px" },
        transition: { duration: 0.65, delay: cardIndex * 0.1, ease },
      };

  const innerMotion = reduceMotion
    ? { initial: "visible" as const, animate: "visible" as const }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, amount: 0.35 },
      };

  return (
    <motion.article
      className={`landing-card-shine group relative overflow-hidden rounded-2xl border bg-[#0a0a0a] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 ${format.cardBorder} ${format.cardShadow}`}
      {...cardMotion}
    >
      <div className={`h-1 w-full ${format.accentBar}`} />

      <motion.div
        className="flex flex-col p-6 sm:p-7"
        variants={cardInnerVariants}
        {...innerMotion}
      >
        <motion.div variants={fadeUpItem} className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${format.iconWrap}`}
          >
            <FormatIcon className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight text-white">
                {format.title}
              </h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${format.tagStyle}`}
              >
                {format.tag}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-zinc-500">
              {format.type === "MULTIPLE_CHOICE"
                ? "Nhiều lựa chọn — chấm điểm ngay khi nộp"
                : "Câu hỏi mở — giáo viên chấm sau khi nộp"}
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUpItem} className="mt-5">
          {format.type === "MULTIPLE_CHOICE" ? (
            <MultipleChoicePreview
              borderClass={format.previewBorder}
              activeClass={format.optionActive}
            />
          ) : (
            <EssayPreview
              borderClass={format.previewBorder}
              accentClass={format.roleIcon}
            />
          )}
        </motion.div>

        <motion.div
          variants={fadeUpItem}
          className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8"
        >
          {format.roles.map((roleBranch) => {
            const RoleIcon = roleBranch.icon;

            return (
              <motion.div
                key={roleBranch.role}
                variants={roleItem}
                className="bg-[#0c0c0c] px-3.5 py-3.5 transition-colors duration-300 group-hover:bg-[#0e0e0e]"
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <RoleIcon className={`h-3.5 w-3.5 ${format.roleIcon}`} />
                  <span className="text-[11px] font-semibold tracking-wide text-zinc-300 uppercase">
                    {roleBranch.role}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">
                  {roleBranch.summary}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export function LandingQuizSection() {
  const reduceMotion = useReducedMotion();

  const inView = reduceMotion
    ? {}
    : { once: true, amount: 0.35 as const, margin: "-40px" as const };

  const headerMotion = reduceMotion
    ? { initial: "visible" as const, animate: "visible" as const }
    : {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: inView,
      };

  return (
    <section id="quiz" className="relative border-t border-white/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_20%_30%,rgba(251,191,36,0.07),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_85%_70%,rgba(56,189,248,0.06),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
        <motion.div
          className="mb-14 flex flex-col items-center text-center"
          variants={headerVariants}
          {...headerMotion}
        >
          <motion.span
            variants={fadeUpItem}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0d0d0d] px-3.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-zinc-400 uppercase"
          >
            <ClipboardList className="h-3.5 w-3.5 text-amber-400" />
            Bài tập &amp; Quiz
          </motion.span>
          <motion.h2
            variants={fadeUpItem}
            className="mt-4 max-w-xl text-2xl font-bold text-white sm:text-3xl"
          >
            Trắc nghiệm &amp; tự luận trên cùng nền tảng
          </motion.h2>
          <motion.p
            variants={fadeUpItem}
            className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500"
          >
            Giáo viên gắn bài, học sinh làm online — kết quả lưu theo từng lần
            thử.
          </motion.p>
        </motion.div>

        <div className="mx-auto mb-12 max-w-2xl overflow-hidden px-2">
          <div className="flex items-start justify-center">
            {quizFlow.map((step, index) => {
              const StepIcon = step.icon;
              const isLast = index === quizFlow.length - 1;

              return (
                <div key={step.label} className="flex items-start">
                  <motion.div
                    className="flex w-17 shrink-0 flex-col items-center gap-2.5 sm:w-20"
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.75 }}
                    whileInView={
                      reduceMotion ? undefined : { opacity: 1, scale: 1 }
                    }
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.12,
                      ease,
                    }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-400/30 bg-[#0c0c0c] ring-2 ring-amber-400/10">
                      <StepIcon className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-center text-[10px] font-medium text-zinc-500 sm:text-xs">
                      {step.label}
                    </span>
                  </motion.div>

                  {!isLast ? (
                    <div className="mt-5.5 h-px min-w-5 flex-1 overflow-hidden sm:min-w-8">
                      <motion.div
                        className="h-full w-full origin-left bg-amber-400/25"
                        initial={reduceMotion ? false : { scaleX: 0 }}
                        whileInView={
                          reduceMotion ? undefined : { scaleX: 1 }
                        }
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.15 + index * 0.12,
                          ease,
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {quizFormats.map((format, cardIndex) => (
            <QuizFormatCard
              key={format.type}
              format={format}
              cardIndex={cardIndex}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
