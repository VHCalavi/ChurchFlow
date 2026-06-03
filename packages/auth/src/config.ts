import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
          const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          const json = await res.json();

          if (json.success && json.data) {
            // Return user details to next-auth
            return {
              id: json.data.id,
              email: json.data.email,
              name: json.data.name,
              avatarUrl: json.data.avatarUrl,
              churchId: json.data.churchId,
              churchName: json.data.churchName,
              roles: json.data.roles,
              permissions: json.data.permissions
            } as any;
          }
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.churchId = user.churchId;
        token.churchName = user.churchName;
        token.roles = user.roles;
        token.permissions = user.permissions || [];
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.churchId = token.churchId;
        session.user.churchName = token.churchName;
        session.user.roles = token.roles;
        session.user.permissions = token.permissions || [];
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
} satisfies NextAuthConfig;
