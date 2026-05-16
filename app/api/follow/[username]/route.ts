import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.user.findUnique({ where: { username: params.username } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.id === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  await prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: target.id,
      },
    },
    create: { followerId: session.user.id, followingId: target.id },
    update: {},
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const target = await prisma.user.findUnique({ where: { username: params.username } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await prisma.follow.deleteMany({
    where: { followerId: session.user.id, followingId: target.id },
  });

  return NextResponse.json({ ok: true });
}
