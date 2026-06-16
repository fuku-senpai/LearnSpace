import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { LESSON_QUIZ_API } from "@/constants/api-endpoints";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const size = searchParams.get("size");
    const title = searchParams.get("title");
    const quizType = searchParams.get("quizType");

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const queryParams = new URLSearchParams();
    if (page !== null) queryParams.set("page", page);
    if (size !== null) queryParams.set("size", size);
    if (title) queryParams.set("title", title);
    if (quizType) queryParams.set("quizType", quizType);

    const queryString = queryParams.toString();
    const url = `${env.API_URL}${LESSON_QUIZ_API.LIST}${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Fetch quiz bank failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET QUIZ BANK ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
