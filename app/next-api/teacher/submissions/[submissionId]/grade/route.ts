import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { TEACHER_API } from "@/constants/api-endpoints";

type Params = {
  params: Promise<{
    submissionId: string;
  }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const { submissionId } = await params;
    const body = await req.json();

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${env.API_URL}${TEACHER_API.GRADE_SUBMISSION(submissionId)}`,
      {
        method: "POST",
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
        { message: data?.message || "Grade submission failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GRADE SUBMISSION ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
