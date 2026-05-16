"use client";

import { useState } from "react";
import type { TrackMeta } from "@/lib/metadata";

type Props = {
  onAdded: (track: {
    id: string;
    url: string;
    platform: string;
    embedUrl: string;
    title: string;
    artist: string | null;
    thumbnail: string | null;
    note: string | null;
    order: number;
  }) => void;
};

export default function AddTrackForm({ onAdded }: Props) {
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState<TrackMeta | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"url" | "confirm">("url");

  async function fetchMeta() {
    setError("");
    setLoading(true);
    const res = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Could not fetch track info.");
      return;
    }
    setMeta(data);
    setStep("confirm");
  }

  async function addTrack() {
    if (!meta) return;
    setLoading(true);
    const res = await fetch("/api/tracks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, ...meta, note: note || null }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to add track.");
      return;
    }

    onAdded(data);
    setUrl("");
    setMeta(null);
    setNote("");
    setStep("url");
  }

  if (step === "confirm" && meta) {
    return (
      <div className="card p-4 space-y-3">
        <p className="text-sm font-medium text-muted">Confirm track</p>
        <div>
          <p className="font-medium">{meta.title}</p>
          {meta.artist && <p className="text-sm text-muted">{meta.artist}</p>}
          <p className="text-xs text-muted mt-0.5 capitalize">{meta.platform}</p>
        </div>
        {meta.platform === "bandcamp" && meta.embedUrl.includes("album=") && (
          <div className="flex gap-2 px-3 py-2.5 rounded-lg bg-yellow-950 border border-yellow-800">
            <span className="text-yellow-500 flex-shrink-0 text-sm">⚠</span>
            <p className="text-xs text-yellow-300">
              This is an album track. After it finishes, the Bandcamp player may continue playing other tracks from the same album rather than advancing to your next selection. Standalone Bandcamp tracks work better in playlists.
            </p>
          </div>
        )}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a personal note (optional)"
          rows={2}
          className="input resize-none"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button onClick={addTrack} disabled={loading} className="btn-primary">
            {loading ? "Adding…" : "Add to playlist"}
          </button>
          <button
            onClick={() => { setStep("url"); setMeta(null); setError(""); }}
            className="btn-secondary"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 space-y-2">
      <p className="text-sm font-medium text-muted">Add a track</p>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube, Spotify, SoundCloud, or Bandcamp URL or embed code"
          className="input flex-1"
          onKeyDown={(e) => e.key === "Enter" && url && fetchMeta()}
        />
        <button onClick={fetchMeta} disabled={!url || loading} className="btn-primary">
          {loading ? "…" : "Fetch"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
