import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";
import { CLASS_API } from "@/constants/api-endpoints";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      startDate,
      endDate,
    } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const res = await fetch(`${env.API_URL}${CLASS_API.CREATE_CLASS}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        name,
        description,
        startDate,
        endDate,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ message: data }, { status: res.status });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("CREATE CLASS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
