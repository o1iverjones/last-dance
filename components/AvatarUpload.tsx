"use client";

import { useRef, useState } from "react";
import Image from "next/image";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".jpg,.jpeg,.png,.webp,.avif";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

type Props = {
  currentUrl: string | null;
  onUploaded: (url: string) => void;
};

type Mode = "upload" | "url";

export default function AvatarUpload({ currentUrl, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("url");
  const [preview, setPreview] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const displayUrl = preview ?? currentUrl;

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and AVIF files are allowed.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File must be under 5 MB.");
      e.target.value = "";
      return;
    }

    setPreview(URL.createObjectURL(file));
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload?type=avatar", { method: "POST", body: formData });
    const data = await res.json();

    setLoading(false);
    e.target.value = "";

    if (!res.ok) {
      setError(data.error ?? "Upload failed.");
      setPreview(null);
      return;
    }

    setPreview(null);
    onUploaded(data.url);
  }

  function handleUseUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setError("");
    try {
      new URL(trimmed);
    } catch {
      setError("Please enter a valid URL.");
      return;
    }
    onUploaded(trimmed);
    setUrlInput("");
  }

  return (
    <div className="flex items-start gap-4">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-panel border border-charcoal flex-shrink-0 flex items-center justify-center">
        {displayUrl ? (
          <Image src={displayUrl} alt="Avatar" width={64} height={64} className="object-cover w-full h-full" />
        ) : (
          <span className="text-muted text-xs">No photo</span>
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => { setMode("url"); setError(""); }}
            className={`pb-0.5 border-b transition-colors ${mode === "url" ? "border-tangerine text-tangerine" : "border-transparent text-muted hover:text-floral"}`}
          >
            Image URL
          </button>
          <button
            type="button"
            onClick={() => { setMode("upload"); setError(""); }}
            className={`pb-0.5 border-b transition-colors ${mode === "upload" ? "border-tangerine text-tangerine" : "border-transparent text-muted hover:text-floral"}`}
          >
            Upload file
          </button>
        </div>

        {mode === "upload" ? (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="btn-secondary text-sm"
            >
              {loading ? "Uploading…" : "Upload photo"}
            </button>
            <p className="text-xs text-muted">JPEG, PNG, WebP or AVIF · max 5 MB</p>
            <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFileChange} className="hidden" />
          </>
        ) : (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUseUrl())}
              placeholder="https://example.com/photo.jpg"
              className="input text-sm"
            />
            <button type="button" onClick={handleUseUrl} className="btn-secondary text-sm whitespace-nowrap">
              Use URL
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
