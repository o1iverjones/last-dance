"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Track } from "./TrackCard";

type Props = {
  track: Track;
  isActive: boolean;
  onEnded: () => void;
  audioOnly: boolean;
};

function buildSrc(track: Track, isActive: boolean): string {
  try {
    const url = new URL(track.embedUrl);
    if (isActive) {
      if (track.platform === "youtube") {
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("enablejsapi", "1");
      } else if (track.platform === "soundcloud") {
        url.searchParams.set("auto_play", "true");
      }
    }
    return url.toString();
  } catch {
    return track.embedUrl;
  }
}

export default function EmbedPlayer({ track, isActive, onEnded, audioOnly }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // Stable ref so event handlers don't go stale
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  // YouTube: send listening handshake after iframe loads to activate postMessage events
  const onYTLoad = useCallback(() => {
    if (!isActive || track.platform !== "youtube") return;
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: 1 }),
      "*"
    );
  }, [isActive, track.platform]);

  // YouTube: window postMessage listener — fires state=0 when video ends
  useEffect(() => {
    if (track.platform !== "youtube" || !isActive) return;

    function onMessage(e: MessageEvent) {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      try {
        const d = typeof e.data === "string" ? JSON.parse(e.data) : e.data;
        if (d.event === "onStateChange" && d.info === 0) onEndedRef.current();
      } catch {}
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [track.platform, isActive]);

  // SoundCloud: attach Widget API after the iframe loads
  const onSCLoad = useCallback(() => {
    if (!isActive || track.platform !== "soundcloud") return;

    function attach() {
      const SC = (window as any).SC;
      if (!SC || !iframeRef.current) return;
      const widget = SC.Widget(iframeRef.current);
      widget.bind(SC.Widget.Events.READY, () => {
        widget.bind(SC.Widget.Events.FINISH, () => onEndedRef.current());
      });
    }

    const SC = (window as any).SC;
    if (SC) { attach(); return; }

    const existing = document.getElementById("sc-widget-api");
    if (!existing) {
      const s = document.createElement("script");
      s.id = "sc-widget-api";
      s.src = "https://w.soundcloud.com/player/api.js";
      s.onload = attach;
      document.head.appendChild(s);
    } else {
      existing.addEventListener("load", attach, { once: true });
    }
  }, [isActive, track.platform]);

  const src = buildSrc(track, isActive);
  // key forces iframe remount when isActive changes so autoplay params take effect
  const ikey = `${track.id}-${isActive}`;

  if (track.platform === "soundcloud") {
    return (
      <iframe
        key={ikey}
        ref={iframeRef}
        onLoad={onSCLoad}
        width="100%"
        height="116"
        src={src}
        allow="autoplay"
        className="rounded-lg"
      />
    );
  }
  if (track.platform === "spotify") {
    return (
      <iframe
        key={ikey}
        ref={iframeRef}
        src={src}
        width="100%"
        height="80"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="rounded-lg"
      />
    );
  }
  if (track.platform === "bandcamp") {
    return (
      <iframe
        key={ikey}
        ref={iframeRef}
        src={src}
        seamless
        allow="autoplay"
        width="100%"
        height="120"
        className="rounded-lg"
      />
    );
  }
  // YouTube (default)
  return (
    <div className={audioOnly ? "h-0 overflow-hidden" : ""}>
      <iframe
        key={ikey}
        ref={iframeRef}
        onLoad={onYTLoad}
        width="100%"
        height="200"
        src={src}
        title={track.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="rounded-lg"
      />
    </div>
  );
}
