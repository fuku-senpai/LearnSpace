import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { TEACHER_API } from "@/constants/api-endpoints";

type RouteContext = {
  params: Promise<{ teacherId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const { teacherId } = await context.params;
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") ?? "0";
    const size = searchParams.get("size") ?? "10";
    const status = searchParams.get("status");

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const params = new URLSearchParams({ page, size });
    if (status) {
      params.append("status", status);
    }

    const res = await fetch(
      `${env.API_URL}${TEACHER_API.GET_SCHEDULE(teacherId)}?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Fetch teacher schedule failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET TEACHER SCHEDULE ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
