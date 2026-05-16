import { NextRequest, NextResponse } from "next/server";
import { fetchTrackMetadata } from "@/lib/metadata";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "url param required" }, { status: 400 });
  }

  try {
    const meta = await fetchTrackMetadata(url);
    return NextResponse.json(meta);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch metadata";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
