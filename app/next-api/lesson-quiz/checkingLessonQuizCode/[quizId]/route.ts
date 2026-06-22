import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { LESSON_QUIZ_API } from "@/constants/api-endpoints";

type Params = {
  params: Promise<{
    quizId: string;
  }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const { quizId } = await params;
    const body = await req.json();
    const { lessonQuizCode } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${env.API_URL}${LESSON_QUIZ_API.CHECK_CODE(quizId)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ lessonQuizCode }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Mã đề không hợp lệ" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("CHECK LESSON QUIZ CODE ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
