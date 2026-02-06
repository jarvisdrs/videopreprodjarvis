import NextAuth from "next-auth"
import { getServerSession } from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./lib/prisma"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
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
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    signIn: async ({ user, account, profile }) => {
      console.log("[NextAuth] SignIn callback:", { user: user?.email, provider: account?.provider })
      return true
    },
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: (user as any).role,
      },
    }),
    redirect: ({ url, baseUrl }) => {
      // Ignora baseUrl dalla richiesta, usa sempre il canonical
      const canonicalUrl = "https://videopreprod-ai.vercel.app"
      
      // Se è un URL assoluto esterno, convertilo in relativo
      if (url.startsWith("http") && !url.startsWith(canonicalUrl)) {
        url = url.replace(/^https?:\/\/[^\/]+/, "")
      }
      
      // Dopo login vai sempre alla dashboard
      if (url === "/login" || url === "/auth/error") {
        return `${canonicalUrl}/dashboard`
      }
      // Se l'URL è relativo, usa canonicalUrl
      if (url.startsWith("/")) return `${canonicalUrl}${url}`
      // Se l'URL è già sul dominio canonico, consentilo
      if (url.startsWith(canonicalUrl)) return url
      // Fallback alla dashboard
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
