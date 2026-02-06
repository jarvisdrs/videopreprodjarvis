import NextAuth from "next-auth"
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
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        role: (user as any).role,
      },
    }),
    redirect: ({ url, baseUrl }) => {
      // Se l'URL è relativo, usa baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Se l'URL è sullo stesso dominio, consentilo
      if (url.startsWith(baseUrl)) return url
      // Altrimenti reindirizza alla dashboard di default
      return `${baseUrl}/dashboard`
    },
  },
  events: {
    createUser: async ({ user }) => {
      console.log("New user created:", (user as any).email)
    },
  },
}

export default NextAuth(authOptions)
