import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/config/env";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body;

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${env.API_URL}/materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title,
        description,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Create material failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("CREATE MATERIAL ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const size = searchParams.get("size");
    const title = searchParams.get("title");

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const queryParams = new URLSearchParams();
    if (page) queryParams.set("page", page);
    if (size) queryParams.set("size", size);
    if (title) queryParams.set("title", title);
    const queryString = queryParams.toString();
    const url = `${env.API_URL}/materials${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message || "Fetch materials failed" },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET MATERIALS ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
