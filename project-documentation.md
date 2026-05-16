# 🎵 MyPlaylist — Project Documentation

> A web platform where anyone can curate and share a personal music playlist page, embedding tracks from across the web.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Target Audience](#target-audience)
3. [Core Features](#core-features)
4. [User Management](#user-management)
5. [User Home Page](#user-home-page)
6. [Playlist Management](#playlist-management)
7. [Supported Music Sources](#supported-music-sources)
8. [Discovery & Social Features](#discovery--social-features)
9. [Tech Stack Recommendations](#tech-stack-recommendations)
10. [Monetization](#monetization)
11. [Open Questions & Future Considerations](#open-questions--future-considerations)

---

## Project Overview

**MyPlaylist** is a web application that allows users to create a personal music playlist page by embedding songs and videos from popular music hosting platforms. Each user gets a single public-facing home page that displays a short bio, a profile picture, and their curated playlist of embedded tracks.

The platform is designed to be simple, expressive, and social — letting music lovers share what they're listening to with the world.

---

## Target Audience

- **General public** — anyone who wants to share their music taste online.
- No specific niche; the platform is open to music fans, artists, and casual listeners alike.

---

## Core Features

| Feature | Description |
|---|---|
| User accounts | Register, log in, and manage a personal profile |
| Profile home page | Bio, profile picture, and embedded playlist |
| Playlist management | Add, reorder, annotate, and remove tracks |
| Privacy control | Toggle playlist visibility between public and private |
| Social interactions | Follow other users, like/favorite playlists |
| Discovery | Explore page and search by username or song |
| Responsive design | Fully functional on desktop and mobile |

---

## User Management

### Authentication
- **Sign-up / Login:** Email and password (with hashed storage, e.g. bcrypt).
- Password reset via email link.
- Email verification on account creation.

### Account Settings
Users can manage:
- Display name
- Email address
- Password
- Profile picture (upload)
- Bio (short text description)
- Page theme / visual customization
- Playlist privacy (public or private)
- Account deletion

---

## User Home Page

Each user has a single home page at a URL such as `/u/username`.

### Page Layout
1. **Header / Profile Section**
   - Profile picture
   - Display name
   - Short bio
   - Follow button (for other users viewing the page)
   - Follower / following counts
   - "Like" count for the playlist

2. **Playlist Section**
   - List of embedded tracks in user-defined order
   - Each track displays:
     - Embedded player (YouTube, Spotify, SoundCloud, or Bandcamp)
     - Song title and artist (auto-fetched, manually overridable)
     - Optional user note or description per track

### Privacy
- If set to **private**, the playlist is hidden from public visitors; only the owner can view it.
- If set to **public**, the home page is visible to anyone with the link and discoverable via search/explore.

---

## Playlist Management

### Adding Tracks
1. User pastes a URL from a supported platform.
2. Metadata (title, artist, thumbnail) is **auto-fetched** from the URL via oEmbed or platform APIs.
3. User can **manually override** any fetched metadata field.
4. An embedded player is generated and added to the playlist.

### Track Options
- **Notes / description:** Each track can have a short personal note from the user.
- **Reordering:** Tracks can be rearranged via **drag-and-drop**.
- **Deletion:** Tracks can be removed individually.

### Constraints
- Each user has **one playlist** on their home page.
- No limit on the number of tracks per playlist (subject to future review).

---

## Supported Music Sources

| Platform | Embed Method |
|---|---|
| YouTube / YouTube Music | YouTube iframe embed API |
| Spotify | Spotify Embed API (tracks, albums, playlists) |
| SoundCloud | SoundCloud oEmbed / Widget API |
| Bandcamp | Bandcamp embeddable player |

> **Note:** Embedding behavior depends on each platform's policies. Some content (e.g. Spotify tracks) may require the viewer to have an account on that platform for full playback.

---

## Discovery & Social Features

### Social Interactions
- **Follow users:** Follow/unfollow other users; following list visible on profile.
- **Like a playlist:** Users can like another user's playlist (one like per user per playlist).

### Discovery
- **Explore page:** A curated or algorithmic feed of public playlists, potentially featuring recently updated or popular pages.
- **Search:** Search by username or song/artist name across public playlists.

---

## Tech Stack Recommendations

Since there is no existing stack preference, the following is a recommended modern, beginner-to-intermediate-friendly stack:

### Frontend
- **Framework:** React (with Next.js for SSR/SEO and routing)
- **Styling:** Tailwind CSS
- **Drag-and-drop:** `dnd-kit` or `react-beautiful-dnd`
- **Embedded players:** Platform-specific SDKs / iframes

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js or Next.js API routes
- **Authentication:** NextAuth.js (supports email/password via credentials provider)
- **ORM:** Prisma

### Database
- **Primary DB:** PostgreSQL (users, playlists, tracks, follows, likes)
- **File storage:** AWS S3 or Cloudflare R2 (profile pictures)

### Metadata Fetching
- **oEmbed:** Standard oEmbed endpoints for SoundCloud, YouTube
- **Spotify:** Spotify Web API (requires OAuth app registration)
- **Bandcamp:** Bandcamp oEmbed endpoint

### Hosting
- **App:** Vercel (works seamlessly with Next.js)
- **DB:** Supabase or Railway (managed PostgreSQL)

---

## Monetization

Monetization model is **not yet decided**. Options to consider in a future planning session:

- **Free for all:** Fully free, sustained by the creator or future sponsorships.
- **Freemium:** Free tier with limits (e.g. max 10 tracks), paid tier for unlimited tracks, custom themes, analytics, etc.
- **Donation / tip-based:** Optional support from users (e.g. Buy Me a Coffee integration).
- **Ads:** Non-intrusive display ads for free users.

---

## Open Questions & Future Considerations

- [ ] What should the URL structure be? (`/u/username`, `/@username`, custom domain?)
- [ ] Should there be a follow feed / activity timeline showing updates from followed users?
- [ ] Should liked playlists be visible on the user's profile?
- [ ] Is there an admin dashboard needed for moderation (e.g. reporting inappropriate content)?
- [ ] What happens to embedded content if a linked song is taken down on the source platform?
- [ ] Should users be able to customize their page with themes or color schemes?
- [ ] Will there be any API rate limit handling for metadata auto-fetch from Spotify?
- [ ] Are there plans for analytics (e.g. how many views a playlist has received)?

---

*Document version: 0.1 — Initial draft based on discovery interview.*
