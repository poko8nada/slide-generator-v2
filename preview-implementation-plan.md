# スライド共有機能 実装計画案

## 概要
セキュアなトークンベースの共有システムにより、時間制限付きでスライドを外部に共有できる機能を実装する。

## 機能フロー

### 1. 共有URL生成から閲覧まで
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   作成者        │    │   システム      │    │   閲覧者        │
│                 │    │                 │    │                 │
│ 1. 共有ボタン   │───▶│ 2. トークン生成  │───▶│ 4. URL訪問      │
│    クリック     │    │   + DB保存      │    │   /share/[token]│
│                 │    │   + 有効期限設定│    │                 │
│ 3. URL取得      │◀───│                 │    │ 5. トークン検証  │
│                 │    │ 6. レンダリング  │◀───│   + DB突合     │
│                 │    │   (新Reveal.js  │    │                 │
│                 │    │    インスタンス)│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. 自動期限管理
- **アクセス時チェック**: URL訪問時に有効期限を確認
- **期限切れ時削除**: 期限切れのDBレコードをその場で削除
- **エラーハンドリング**: 無効/期限切れトークンの適切な処理

## 技術設計

### 1. データベース設計
```sql
CREATE TABLE share_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,    -- UUID v4
  user_id INTEGER REFERENCES users(id),
  md_data_id INTEGER REFERENCES md_data(id),
  md_data_snapshot TEXT NOT NULL,        -- 共有時点のmarkdownデータ
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_share_tokens_token ON share_tokens(token);
CREATE INDEX idx_share_tokens_expires_at ON share_tokens(expires_at);
```

### 2. サーバーアクション設計
```typescript
// actions/share-actions.ts
// トークン生成と有効期限設定
export async function createShareToken(
  mdDataId: number, 
  expiresInHours: number = 24
): Promise<{ token: string; shareUrl: string; expiresAt: Date }>

// app/share/[token]/page.tsx
// サーバーコンポーネントで直接DB照会
async function getSharedSlide(token: string) {
  // トークン検証 + 期限切れチェック → 切れてたら削除
}
```

### 3. Reveal.js 関数の共通化
`useReveal.ts`から以下の関数を`lib/reveal-utils.ts`に移動:
- `getSlides()` - Markdownをスライドに分割
- `setSlides()` - スライドをHTMLに変換・設定  
- `prepareSlidesForMeasurement()` - 測定用の準備処理
- `fixImageHeight()` - 画像高さの調整
- `updateSlides()` - Reveal.jsの同期・更新
## ディレクトリ構造

### 新規作成ファイル
```
src/
├── app/
│   └── share/
│       └── [token]/
│           └── page.tsx              # 共有ページ（サーバーコンポーネント）
├── feature/
│   └── share-slide/
│       ├── index.tsx                # 共有機能のメインコンポーネント
│       ├── useShareSlide.ts         # 共有フック（サーバーアクション呼び出し）
│       └── ShareSlideViewer.tsx     # 共有用スライドビューア
│       └── share-actions.ts             # サーバーアクション（トークン生成）
├── lib/
│   └── reveal-utils.ts              # useRevealから移動した共通関数
└── db/
    └── schema.ts                    # 共有トークンのスキーマ定義を追加
```

### 既存ファイルの変更
- `src/feature/display-slide/useReveal.ts` - 共通関数を`lib/reveal-utils.ts`に移動
- `src/feature/display-slide/index.tsx` - `reveal-utils.ts`をインポート
- `src/db/schema.ts` - `share_tokens`テーブル追加

## 実装ステップ

### Phase 1: 基盤構築
1. **共通関数の抽出**: `useReveal.ts` → `lib/reveal-utils.ts`
2. **データベース設計**: `share_tokens` テーブル作成
3. **サーバーアクション設計**: `share-actions.ts`

### Phase 2: feature/share-slide 実装
1. **useShareSlide**: サーバーアクション呼び出しフック
2. **ShareSlideViewer**: 共有用Reveal.jsビューア
3. **共有ボタン**: 既存UIへの統合

