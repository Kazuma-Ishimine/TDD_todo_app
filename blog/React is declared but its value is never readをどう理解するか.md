# React is declared but its value is never readをどう理解するか

## 対象読者

- React + TypeScript のプロジェクトで `typecheck` を回している人
- `jsx: react-jsx` の構成で古い `import React` が残っている人
- Storybook の生成ファイルをそのまま使っている人

## テーマ

`React is declared but its value is never read` を「React 非対応」ではなく「今の JSX runtime と import の書き方がずれている問題」として整理します。

## エラー概要

`npm run typecheck` 実行時に、`frontend/src/stories/Button.tsx` と `frontend/src/stories/Header.tsx` で `import React from 'react'` が未使用扱いになって失敗しました。記事内の経緯では、その後 `frontend/src/stories/Page.tsx` も同じ理由で見直しています。

## 原因

原因は React が使えないことではなく、`jsx: react-jsx` の自動 JSX runtime を使っているのに、古い `import React` が残っていたことでした。さらに `noUnusedLocals: true` が有効なため、未使用 import がそのまま型チェック失敗になります。

## 結論

### 今回の対応

- `frontend/src/stories/Button.tsx` の `import React` を削除
- `frontend/src/stories/Header.tsx` の `import React` を削除
- 同じ理由で `frontend/src/stories/Page.tsx` の `import React` も削除

### どう理解すると切り分けやすいか

- `TS6133` は「未使用変数」の系統であって、React 非対応を直接示すエラーではありません
- 新しい JSX transform では、JSX を書くためだけの `import React` は不要です
- Storybook のサンプルやテンプレート生成物は、現在の tsconfig と合わない書き方が残ることがあります

## まとめ

このエラーで先に確認したいのは、React が使えるかどうかではなく、現在の JSX runtime と import の書き方が一致しているかです。

- 自動 JSX runtime なら古い `import React` は不要
- `noUnusedLocals` が有効だと未使用 import は CI 失敗につながる
- 生成コードも今の設定に合わせて見直す価値がある
