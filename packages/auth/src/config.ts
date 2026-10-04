import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const apiUrl =
            process.env.API_URL_INTERNAL ||
            process.env.NEXT_PUBLIC_API_URL ||
            "http://localhost:3000";

          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            cache: "no-store",
          });

          const json = await res.json();

          if (!json.success || !json.data) return null;

          const d = json.data;
          return {
            id: d.id,
            email: d.email,
            name: d.name,
            image: d.avatarUrl ?? null,
            churchId: d.churchId,
            churchName: d.churchName,
            roles: Array.isArray(d.roles) ? d.roles : [],
            permissions: Array.isArray(d.permissions) ? d.permissions : [],
          };
        } catch (error) {
          console.error("[AUTH] authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.churchId = user.churchId;
        token.churchName = user.churchName;
        token.roles = user.roles ?? [];
        token.permissions = user.permissions ?? [];
      }

      if (trigger === "update" && session) {
        if (Array.isArray(session.roles)) {
          token.roles = session.roles;
        }
        if (Array.isArray(session.permissions)) {
          token.permissions = session.permissions;
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.churchId = token.churchId ?? null;
        session.user.churchName = token.churchName ?? null;
        session.user.roles = token.roles ?? [];
        session.user.permissions = token.permissions ?? [];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
