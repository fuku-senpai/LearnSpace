import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { CLASS_API } from "@/constants/api-endpoints";

type RouteContext = {
  params: Promise<{ classroomId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  try {
    const { classroomId } = await context.params;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${env.API_URL}${CLASS_API.SNAP_MATERIALS(classroomId)}`, {
      method: "GET",
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
    console.error("GET SNAP MATERIALS ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
