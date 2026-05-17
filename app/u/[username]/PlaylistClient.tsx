"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import TrackCard, { type Track } from "@/components/TrackCard";
import AddTrackForm from "@/components/AddTrackForm";
import ShareModal from "@/components/ShareModal";

type Props = {
  initialTracks: Track[];
  isOwner: boolean;
  username: string;
  isFollowing: boolean;
  hasLiked: boolean;
  followerCount: number;
  likeCount: number;
  isAuthenticated: boolean;
};

// Platforms that can't signal end-of-track — user must press Next manually
const MANUAL_NEXT_PLATFORMS = new Set(["spotify", "bandcamp"]);

export default function PlaylistClient({
  initialTracks,
  isOwner,
  username,
  isFollowing: initialFollowing,
  hasLiked: initialLiked,
  followerCount: initialFollowerCount,
  likeCount: initialLikeCount,
  isAuthenticated,
}: Props) {
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [hasLiked, setHasLiked] = useState(initialLiked);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [showShare, setShowShare] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [audioOnly, setAudioOnly] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tracks.findIndex((t) => t.id === active.id);
    const newIndex = tracks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tracks, oldIndex, newIndex);
    setTracks(reordered);

    await fetch("/api/tracks/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedIds: reordered.map((t) => t.id) }),
    });
  }

  const handleDelete = useCallback(async (id: string) => {
    await fetch(`/api/tracks/${id}`, { method: "DELETE" });
    setTracks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleAdded = useCallback((track: Track) => {
    setTracks((prev) => [...prev, track]);
  }, []);

  async function toggleFollow() {
    const method = isFollowing ? "DELETE" : "POST";
    await fetch(`/api/follow/${username}`, { method });
    setIsFollowing(!isFollowing);
    setFollowerCount((c) => c + (isFollowing ? -1 : 1));
  }

  async function toggleLike() {
    const method = hasLiked ? "DELETE" : "POST";
    await fetch(`/api/like/${username}`, { method });
    setHasLiked(!hasLiked);
    setLikeCount((c) => c + (hasLiked ? -1 : 1));
  }

  function playAll() {
    if (tracks.length === 0) return;
    setSessionKey((k) => k + 1);
    setActiveIndex(0);
  }

  function stop() {
    setActiveIndex(null);
  }

  function prev() {
    setActiveIndex((i) => (i !== null && i > 0 ? i - 1 : i));
  }

  const next = useCallback(() => {
    setActiveIndex((i) => {
      if (i === null) return null;
      return i < tracks.length - 1 ? i + 1 : null;
    });
  }, [tracks.length]);

  const isPlaying = activeIndex !== null;
  const activeTrack = activeIndex !== null ? tracks[activeIndex] : null;
  const needsManualNext = activeTrack ? MANUAL_NEXT_PLATFORMS.has(activeTrack.platform) : false;

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/u/${username}`
    : `/u/${username}`;

  return (
    <div className="space-y-6">
      {!isOwner && (
        <div className="flex gap-3">
          {isAuthenticated && (
            <>
              <button
                onClick={toggleFollow}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  isFollowing
                    ? "border-charcoal text-floral hover:border-red-500 hover:text-red-400"
                    : "bg-laser border-laser text-floral hover:bg-blue-700"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
              <button
                onClick={toggleLike}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  hasLiked
                    ? "border-tangerine text-tangerine"
                    : "border-charcoal text-floral hover:border-tangerine hover:text-tangerine"
                }`}
              >
                {hasLiked ? "♥" : "♡"} {likeCount}
              </button>
            </>
          )}
          <button
            onClick={() => setShowShare(true)}
            className="px-4 py-1.5 rounded-full text-sm font-medium border border-charcoal text-floral hover:border-floral transition-colors"
          >
            Share
          </button>
        </div>
      )}

      {showShare && (
        <ShareModal
          url={profileUrl}
          displayName={username}
          onClose={() => setShowShare(false)}
        />
      )}

      {isOwner && (
        <div className="flex gap-4 text-sm text-muted">
          <span>{followerCount} followers</span>
          <span>{likeCount} likes</span>
        </div>
      )}

      {isOwner && <AddTrackForm onAdded={handleAdded} />}

      {tracks.length === 0 ? (
        <p className="text-muted text-sm">
          {isOwner ? "Add your first track above." : "No tracks yet."}
        </p>
      ) : (
        <div className="space-y-4">
          {/* Player controls */}
          {!isPlaying ? (
            <div className="flex items-center gap-3">
              <button
                onClick={playAll}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-tangerine text-ink text-sm font-semibold hover:bg-orange-400 transition-colors"
              >
                <span className="text-base leading-none">▶</span> Play all
              </button>
              <button
                onClick={() => setAudioOnly((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                  audioOnly
                    ? "bg-tangerine text-ink border-tangerine"
                    : "border-charcoal text-muted hover:border-floral hover:text-floral"
                }`}
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 fill-current" aria-hidden>
                  <path d="M9 2v8.5a2.5 2.5 0 1 1-1-2V4.4L5 5.2V11.5a2.5 2.5 0 1 1-1-2V4.5l5-1.3V2h.01z"/>
                </svg>
                Audio only
              </button>
            </div>
          ) : (
            <div className="sticky top-20 z-10 -mx-4 px-4 py-2 bg-ink">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-panel border border-charcoal">
              <button
                onClick={prev}
                disabled={activeIndex === 0}
                className="w-8 h-8 rounded-full bg-tangerine flex items-center justify-center disabled:opacity-30"
                title="Previous"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-ink"><path d="M3 2h1.5v5.3L13 2v12L4.5 8.7V14H3z"/></svg>
              </button>
              <button
                onClick={stop}
                className="w-8 h-8 rounded-full bg-tangerine flex items-center justify-center"
                title="Stop"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-ink"><rect x="3" y="3" width="10" height="10" rx="1"/></svg>
              </button>
              <button
                onClick={next}
                className="w-8 h-8 rounded-full bg-tangerine flex items-center justify-center"
                title="Next"
              >
                <svg viewBox="0 0 16 16" className="w-4 h-4 fill-ink"><path d="M13 2h-1.5v5.3L3 2v12l8.5-5.3V14H13z"/></svg>
              </button>
              <div className="flex-1 min-w-0 ml-1">
                <p className="text-xs text-muted">
                  {activeIndex! + 1} / {tracks.length}
                </p>
                <p className="text-sm text-floral truncate font-medium">{activeTrack?.title}</p>
                {needsManualNext && (
                  <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                    Press
                    <span className="inline-flex w-5 h-5 rounded-full bg-tangerine items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 16 16" className="w-3 h-3 fill-ink"><path d="M13 2h-1.5v5.3L3 2v12l8.5-5.3V14H13z"/></svg>
                    </span>
                    when this track ends
                  </p>
                )}
              </div>
              <button
                onClick={() => setAudioOnly((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex-shrink-0 ${
                  audioOnly
                    ? "bg-tangerine text-ink border-tangerine"
                    : "border-charcoal text-muted hover:border-floral hover:text-floral"
                }`}
              >
                <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current" aria-hidden>
                  <path d="M9 2v8.5a2.5 2.5 0 1 1-1-2V4.4L5 5.2V11.5a2.5 2.5 0 1 1-1-2V4.5l5-1.3V2h.01z"/>
                </svg>
                Audio only
              </button>
            </div>
            </div>
          )}

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tracks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {tracks.map((track, i) => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isOwner={isOwner}
                    onDelete={isOwner ? handleDelete : undefined}
                    isActive={activeIndex === i}
                    onEnded={next}
                    audioOnly={audioOnly}
                    sessionKey={sessionKey}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
