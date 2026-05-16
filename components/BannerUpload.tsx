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

export default function BannerUpload({ currentUrl, onUploaded }: Props) {
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

    const res = await fetch("/api/upload?type=banner", { method: "POST", body: formData });
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
    <div className="space-y-2">
      <div
        className="relative w-full h-32 rounded-lg overflow-hidden bg-panel border border-charcoal cursor-pointer group"
        onClick={() => mode === "upload" && inputRef.current?.click()}
      >
        {displayUrl ? (
          <Image src={displayUrl} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">
            No banner
          </div>
        )}
        {mode === "upload" && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-floral text-sm font-medium">
              {loading ? "Uploading…" : "Change banner"}
            </span>
          </div>
        )}
      </div>

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
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={loading} className="btn-secondary text-sm">
            {loading ? "Uploading…" : "Upload banner"}
          </button>
          <p className="text-xs text-muted">JPEG, PNG, WebP or AVIF · max 5 MB · wide images work best</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleUseUrl())}
            placeholder="https://example.com/banner.jpg"
            className="input text-sm"
          />
          <button type="button" onClick={handleUseUrl} className="btn-secondary text-sm whitespace-nowrap">
            Use URL
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      <input ref={inputRef} type="file" accept={ACCEPT} onChange={handleFileChange} className="hidden" />
    </div>
  );
}
