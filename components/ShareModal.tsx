"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  url: string;
  displayName: string;
  onClose: () => void;
};

type CopyState = "idle" | "copied";

const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073c0 6.027 4.388 11.025 10.125 11.927v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.313 0 2.686.235 2.686.235v2.953h-1.514c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796v8.437C19.612 23.098 24 18.1 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.246 2.242 1.308 3.608.058 1.265.07 1.645.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.246-3.608 1.308-1.265.058-1.645.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.246-2.242-1.308-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.333.014 7.053.072 5.197.157 3.355.673 1.924 2.104.493 3.535-.023 5.377.072 7.233.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.085 1.856.601 3.698 2.032 5.129 1.431 1.431 3.273 1.947 5.129 2.032C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c1.856-.085 3.698-.601 5.129-2.032 1.431-1.431 1.947-3.273 2.032-5.129.058-1.28.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.085-1.857-.601-3.699-2.032-5.13C20.646.673 18.804.157 16.948.072 15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export default function ShareModal({ url, displayName, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [hint, setHint] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copyLink(message?: string) {
    await navigator.clipboard.writeText(url);
    setCopyState("copied");
    setHint(message ?? "");
    setTimeout(() => { setCopyState("idle"); setHint(""); }, 2500);
  }

  const shareText = encodeURIComponent(`Check out ${displayName}'s playlist on Last Dance`);
  const shareUrl = encodeURIComponent(url);

  const options = [
    {
      label: "Share on X",
      icon: <XIcon />,
      color: "hover:bg-[#1a1a1a]",
      action: () => window.open(`https://x.com/intent/post?url=${shareUrl}&text=${shareText}`, "_blank"),
    },
    {
      label: "Share on Facebook",
      icon: <FacebookIcon />,
      color: "hover:bg-[#1877f2]/20",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, "_blank"),
    },
    {
      label: "Share on Instagram",
      icon: <InstagramIcon />,
      color: "hover:bg-[#e1306c]/20",
      action: () => copyLink("Link copied — paste it into Instagram"),
    },
    {
      label: "Share on TikTok",
      icon: <TikTokIcon />,
      color: "hover:bg-[#69c9d0]/10",
      action: () => copyLink("Link copied — paste it into TikTok"),
    },
    {
      label: copyState === "copied" && !hint ? "Copied!" : "Copy link",
      icon: <LinkIcon />,
      color: "hover:bg-panel-hover",
      action: () => copyLink(),
    },
  ];

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-panel border border-charcoal rounded-xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal">
          <h2 className="font-semibold text-floral">Share playlist</h2>
          <button onClick={onClose} className="text-muted hover:text-floral transition-colors text-lg leading-none">✕</button>
        </div>

        <div className="p-3 space-y-1">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-floral transition-colors text-sm text-left ${opt.color}`}
            >
              <span className="text-muted flex-shrink-0">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {hint && (
          <p className="px-5 pb-4 text-xs text-tangerine">{hint}</p>
        )}
      </div>
    </div>
  );
}
