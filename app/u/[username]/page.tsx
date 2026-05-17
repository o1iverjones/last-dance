import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import PlaylistClient from "./PlaylistClient";

type Props = { params: { username: string } };

export async function generateMetadata({ params }: Props) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: { displayName: true, bio: true },
  });
  if (!user) return { title: "Not found" };
  return {
    title: `${user.displayName} — Last Dance`,
    description: user.bio ?? undefined,
  };
}

export default async function ProfilePage({ params }: Props) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      tracks: { orderBy: { order: "asc" } },
      _count: { select: { followers: true, likesReceived: true } },
    },
  });

  if (!user) notFound();

  const isOwner = session?.user.id === user.id;

  if (user.playlistPrivate && !isOwner) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-6">
        <p className="text-lg font-medium text-floral">This playlist is private.</p>
        <img
          src="/private.png"
          alt="Closed for a private party"
          className="w-80 max-w-full rounded-xl opacity-90"
        />
      </div>
    );
  }

  let isFollowing = false;
  let hasLiked = false;

  if (session && !isOwner) {
    const [follow, like] = await Promise.all([
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: session.user.id, followingId: user.id } },
      }),
      prisma.like.findUnique({
        where: { giverId_receiverId: { giverId: session.user.id, receiverId: user.id } },
      }),
    ]);
    isFollowing = !!follow;
    hasLiked = !!like;
  }

  return (
    <div className="space-y-8">
      {/* Profile header card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="relative w-full h-48 bg-panel">
          {user.bannerUrl && (
            <Image src={user.bannerUrl} alt="Profile banner" fill className="object-cover" priority />
          )}
        </div>

        {/* Avatar + info */}
        <div className="px-5 pb-5">
          <div className="relative -mt-10 mb-3 w-20 h-20">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.displayName}
                width={80}
                height={80}
                className="rounded-full object-cover w-20 h-20 ring-4 ring-panel"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-charcoal ring-4 ring-panel flex items-center justify-center text-2xl font-bold text-floral">
                {user.displayName[0].toUpperCase()}
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-floral">{user.displayName}</h1>
          <p className="text-sm text-muted">@{user.username}</p>
          {user.bio && <p className="text-sm mt-1 text-floral whitespace-pre-wrap">{user.bio}</p>}
          <p className="text-xs text-muted mt-1">
            {user._count.followers} followers · {user._count.likesReceived} likes
          </p>
        </div>
      </div>

      {/* Playlist */}
      <PlaylistClient
        initialTracks={user.tracks}
        isOwner={isOwner}
        username={params.username}
        isFollowing={isFollowing}
        hasLiked={hasLiked}
        followerCount={user._count.followers}
        likeCount={user._count.likesReceived}
        isAuthenticated={!!session}
      />
    </div>
  );
}