### Phase 3: app/share/[token] 実装
1. **共有ページ**: サーバーコンポーネントでの直接DB照会
2. **トークン検証**: 有効期限チェック・削除
3. **エラーハンドリング**: 無効トークンの処理（notFound()使用）

### Phase 4: display-slide リファクタ
1. **useReveal更新**: `reveal-utils.ts`の関数を使用
2. **既存機能確認**: リファクタ後の動作確認
3. **テスト**: 既存・新規機能のテスト
## 実装詳細

### 1. lib/reveal-utils.ts（useRevealから抽出）
```typescript
import hljs from 'highlight.js'
import type { RefObject } from 'react'
import type Reveal from 'reveal.js'
import markdownToHtml from '@/lib/parse'

// useReveal.tsから移動
export async function getSlides(md: string): Promise<string[]> {
  const slides = md
    .split(/(?<=\r?\n|^)---(?=\r?\n|$)/)
    .map(content => content.trim())

  const htmlSlides = Promise.all(
    slides.map(async slide => {
      return await markdownToHtml(slide)
    }),
  )
  return slides.length > 0 ? htmlSlides : Promise.resolve([''])
}

export function setSlides(
  slides: string[],
  slidesRef: RefObject<HTMLDivElement | null>,
  revealRef: RefObject<Reveal.Api | null>,
  activeSlideIndex: number,
): void {
  // 既存のuseReveal.tsと同じ実装
}

export function prepareSlidesForMeasurement(
  slidesRef: RefObject<HTMLDivElement | null>,
): void {
  // 既存のuseReveal.tsと同じ実装
}

export function fixImageHeight(
  slidesRef: RefObject<HTMLDivElement | null>,
  styleRef: RefObject<HTMLStyleElement | null>,
): void {
  // 既存のuseReveal.tsと同じ実装
}

export function updateSlides(
  activeSlideIndex: number,
  revealRef: RefObject<Reveal.Api | null>,
): void {
  // 既存のuseReveal.tsと同じ実装
}
```

### 2. feature/share-slide/ShareSlideViewer.tsx
```typescript
import { useRef, useEffect, useState } from 'react'
import type Reveal from 'reveal.js'
import { getSlides, setSlides, prepareSlidesForMeasurement, fixImageHeight, updateSlides } from '@/lib/reveal-utils'

export function ShareSlideViewer({ 
  mdData, 
  initialSlideIndex = 0 
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const slidesRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<Reveal.Api | null>(null)
  const styleRef = useRef<HTMLStyleElement | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      if (!containerRef.current) return

      const Reveal = (await import('reveal.js')).default
      revealRef.current = new Reveal(containerRef.current, {
        embedded: false,        // フルスクリーン
        autoSlide: false,
        transition: 'slide',
        keyboard: true,
        controls: true,
        progress: true,
        hash: true,
        respondToHashChanges: true,
      })

      const slides = await getSlides(mdData)
      setSlides(slides, slidesRef, revealRef, 0)
      await revealRef.current.initialize()
      prepareSlidesForMeasurement(slidesRef)
      fixImageHeight(slidesRef, styleRef)
      updateSlides(initialSlideIndex, revealRef)
      setLoading(false)
    }

    init()

    return () => {
      if (revealRef.current) {
        revealRef.current.destroy()
        revealRef.current = null
      }
    }
  }, [mdData, initialSlideIndex])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="h-screen w-screen">
      <div ref={containerRef} className="reveal">
        <div ref={slidesRef} className="slides" />
      </div>
    </div>
  )
}
```

