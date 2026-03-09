import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

// Trim env vars to prevent trailing newline issues from Vercel dashboard
const trimEnv = (key: string) => process.env[key]?.trim();

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  secret: trimEnv("AUTH_SECRET") || trimEnv("NEXTAUTH_SECRET"),
  trustHost: true,
  providers: [
    GitHub({
      clientId: trimEnv("GITHUB_CLIENT_ID"),
      clientSecret: trimEnv("GITHUB_CLIENT_SECRET"),
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
