import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    bannerUrl?: string;
    playlistPrivate?: boolean;
    currentPassword?: string;
    newPassword?: string;
  };

  const data: Record<string, unknown> = {};

  if (body.displayName !== undefined) data.displayName = body.displayName;
  if (body.bio !== undefined) data.bio = body.bio || null;
  if (body.avatarUrl !== undefined) data.avatarUrl = body.avatarUrl || null;
  if (body.bannerUrl !== undefined) data.bannerUrl = body.bannerUrl || null;
  if (body.playlistPrivate !== undefined) data.playlistPrivate = body.playlistPrivate;

  if (body.newPassword) {
    if (!body.currentPassword) {
      return NextResponse.json({ error: "Current password required." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const valid = user && await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    data.passwordHash = await bcrypt.hash(body.newPassword, 12);
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      playlistPrivate: true,
      username: true,
    },
  });

  return NextResponse.json(updated);
}
