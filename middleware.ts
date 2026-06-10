import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { env } from "@/config/env";
import { AUTH_API } from "@/constants/api-endpoints";

const accessTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  path: "/",
  sameSite: "lax" as const,
  maxAge: 15 * 60, // 15 phút
};

const DASHBOARD_PATH = {
  ADMIN: "/admin/dashboard_layout?menu=classes",
  TEACHER: "/teacher/dashboard_layout",
  STUDENT: "/student/student_dashboard",
} as const;

async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const response = await fetch(`${env.API_URL}${AUTH_API.REFRESH_TOKEN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return typeof data?.newAccessToken === "string"
      ? data.newAccessToken
      : null;
  } catch {
    return null;
  }
}

function setAccessTokenCookie(response: NextResponse, accessToken: string) {
  response.cookies.set("accessToken", accessToken, accessTokenCookieOptions);

  return response;
}

function getDashboardPath(role?: string) {
  switch (role) {
    case "ADMIN":
      return DASHBOARD_PATH.ADMIN;

    case "TEACHER":
      return DASHBOARD_PATH.TEACHER;

    case "STUDENT":
      return DASHBOARD_PATH.STUDENT;

    default:
      return "/login";
  }
}

function redirectByRole(
  req: NextRequest,
  role?: string,
  newAccessToken?: string,
) {
  const response = NextResponse.redirect(
    new URL(getDashboardPath(role), req.url),
  );

  if (newAccessToken) {
    setAccessTokenCookie(response, newAccessToken);
  }

  return response;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get("accessToken")?.value;

  const refreshToken = req.cookies.get("refreshToken")?.value;

  const role = req.cookies.get("role")?.value;

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  const isLandingPage = pathname === "/";

  const isAdminRoute = pathname.startsWith("/admin");

  const isTeacherRoute = pathname.startsWith("/teacher");

  const isStudentRoute = pathname.startsWith("/student");

  const isProtectedRoute = isAdminRoute || isTeacherRoute || isStudentRoute;

  let activeAccessToken: string | undefined = accessToken;

  // Refresh access token
  if (!activeAccessToken && refreshToken) {
    const refreshedToken = await refreshAccessToken(refreshToken);

    activeAccessToken = refreshedToken ?? undefined;
  }

  // Chưa login -> chặn protected route
  if (!activeAccessToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Guest được vào trang "/"
  if (!activeAccessToken && isLandingPage) {
    return NextResponse.next();
  }

  // Đã login -> chặn login/register
  if (activeAccessToken && isAuthPage) {
    return redirectByRole(
      req,
      role,
      activeAccessToken !== accessToken ? activeAccessToken : undefined,
    );
  }

  // "/" -> redirect dashboard
  if (activeAccessToken && isLandingPage) {
    return redirectByRole(
      req,
      role,
      activeAccessToken !== accessToken ? activeAccessToken : undefined,
    );
  }

  // Role guard - ADMIN
  if (role !== "ADMIN" && isAdminRoute) {
    return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
  }

  // Role guard - TEACHER
  if (role !== "TEACHER" && isTeacherRoute) {
    return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
  }

  // Role guard - STUDENT
  if (role !== "STUDENT" && isStudentRoute) {
    return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
  }

  const response = NextResponse.next();

  // Nếu refresh token thành công
  // thì update cookie accessToken mới
  if (activeAccessToken && activeAccessToken !== accessToken) {
    setAccessTokenCookie(response, activeAccessToken);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/login",
    "/register",
  ],
};
