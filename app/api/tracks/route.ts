import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, platform, embedUrl, title, artist, thumbnail, note } = await req.json();

  if (!url || !platform || !embedUrl || !title) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const maxOrder = await prisma.track.aggregate({
    where: { userId: session.user.id },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? -1) + 1;

  const track = await prisma.track.create({
    data: {
      userId: session.user.id,
      url,
      platform,
      embedUrl,
      title,
      artist: artist ?? null,
      thumbnail: thumbnail ?? null,
      note: note ?? null,
      order,
    },
  });

  return NextResponse.json(track, { status: 201 });
}
