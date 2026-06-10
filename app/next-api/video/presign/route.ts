import { VIDEO_API } from "@/constants/api-endpoints";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await fetch(
      `${env.API_URL}${VIDEO_API.PRESIGN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { message: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}