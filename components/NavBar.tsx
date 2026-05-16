"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-panel border-b border-charcoal">
      <div className="max-w-3xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-tangerine font-bold tracking-tight" style={{ fontSize: "2.5rem" }}>
          Last Dance
        </Link>

        <div className="flex items-center gap-4">
          {status === "loading" ? null : session ? (
            <>
              <Link
                href={`/u/${session.user.username}`}
                className="flex items-center gap-2 hover:text-tangerine transition-colors"
              >
                {session.user.avatarUrl ? (
                  <Image
                    src={session.user.avatarUrl}
                    alt={session.user.username}
                    width={28}
                    height={28}
                    className="rounded-full object-cover w-7 h-7 flex-shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-charcoal flex items-center justify-center flex-shrink-0 text-xs font-bold text-floral">
                    {session.user.username[0].toUpperCase()}
                  </div>
                )}
                <span className="text-floral" style={{ fontWeight: 550, fontSize: "1rem" }}>
                  {session.user.username}
                </span>
              </Link>
              <Link href="/settings" className="text-sm text-muted hover:text-floral transition-colors">
                Settings
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-sm text-muted hover:text-floral transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="text-sm text-floral hover:text-tangerine transition-colors">
                Sign in
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
