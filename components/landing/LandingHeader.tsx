"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { landingLoginHref, landingNavLinks } from "@/constants/landing-nav";

function NavLink({
  href,
  label,
  onClick,
  className = "",
}: {
  href: string;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  const baseClass =
    "rounded-lg px-3.5 py-2 text-[13px] font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100";

  if (href.startsWith("/")) {
    return (
      <Link href={href} onClick={onClick} className={`${baseClass} ${className}`}>
        {label}
      </Link>
    );
  }

  return (
    <a href={href} onClick={onClick} className={`${baseClass} ${className}`}>
      {label}
    </a>
  );
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-white/10 bg-[#040404]/95 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          : "border-white/6 bg-[#050505]/75 backdrop-blur-2xl"
      }`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-amber-400/25" />

      <div className="relative mx-auto flex h-[4.25rem] max-w-6xl items-center gap-4 px-6 lg:h-[4.5rem] lg:px-8">
        <Link
          href="/"
          className="group flex min-w-0 shrink-0 items-center gap-3"
          onClick={() => setMobileOpen(false)}
        >
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-[#0a0a0a] ring-1 ring-amber-400/15 transition duration-300 group-hover:border-amber-400/30 group-hover:ring-amber-400/25">
            <Image
              src="/icons/pIcon03.png"
              alt="Course Learning"
              width={36}
              height={36}
              className="h-full w-full object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold tracking-tight text-white">
              Course Learning
            </p>
            <p className="hidden truncate text-[11px] font-medium text-zinc-500 sm:block">
              Nền tảng học tập trực tuyến
            </p>
          </div>
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 md:flex"
          aria-label="Điều hướng chính"
        >
          <div className="flex items-center gap-0.5 rounded-full border border-white/8 bg-white/[0.03] p-1">
            {landingNavLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            className="login-btn-gold hidden h-9 rounded-3xl border-0 px-4 text-[13px] font-semibold text-zinc-900 shadow-none sm:inline-flex"
          >
            <Link href={landingLoginHref} className="inline-flex items-center gap-1.5">
              Đăng nhập
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white md:hidden"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-white/8 bg-[#040404]/98 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4">
            {landingNavLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                className="w-full px-4 py-3"
                onClick={() => setMobileOpen(false)}
              />
            ))}
            <Button
              asChild
              className="login-btn-gold mt-2 h-10 w-full rounded-lg border-0 text-sm font-bold text-zinc-900"
            >
              <Link
                href={landingLoginHref}
                className="inline-flex items-center justify-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                Đăng nhập hệ thống
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
