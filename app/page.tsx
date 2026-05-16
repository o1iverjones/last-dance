import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function getPublicPlaylists(q?: string) {
  return prisma.user.findMany({
    where: {
      playlistPrivate: false,
      ...(q
        ? {
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
          }
        : {}),
    },
    select: {
      username: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      _count: { select: { tracks: true, followers: true, likesReceived: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

type PageProps = { searchParams: { q?: string } };

export default async function ExplorePage({ searchParams }: PageProps) {
  const q = searchParams.q?.trim() ?? "";
  const users = await getPublicPlaylists(q || undefined);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Explore playlists</h1>
        <p className="text-sm text-muted">Discover what people are listening to.</p>
      </div>

      <form method="GET" action="/" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by username, song, or artist…"
          className="input flex-1"
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      {users.length === 0 ? (
        <p className="text-muted text-sm">
          {q ? `No results for "${q}".` : "No public playlists yet. Be the first!"}
        </p>
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <Link
              key={user.username}
              href={`/u/${user.username}`}
              className="card flex items-center gap-4 p-4 hover:bg-panel-hover transition-colors"
            >
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.displayName}
                  width={48}
                  height={48}
                  className="rounded-full object-cover w-12 h-12 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 font-bold text-floral">
                  {user.displayName[0].toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <p className="font-medium text-floral">{user.displayName}</p>
                <p className="text-sm text-muted">@{user.username}</p>
                {user.bio && (
                  <p className="text-sm text-muted mt-0.5">
                    {user.bio.length > 200 ? user.bio.slice(0, 200) + "…" : user.bio}
                  </p>
                )}
                <p className="text-xs text-charcoal mt-0.5">
                  {user._count.tracks} tracks · {user._count.followers} followers ·{" "}
                  {user._count.likesReceived} likes
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
