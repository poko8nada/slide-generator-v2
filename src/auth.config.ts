import type { NextAuthConfig } from 'next-auth'
import type { JWT, DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
import { getCachedImage, cacheImage } from './lib/image-cache'

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
      const cachedImage = getCachedImage(session.user.id)
      if (cachedImage) {
        // キャッシュがあればそれを使用
        session.user.image = cachedImage
      } else {
        // キャッシュがない場合
        const originalImage = session.user.image

        // フォールバック画像を即座に設定
        session.user.image = `/api/avatar?name=${encodeURIComponent(session.user.name ?? '')}`

        // バックグラウンドで元画像をキャッシュ（非同期、await しない）
        if (originalImage && typeof session.user.id === 'string') {
          cacheImage(originalImage, session.user.id)
            .then(cached => {
              // 次回のセッション更新時に反映される
              if (cached) {
                console.log('Image cached for next session')
              }
            })
            .catch(console.error)
        }
      }
      return session
    },
  },
} satisfies NextAuthConfig
