"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/auth/signin?registered=1");
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>

      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Display name</label>
          <input type="text" required value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input type="text" required placeholder="lowercase, numbers, underscores" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <PasswordInput required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted text-center">
        Already have an account?{" "}
        <Link href="/auth/signin" className="text-floral hover:text-tangerine transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
