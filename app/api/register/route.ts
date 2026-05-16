import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, username, displayName, password } = await req.json();

  if (!email || !username || !displayName || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const usernameRegex = /^[a-z0-9_]{3,30}$/;
  if (!usernameRegex.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3–30 chars: lowercase letters, numbers, underscores only." },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing?.email === email) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }
  if (existing?.username === username) {
    return NextResponse.json({ error: "Username already taken." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, username, displayName, passwordHash },
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}
