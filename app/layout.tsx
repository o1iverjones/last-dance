import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Last Dance",
  description: "Share your music taste with the world.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-ink text-floral min-h-screen">
        <SessionProvider>
          <NavBar />
          <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
