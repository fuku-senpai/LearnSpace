import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { Record_API } from "@/constants/api-endpoints";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, videoType, fileKey, snapLessonId } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${env.API_URL}${Record_API.CREATE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ title, videoType, fileKey, snapLessonId }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Create record failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("CREATE RECORD ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
