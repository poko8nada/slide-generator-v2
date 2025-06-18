# 保存処理移動・疎結合feature連携 詳細実装計画

---

## 1. 概要と設計方針

- **現状課題**  
  保存処理が`edit-markdown/index.tsx`に集約されUI/状態/副作用が密結合。責務分離・再利用性・保守性が低下。
- **疎結合feature連携の採用理由**  
  保存UI・ロジックを`control-user-action`配下へ分離し、Context経由で状態連携。各featureの独立性・テスト容易性向上。
- **Context状態トリガー方式（パターン1）+補助案**  
  Contextに保存要求・状態・エラー等を集約し、feature間はprops/Contextのみで連携。多重実行防止・自動エラークリア等の補助案を組み合わせ堅牢化。

---

## 2. 実装パターンの比較

| パターン | 概要 | メリット | デメリット |
|----------|------|----------|------------|
| 1. Contextトリガー | Contextで保存要求・状態を管理 | 疎結合・拡張性・テスト容易 | 状態肥大化・多重実行リスク |
| 2. 親リフトアップ | 親で保存ロジック集中 | 状態一元管理 | 依存増・再利用性低 |
| 3. カスタムHook | useSave等でロジック共通化 | 再利用性 | UI/状態分離困難 |
| 4. Redux等外部状態 | グローバル管理 | 強力な状態制御 | オーバーエンジニアリング |

- **パターン1選定理由**  
  Next.js/Reactの設計思想・本PJ規模に最適。UI/ロジック/状態の分離と拡張性を両立。
- **補助案による弱点補強**  
  - 保存中フラグで多重実行防止
  - エラー状態は一定時間で自動クリア
  - 状態肥大化は型分割・責務分離で抑制

---

## 3. 詳細設計

### 3.1 Context拡張設計

- `src/providers/md-data-provider.tsx`に以下を追加  
  - 保存要求/状態/エラー型・state
  - 保存リクエスト関数
  - 多重実行防止（isSaving）・エラー自動クリア
- 例:  
  ```ts
  type SaveStatus = 'idle' | 'saving' | 'success' | 'error'
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const requestSave = useCallback(() => { ... }, [])
  ```

### 3.2 保存処理モジュール化設計

- `src/feature/edit-markdown/save-handler.ts`新設  
  - 保存ロジックを関数化しexport
  - Form action（62-143行目）を`handleSaveMarkdown`等に分離

### 3.3 Feature連携フロー設計

- `control-user-action`で保存UI→Contextの`requestSave`呼び出し
- Contextで状態遷移（idle→saving→success/error）
- `edit-markdown`はContextの状態を監視し、保存完了時にUI/状態更新
- エラー時はContextでエラー内容管理・自動クリア

---

## 4. 実装手順書

1. `md-data-provider.tsx`に保存状態・リクエスト関数等を追加
2. `save-handler.ts`新設、保存ロジックを関数化
3. `index.tsx`のForm actionを`save-handler.ts`へ移動・関数化
5. `control-user-action`配下に保存UI/ロジックを新設し、Context経由で連携
6. 各featureのimport/export整理
7. 動作確認・テスト（多重実行・エラー・正常系）

---

## 5. ファイル別変更内容

- **md-data-provider.tsx**  
  - Before: mdData, isDiff等のみ  
  - After: 保存状態・エラー・リクエスト関数追加、型拡張
- **edit-markdown/index.tsx**  
  - Before: 保存ロジック直書き  
  - After: 保存ロジック削除、props/Context経由に
- **edit-markdown/save-handler.ts**（新設）  
  - 保存ロジック関数化、Form action移動
- **control-user-action/index.tsx等**  
  - 保存UI/ロジック新設、Context連携
- **import/export**  
  - 保存ロジック・UIのimport先変更、内部実装はexportせずAPI最小化

---

## 6. エッジケース対応

- **多重実行防止**  
  isSavingフラグで保存中は再実行不可
- **エラー処理**  
  エラー発生時はContextで管理し、一定時間後自動クリア
- **将来拡張性**  
  状態型・関数は拡張容易な設計、feature追加時もContext経由で連携可能

---

## 7. 実装後の確認事項

- 保存・エラー・多重実行の各シナリオテスト
- パフォーマンス（保存遅延・UI応答性）確認
- 他機能（プレビュー・画像管理等）への影響有無チェック