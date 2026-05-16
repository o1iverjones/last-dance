"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="max-w-sm mx-auto mt-16 text-center space-y-3">
        <p className="text-red-400 font-medium">Invalid reset link.</p>
        <Link href="/auth/forgot-password" className="text-sm text-muted hover:text-tangerine transition-colors">
          Request a new one
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/auth/signin?reset=1");
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-6">
      <h1 className="text-2xl font-bold">Set new password</h1>

      {error && (
        <p className="text-sm text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">New password</label>
          <PasswordInput required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm password</label>
          <PasswordInput required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
