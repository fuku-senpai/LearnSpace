import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = url.searchParams.get("page") ?? "0";
    const size = url.searchParams.get("size") ?? "10";
    const hasTeacher = url.searchParams.get("hasTeacher");

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const backendUrl = new URL(`${env.API_URL}/classrooms-with-teacher`);
    backendUrl.searchParams.set("page", page);
    backendUrl.searchParams.set("size", size);
    if (hasTeacher !== null) {
      backendUrl.searchParams.set("hasTeacher", hasTeacher);
    }

    const res = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET CLASSROOMS WITH TEACHER ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
