import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { LESSON_QUIZ_API } from "@/constants/api-endpoints";

type Params = {
  params: Promise<{
    quizId: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  try {
    const { quizId } = await params;
    const body = await req.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${env.API_URL}${LESSON_QUIZ_API.UPDATE_QUESTIONS(quizId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Update quiz questions failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("UPDATE LESSON QUIZ QUESTIONS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
