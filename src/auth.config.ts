import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.walletAddress = user.walletAddress;
      }
      if (trigger === "update" && session?.walletAddress) {
        token.walletAddress = session.walletAddress;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.walletAddress = token.walletAddress as string;
      }
      return session;
    }
  },
  providers: [], // Added in auth.ts which runs in Node
} satisfies NextAuthConfig;