### 3. app/share/[token]/page.tsx
```typescript
import { ShareSlideViewer } from '@/feature/share-slide/ShareSlideViewer'
import { notFound } from 'next/navigation'
import { db } from '@/db'
import { shareTokens } from '@/db/schema'
import { eq, and, gt } from 'drizzle-orm'

async function getSharedSlide(token: string) {
  const now = new Date()
  
  // トークン検証（有効期限もチェック）
  const shareToken = await db.query.shareTokens.findFirst({
    where: and(
      eq(shareTokens.token, token),
      eq(shareTokens.isActive, true),
      gt(shareTokens.expiresAt, now)
    )
  })

  if (!shareToken) {
    // 期限切れレコードを削除
    await db.delete(shareTokens).where(
      and(
        eq(shareTokens.token, token),
        eq(shareTokens.isActive, true)
      )
    )
    return null
  }

  return {
    mdData: shareToken.mdDataSnapshot,
    createdAt: shareToken.createdAt,
    expiresAt: shareToken.expiresAt,
  }
}

export default async function SharePage({ 
  params: { token } 
}: { 
  params: { token: string } 
}) {
  const sharedSlide = await getSharedSlide(token)
  
  if (!sharedSlide) {
    notFound()
  }

  return (
    <ShareSlideViewer 
      mdData={sharedSlide.mdData} 
      initialSlideIndex={0} 
    />
  )
}
```

### 4. actions/share-actions.ts
```typescript
'use server'

import { v4 as uuidv4 } from 'uuid'
import { db } from '@/db'
import { shareTokens, mdData } from '@/db/schema'
import { auth } from '@/auth'
import { eq } from 'drizzle-orm'

export async function createShareToken(
  mdDataId: number, 
  expiresInHours: number = 24
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // mdDataを取得
  const mdDataRecord = await db.query.mdData.findFirst({
    where: eq(mdData.id, mdDataId)
  })
  
  if (!mdDataRecord) {
    throw new Error('Data not found')
  }

  const token = uuidv4()
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000)

  await db.insert(shareTokens).values({
    token,
    userId: session.user.id,
    mdDataId,
    mdDataSnapshot: mdDataRecord.content,
    expiresAt,
  })

  return {
    token,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`,
    expiresAt,
  }
```

### 5. feature/share-slide/useShareSlide.ts
```typescript
import { useState } from 'react'
import { createShareToken } from '@/actions/share-actions'

export function useShareSlide() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createShare = async (mdDataId: number, expiresInHours: number = 24) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await createShareToken(mdDataId, expiresInHours)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    createShare,
    isLoading,
    error,
  }
}
      )
    )
    
    return NextResponse.json({ error: 'Token not found or expired' }, { status: 404 })
  }

  return NextResponse.json({
    mdData: shareToken.mdDataSnapshot,
    createdAt: shareToken.createdAt,
    expiresAt: shareToken.expiresAt,
  })
}
```

## セキュリティ・パフォーマンス考慮事項

### 1. セキュリティ
- **UUID v4使用**: 推測困難なトークン生成
- **有効期限管理**: 自動的な期限切れレコード削除
- **XSS防止**: マークダウンのサニタイズ（既存のparse関数活用）
- **認証**: トークン作成時のユーザー認証

### 2. パフォーマンス
- **インスタンス分離**: 共有用の新しいReveal.jsインスタンス
- **メモリ管理**: Reveal.jsの適切な初期化・破棄
- **画像最適化**: 既存の`fixImageHeight`を活用

### 3. データ管理
- **スナップショット**: 共有時点でのmarkdownを固定保存
- **自動クリーンアップ**: 期限切れトークンの削除

## 完了条件
- [ ] `lib/reveal-utils.ts`への関数抽出完了
- [ ] `actions/share-actions.ts`のサーバーアクション実装完了
- [ ] `feature/share-slide`ディレクトリの実装完了
- [ ] `app/share/[token]`ページ（サーバーコンポーネント）の実装完了  
- [ ] 既存`display-slide`のリファクタ完了
- [ ] 有効期限チェック・削除機能の動作確認
- [ ] 新しいReveal.jsインスタンスの動作確認
- [ ] サーバーアクションのエラーハンドリング確認
- [ ] セキュリティテストの実施

## サーバーアクションのメリット
- **型安全性**: フロントエンドとバックエンド間の型推論
- **パフォーマンス**: APIルートを経由しない直接DB接続
- **シンプルさ**: フェッチ処理・JSON変換が不要
- **一貫性**: Next.js App Routerのベストプラクティス

---

**作成日**: 2025年6月20日  
**最終更新**: 2025年6月20日
