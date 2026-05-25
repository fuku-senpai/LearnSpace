
import { env } from "@/config/env";
import { CLASS_API } from "@/constants/api-endpoints";
import { cookies } from "next/headers";

export async function GET(req: Request) {
	const url = new URL(req.url);
	const page = url.searchParams.get("page") || "0";
	const size = url.searchParams.get("size") || "10";
	const name = url.searchParams.get("name");
	const code = url.searchParams.get("code");

	const cookieStore = await cookies();
	const token = cookieStore.get("accessToken")?.value;

	const params = new URLSearchParams({
		page,
		size
	});

	if (name) params.append("name", name);
	if (code) params.append("code", code);

	const backendRes = await fetch(
		`${env.API_URL}${CLASS_API.GET_CLASSES}?${params.toString()}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			cache: "no-store",
		},
	);

	const data = await backendRes.json();

	if (!backendRes.ok) {
		return new Response(JSON.stringify(data), {
			status: backendRes.status,
		});
	}

	return Response.json(data);
}
