import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { SNAP_CLASSROOM_MATERIAL_API } from "@/constants/api-endpoints";

type Params = {
  params: Promise<{
    snapClassroomMaterialId: string;
  }>;
};

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { snapClassroomMaterialId } = await params;

    if (!snapClassroomMaterialId) {
      return NextResponse.json(
        { message: "snapClassroomMaterialId is required" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(
      `${env.API_URL}${SNAP_CLASSROOM_MATERIAL_API.DELETE(snapClassroomMaterialId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Delete snap classroom material failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("DELETE SNAP CLASSROOM MATERIAL ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
