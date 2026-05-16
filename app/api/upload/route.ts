import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import crypto from "crypto";
import { authOptions } from "@/lib/auth";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif",
};

const UPLOAD_TYPES = ["avatar", "banner"] as const;
type UploadType = (typeof UPLOAD_TYPES)[number];

function detectMimeType(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
  )
    return "image/png";
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  )
    return "image/webp";
  if (buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
    const brand = buf.subarray(8, 12).toString("ascii");
    if (["avif", "avis", "MA1A", "MA1B"].includes(brand)) return "image/avif";
  }
  return null;
}

function r2KeyFromUrl(url: string): string | null {
  try {
    const publicBase = process.env.R2_PUBLIC_URL!;
    if (!url.startsWith(publicBase)) return null;
    return url.slice(publicBase.length + 1);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uploadType = req.nextUrl.searchParams.get("type") as UploadType | null;
  if (!uploadType || !UPLOAD_TYPES.includes(uploadType)) {
    return NextResponse.json({ error: "Invalid upload type." }, { status: 400 });
  }

  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5 MB limit." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const detectedType = detectMimeType(buffer);
  if (!detectedType || !(detectedType in ALLOWED_MIME_TYPES)) {
    return NextResponse.json(
      { error: "Unsupported file type. Only JPEG, PNG, WebP, and AVIF are allowed." },
      { status: 400 }
    );
  }

  const ext = ALLOWED_MIME_TYPES[detectedType];
  const folder = uploadType === "banner" ? "banners" : "avatars";
  const key = `${folder}/${session.user.id}/${crypto.randomUUID()}${ext}`;
  const dbField = uploadType === "banner" ? "bannerUrl" : "avatarUrl";

  // Delete old file from R2 if it was a previous upload
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { avatarUrl: true, bannerUrl: true },
  });
  const oldUrl = uploadType === "banner" ? user?.bannerUrl : user?.avatarUrl;
  if (oldUrl) {
    const oldKey = r2KeyFromUrl(oldUrl);
    if (oldKey) await deleteFromR2(oldKey).catch(() => null);
  }

  const url = await uploadToR2(key, buffer, detectedType);

  await prisma.user.update({
    where: { id: session.user.id },
    data: { [dbField]: url },
  });

  return NextResponse.json({ url });
}
