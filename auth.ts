import NextAuth from "next-auth"
import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  // Rimuoviamo temporaneamente l'adapter per testare il login JWT puro
  // adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      checks: ["none"],
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          redirect_uri: "https://videopreprod-ai.vercel.app/api/auth/callback/google"
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      console.log("[NextAuth] SignIn callback:", { user: user?.email, provider: account?.provider })
      return true
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        token.id = user.id
        token.role = (user as any).role || "USER"
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    redirect: ({ url, baseUrl }) => {
      const canonicalUrl = "https://videopreprod-ai.vercel.app"
      
      if (url.startsWith("http") && !url.startsWith(canonicalUrl)) {
        url = url.replace(/^https?:\/\/[^\/]+/, "")
      }
      
      if (url === "/login" || url === "/auth/error") {
        return `${canonicalUrl}/dashboard`
      }
      if (url.startsWith("/")) return `${canonicalUrl}${url}`
      if (url.startsWith(canonicalUrl)) return url
      return `${canonicalUrl}/dashboard`
    },
  },
  events: {
    createUser: async ({ user }) => {
      console.log("New user created:", (user as any).email)
    },
  },
}

// Export auth function for API routes compatibility
export async function auth() {
  return getServerSession(authOptions)
}

export default NextAuth(authOptions)
