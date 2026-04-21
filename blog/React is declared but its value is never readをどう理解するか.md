# React is declared but its value is never readをどう理解するか

## エラー

`npm run typecheck` 実行時に、`src/stories/Button.tsx` と `src/stories/Header.tsx` で `import React from 'react'` が未使用扱いになって失敗しました。

## 原因

React 非対応だったわけではなく、`jsx: react-jsx` の自動 JSX runtime を使っているのに古い `import React` が残っていたのが原因です。  
さらに `noUnusedLocals: true` により、未使用 import が CI ではエラーになっていました。

## ユーザーの考え

> これは、Reactに対応してないから？

自然な疑問ですが、実際には「React が使えない」のではなく、「React を import しなくていい構成なのに古い記述が残っていた」が正しい理解でした。

## 修正

- `frontend/src/stories/Button.tsx` の `import React` を削除
- `frontend/src/stories/Header.tsx` の `import React` を削除
- 同じ理由で次に落ちる `frontend/src/stories/Page.tsx` の `import React` も削除

## 対策

React 17+ 以降の新しい JSX transform を使う場合は、古い `import React` を残さないようにします。  
特に Storybook のサンプルコードやテンプレート生成物は古い記法のまま残っていることがあるため、型チェック前に見直す価値があります。

## ユーザーが身につけるべきこと

- `TS6133` は React 非対応ではなく未使用変数エラー
- JSX runtime の設定次第で必要な import は変わる
- 生成コードやテンプレートコードは、そのままだと今の tsconfig と合わないことがある
