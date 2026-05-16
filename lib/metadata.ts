export type Platform = "youtube" | "spotify" | "soundcloud" | "bandcamp";

export type TrackMeta = {
  platform: Platform;
  title: string;
  artist?: string;
  thumbnail?: string;
  embedUrl: string;
};

function detectPlatform(url: string): Platform | null {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/open\.spotify\.com/.test(url)) return "spotify";
  if (/soundcloud\.com/.test(url)) return "soundcloud";
  if (/bandcamp\.com/.test(url)) return "bandcamp";
  return null;
}

async function fetchOEmbed(endpoint: string): Promise<Record<string, unknown>> {
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error("oEmbed fetch failed");
  return res.json();
}

function youtubeVideoId(url: string): string | null {
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return short[1];
  const watch = url.match(/[?&]v=([^&]+)/);
  return watch ? watch[1] : null;
}

async function fetchYouTubeMeta(url: string): Promise<TrackMeta> {
  const videoId = youtubeVideoId(url);
  const oembed = (await fetchOEmbed(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
  )) as { title?: string; author_name?: string; thumbnail_url?: string };

  return {
    platform: "youtube",
    title: oembed.title ?? "YouTube Video",
    artist: oembed.author_name,
    thumbnail: oembed.thumbnail_url,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  };
}

function spotifyEmbedUrl(url: string): string {
  // https://open.spotify.com/track/ID -> https://open.spotify.com/embed/track/ID
  return url.replace("open.spotify.com/", "open.spotify.com/embed/");
}

async function fetchSpotifyMeta(url: string): Promise<TrackMeta> {
  const oembed = (await fetchOEmbed(
    `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`
  )) as { title?: string; thumbnail_url?: string };

  return {
    platform: "spotify",
    title: oembed.title ?? "Spotify Track",
    thumbnail: oembed.thumbnail_url,
    embedUrl: spotifyEmbedUrl(url),
  };
}

async function fetchSoundCloudMeta(url: string): Promise<TrackMeta> {
  const oembed = (await fetchOEmbed(
    `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`
  )) as { title?: string; author_name?: string; thumbnail_url?: string };

  return {
    platform: "soundcloud",
    title: oembed.title ?? "SoundCloud Track",
    artist: oembed.author_name,
    thumbnail: oembed.thumbnail_url,
    embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`,
  };
}

async function fetchBandcampMeta(url: string): Promise<TrackMeta> {
  // If it's already a direct embed URL, use it as-is
  if (url.includes("bandcamp.com/EmbeddedPlayer")) {
    return {
      platform: "bandcamp",
      title: "Bandcamp Track",
      embedUrl: url,
    };
  }

  const oembed = (await fetchOEmbed(
    `https://bandcamp.com/oembed?url=${encodeURIComponent(url)}&format=json`
  )) as { title?: string; author_name?: string; thumbnail_url?: string; html?: string };

  const srcMatch = oembed.html?.match(/src="([^"]+)"/);
  const embedUrl = srcMatch
    ? srcMatch[1]
    : `https://bandcamp.com/EmbeddedPlayer/track=0/size=large/bgcol=ffffff/linkcol=0687f5/tracklist=false/transparent=true/`;

  return {
    platform: "bandcamp",
    title: oembed.title ?? "Bandcamp Track",
    artist: oembed.author_name,
    thumbnail: oembed.thumbnail_url,
    embedUrl,
  };
}

// Parse a raw <iframe ...> snippet — extract src, and title/artist from the anchor text
function parseIframeSnippet(input: string): { src: string; title?: string; artist?: string } | null {
  const src = input.match(/src="([^"]+)"/)?.[1];
  if (!src) return null;
  const anchor = input.match(/<a[^>]*>([^<]+)<\/a>/)?.[1];
  const [title, artist] = anchor ? anchor.split(" by ").map((s) => s.trim()) : [];
  return { src, title, artist };
}

export async function fetchTrackMetadata(url: string): Promise<TrackMeta> {
  const input = url.trim();

  // Handle pasted <iframe> embed snippets
  if (input.startsWith("<")) {
    const parsed = parseIframeSnippet(input);
    if (!parsed) throw new Error("Could not parse embed code. Try pasting the track URL instead.");
    const platform = detectPlatform(parsed.src);
    if (!platform) throw new Error("Unsupported embed source.");
    return {
      platform,
      title: parsed.title ?? "Embedded Track",
      artist: parsed.artist,
      embedUrl: parsed.src,
    };
  }

  const platform = detectPlatform(input);
  if (!platform) throw new Error("Unsupported URL. Paste a link from YouTube, Spotify, SoundCloud, or Bandcamp.");

  switch (platform) {
    case "youtube":
      return fetchYouTubeMeta(input);
    case "spotify":
      return fetchSpotifyMeta(input);
    case "soundcloud":
      return fetchSoundCloudMeta(input);
    case "bandcamp":
      return fetchBandcampMeta(input);
  }
}
