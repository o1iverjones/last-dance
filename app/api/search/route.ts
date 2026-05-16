import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: {
      playlistPrivate: false,
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { displayName: { contains: q, mode: "insensitive" } },
        {
          tracks: {
            some: {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { artist: { contains: q, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    },
    select: {
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      _count: { select: { tracks: true, followers: true } },
    },
    take: 30,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
