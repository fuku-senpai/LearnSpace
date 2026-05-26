import { AUTH_API } from "@/constants/api-endpoints";
import { env } from "@/config/env";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const refreshTokenFromBody = body.refreshToken;
    // 1. Lấy cookie nếu có
    const cookieStore = await cookies();
    const refreshTokenFromCookie = cookieStore.get("refreshToken")?.value;
    // 2. Chọn token ưu tiên cookie, fallback body
    const refreshToken = refreshTokenFromCookie ?? refreshTokenFromBody;
    let backendData: any = null;
    let backendStatus = 200;

    // 3. Gọi backend logout
    if (refreshToken) {
      const backendRes = await fetch(`${env.API_URL}${AUTH_API.LOGOUT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      backendStatus = backendRes.status;
      try {
        backendData = await backendRes.json();
      } catch {
        backendData = { message: "Cannot parse backend response" };
      }
    }

    // 4. Dọn dẹp cookie
    const res = NextResponse.json(
      {
        message:
          backendStatus >= 400
            ? backendData?.message ?? "Backend logout failed"
            : "Logout successfully",
        backend: backendData,
      },
      { status: backendStatus }
    );
    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    res.cookies.delete("role");
    
    return res;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}