import NextAuth, { type NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import { adapter } from "./lib/adapter"

const config: NextAuthConfig = {
  adapter,
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
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
  },
  events: {
    createUser: async ({ user }) => {
      console.log("New user created:", (user as any).email)
    },
  },
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
