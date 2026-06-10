import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

type Params = {
  params: Promise<{
    classroomMaterialId: string;
  }>;
};

export async function PUT(req: Request, { params }: Params) {
  try {
    const { classroomMaterialId } = await params;
    const body = await req.json();
    const { order } = body;
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${env.API_URL}/${classroomMaterialId}/order`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ order }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Update classroom material order failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("UPDATE CLASSROOM MATERIAL ORDER ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
