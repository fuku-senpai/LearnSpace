
import { env } from "@/config/env";
import { AUTH_API } from "@/constants/api-endpoints";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const body = await req.json();
  const backendRes = await fetch(`${env.API_URL}${AUTH_API.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();
  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }
  const res = NextResponse.json(data);
  res.cookies.set("accessToken", data.accessToken, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "lax",
    maxAge: 2*60, // 15 minutes
  });

  res.cookies.set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "lax",
    maxAge: 4 * 60, // 7 days
  });

  if (data?.userInfo?.role) {
    res.cookies.set("role", data.userInfo.role, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      maxAge: 4* 60, // 7 days
    });
  }

  return res;
}