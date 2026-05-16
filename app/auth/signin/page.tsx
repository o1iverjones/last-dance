"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const registered = params.get("registered") === "1";
  const reset = params.get("reset") === "1";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>

      {registered && (
        <p className="mb-4 text-sm text-green-400 bg-green-950 border border-green-800 rounded px-3 py-2">
          Account created — sign in to continue.
        </p>
      )}
      {reset && (
        <p className="mb-4 text-sm text-green-400 bg-green-950 border border-green-800 rounded px-3 py-2">
          Password updated — sign in with your new password.
        </p>
      )}
      {error && (
        <p className="mb-4 text-sm text-red-400 bg-red-950 border border-red-800 rounded px-3 py-2">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-floral">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-floral">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-muted hover:text-tangerine transition-colors">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted text-center">
        No account?{" "}
        <Link href="/auth/signup" className="text-floral hover:text-tangerine transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
