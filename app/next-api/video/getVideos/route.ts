import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { VIDEO_API } from "@/constants/api-endpoints";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const snapLessonId = searchParams.get("snapLessonId");

    if (!snapLessonId) {
      return NextResponse.json(
        { message: "snapLessonId is required" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${env.API_URL}${VIDEO_API.PLAY(snapLessonId)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Fetch video failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET VIDEO PLAY URL ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
