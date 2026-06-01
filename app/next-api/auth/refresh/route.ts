import { env } from "@/config/env";
import { AUTH_API } from "@/constants/api-endpoints";
import { NextResponse, type NextRequest } from "next/server";
export async function POST(req: NextRequest) {
  let refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
    try {
      const body = await req.json();
      refreshToken = body?.refreshToken;
    } catch {
      refreshToken = undefined;
    }
  }

  if (!refreshToken) {
    return NextResponse.json(
      { message: "Missing refresh token" },
      { status: 401 },
    );
  }

  const backendRes = await fetch(`${env.API_URL}${AUTH_API.REFRESH_TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await backendRes.json();
  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }
  const res = NextResponse.json(data);
  if (data?.newAccessToken) {
    res.cookies.set("accessToken", data.newAccessToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      sameSite: "lax",
      maxAge: 15*60, // 15 minutes
    });
  }
  return res;
}
