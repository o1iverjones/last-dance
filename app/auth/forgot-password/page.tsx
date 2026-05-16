"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-sm mx-auto mt-16 text-center space-y-3">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-sm text-muted">
          If an account exists for <span className="text-floral">{email}</span>, we sent a reset link. It expires in 1 hour.
        </p>
        <Link href="/auth/signin" className="text-sm text-muted hover:text-tangerine transition-colors">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted mt-1">Enter your email and we'll send you a reset link.</p>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-sm text-center">
        <Link href="/auth/signin" className="text-muted hover:text-tangerine transition-colors">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
