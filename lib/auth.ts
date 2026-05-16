import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.displayName,
          username: user.username,
          avatarUrl: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.username = (user as unknown as { username: string }).username;
        token.avatarUrl = (user as unknown as { avatarUrl: string | null }).avatarUrl;
      }
      // Backfill avatarUrl for existing sessions that predate this field,
      // and refresh it whenever settings are updated
      if (token.id && (token.avatarUrl === undefined || trigger === "update")) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { avatarUrl: true },
        });
        token.avatarUrl = fresh?.avatarUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: { strategy: "jwt" },
};
