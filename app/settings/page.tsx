"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";
import AvatarUpload from "@/components/AvatarUpload";
import BannerUpload from "@/components/BannerUpload";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    displayName: "",
    bio: "",
    avatarUrl: "",
    bannerUrl: "",
    playlistPrivate: false,
  });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/settings/me")
      .then((r) => r.json())
      .then((data) => {
        setForm({
          displayName: data.displayName ?? "",
          bio: data.bio ?? "",
          avatarUrl: data.avatarUrl ?? "",
          bannerUrl: data.bannerUrl ?? "",
          playlistPrivate: data.playlistPrivate ?? false,
        });
      });
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName || undefined,
        bio: form.bio || null,
        avatarUrl: form.avatarUrl || null,
        bannerUrl: form.bannerUrl || null,
        playlistPrivate: form.playlistPrivate,
      }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to save.");
      return;
    }
    setSuccess("Saved.");
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pwForm),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to change password.");
      return;
    }
    setSuccess("Password changed.");
    setPwForm({ currentPassword: "", newPassword: "" });
  }

  if (status === "loading") return null;

  return (
    <div className="max-w-md space-y-10">
      <h1 className="text-2xl font-bold">Settings</h1>

      {success && (
        <p className="text-sm text-green-400 bg-green-950 border border-green-800 rounded px-3 py-2">
          {success}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        <h2 className="font-semibold text-floral">Profile</h2>

        <div>
          <label className="block text-sm font-medium mb-2 text-floral">Banner image</label>
          <BannerUpload
            currentUrl={form.bannerUrl || null}
            onUploaded={(url) => setForm({ ...form, bannerUrl: url })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-floral">Profile photo</label>
          <AvatarUpload
            currentUrl={form.avatarUrl || null}
            onUploaded={(url) => setForm({ ...form, avatarUrl: url })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-floral">Display name</label>
          <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="input" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-floral">Bio</label>
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input resize-none" />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.playlistPrivate}
            onChange={(e) => setForm({ ...form, playlistPrivate: e.target.checked })}
            className="rounded accent-tangerine"
          />
          <span className="text-sm text-floral">Make playlist private</span>
        </label>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>

      <form onSubmit={handlePasswordChange} className="space-y-5">
        <h2 className="font-semibold text-floral">Change password</h2>

        <div>
          <label className="block text-sm font-medium mb-1 text-floral">Current password</label>
          <PasswordInput value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-floral">New password</label>
          <PasswordInput value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={8} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Updating…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
