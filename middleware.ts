import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/config/env";
import { AUTH_API } from "@/constants/api-endpoints";

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  path: "/",
  sameSite: "lax" as const,
  maxAge: 15 * 60, // 15 minutes
};

async function refreshAccessToken(refreshToken: string) {
  const backendRes = await fetch(`${env.API_URL}${AUTH_API.REFRESH_TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!backendRes.ok) {
    return null;
  }

  const data = await backendRes.json();
  return typeof data?.newAccessToken === "string" ? data.newAccessToken : null;
}

function redirectWithAccessToken(url: URL, accessToken: string) {
  const response = NextResponse.redirect(url);
  response.cookies.set("accessToken", accessToken, accessTokenCookieOptions);
  return response;
}

function nextWithAccessToken(accessToken: string) {
  const response = NextResponse.next();
  response.cookies.set("accessToken", accessToken, accessTokenCookieOptions);
  return response;
}

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const role = req.cookies.get("role")?.value;
  const pathname = req.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isLandingPage = pathname === "/";
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isStudentRoute = pathname.startsWith("/student");

  const teacherDashboardUrl = new URL("/teacher/dashboard_layout", req.url);
  const studentDashboardUrl = new URL("/student/student_dashboard", req.url);

  const canRefreshSession = !accessToken && Boolean(refreshToken);
  let refreshedAccessToken: string | null = null;

  if (canRefreshSession && refreshToken) {
    refreshedAccessToken = await refreshAccessToken(refreshToken);
  }

  if (!accessToken && !refreshedAccessToken && (isTeacherRoute || isStudentRoute)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!accessToken && !refreshedAccessToken && isLandingPage) {
    return NextResponse.next();
  }

  const activeAccessToken = accessToken ?? refreshedAccessToken;

  if (!activeAccessToken) {
    return NextResponse.next();
  }
  if (accessToken && isAuthPage) {
    if (role === "TEACHER") {
      return NextResponse.redirect(teacherDashboardUrl);
    }

    if (role === "STUDENT") {
      return NextResponse.redirect(studentDashboardUrl);
    }

    return NextResponse.next();
  }

  if (activeAccessToken && isLandingPage) {
    if (role === "STUDENT") {
      return refreshedAccessToken
        ? redirectWithAccessToken(studentDashboardUrl, refreshedAccessToken)
        : NextResponse.redirect(studentDashboardUrl);
    }

    return refreshedAccessToken
      ? redirectWithAccessToken(teacherDashboardUrl, refreshedAccessToken)
      : NextResponse.redirect(teacherDashboardUrl);
  }

  if (!accessToken && refreshedAccessToken && isAuthPage) {
    if (role === "STUDENT") {
      return redirectWithAccessToken(studentDashboardUrl, refreshedAccessToken);
    }

    return redirectWithAccessToken(teacherDashboardUrl, refreshedAccessToken);
  }

  if (isTeacherRoute && role === "STUDENT") {
    return NextResponse.redirect(studentDashboardUrl);
  }

  if (isStudentRoute && role === "TEACHER") {
    return NextResponse.redirect(teacherDashboardUrl);
  }

  return refreshedAccessToken
    ? nextWithAccessToken(refreshedAccessToken)
    : NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/teacher",
    "/teacher/:path*",
    "/student",
    "/student/:path*",
    "/login",
    "/register",
  ],
};