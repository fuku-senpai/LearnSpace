import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

type Params = {
  params: Promise<{
    classroomId: string;
  }>;
};

export async function POST(req: Request, { params }: Params) {
  try {
    const { classroomId } = await params;
    const body = await req.json();
    const { materialIds, materials } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${env.API_URL}/${classroomId}/materials/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        materialIds,
        materials,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Assign materials failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("ASSIGN MATERIALS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
