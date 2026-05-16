import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const track = await prisma.track.findUnique({ where: { id: params.id } });
  if (!track || track.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { title, artist, note } = await req.json();

  const updated = await prisma.track.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(artist !== undefined && { artist }),
      ...(note !== undefined && { note }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const track = await prisma.track.findUnique({ where: { id: params.id } });
  if (!track || track.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.track.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
