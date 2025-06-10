import type { NextAuthConfig } from 'next-auth'
import type { JWT, DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'

// Session を拡張
declare module 'next-auth' {
  interface Session {
    idToken: string
    user?: DefaultSession['user'] & {
      isPro?: boolean
    }
  }
}

// JWT を拡張
declare module 'next-auth' {
  interface JWT {
    idToken: string
    isPro?: boolean
  }
}

export default {
  providers: [Google],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }
      if (user && account?.id_token) {
        token.idToken = account?.id_token
      }
      if (user && 'isPro' in user) {
        token.isPro = user.isPro
      }
      return token
    },
    async session({ token, session }) {
      session.idToken = (token as unknown as JWT).idToken
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      if (session.user && 'isPro' in token) {
        session.user.isPro = Boolean(token.isPro)
      }
      return session
    },
  },
} satisfies NextAuthConfig
