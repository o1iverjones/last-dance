"use client";

import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import EmbedPlayer from "./EmbedPlayer";

export type Track = {
  id: string;
  url: string;
  platform: string;
  embedUrl: string;
  title: string;
  artist: string | null;
  thumbnail: string | null;
  note: string | null;
  order: number;
};

type Props = {
  track: Track;
  isOwner: boolean;
  onDelete?: (id: string) => void;
  isActive?: boolean;
  onEnded?: () => void;
  audioOnly?: boolean;
  sessionKey?: number;
};

export default function TrackCard({ track, isOwner, onDelete, isActive = false, onEnded, audioOnly = false, sessionKey = 0 }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Scroll active track into view
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isActive]);

  return (
    <div
      ref={(el) => {
        setNodeRef(el);
        (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      }}
      style={style}
      className={`card overflow-hidden transition-colors ${isActive ? "border-tangerine/60" : ""}`}
    >
      <div className="p-3 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          {isOwner && (
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-muted hover:text-floral transition-colors flex-shrink-0"
              aria-label="Drag to reorder"
            >
              ⠿
            </button>
          )}
          <div className="min-w-0">
            <p className={`font-medium text-sm truncate ${isActive ? "text-tangerine" : "text-floral"}`}>
              {track.title}
            </p>
            {track.artist && <p className="text-xs text-muted truncate">{track.artist}</p>}
            <p className="text-xs text-charcoal capitalize mt-0.5">{track.platform}</p>
          </div>
        </div>
        {isOwner && onDelete && (
          <button
            onClick={() => onDelete(track.id)}
            className="text-muted hover:text-red-400 transition-colors text-sm flex-shrink-0"
            aria-label="Remove track"
          >
            ✕
          </button>
        )}
      </div>

      <div className="px-3 pb-3">
        <EmbedPlayer track={track} isActive={isActive} onEnded={onEnded ?? (() => {})} audioOnly={audioOnly} sessionKey={sessionKey} />
      </div>

      {track.note && (
        <div className="px-3 pb-3">
          <p className="text-sm text-muted italic">"{track.note}"</p>
        </div>
      )}
    </div>
  );
}
