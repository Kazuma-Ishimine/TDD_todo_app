# typescript-eslintの型情報不足エラーをどう直したか

## 対象読者

- backend で `typescript-eslint` の型付きルールを使っている人
- `recommendedTypeChecked` を有効にしたあとに lint が落ちた人
- 型情報取得の設定漏れを見直したい人

## テーマ

`typescript-eslint` の型付きルールは、ルール追加だけでは動かず、型情報を取る設定までセットで必要になる、という観点で整理します。

## エラー概要

`npm run lint` 実行時に、`@typescript-eslint/await-thenable` が型情報を取れず失敗しました。

## 原因

`backend/eslint.config.mts` では `tseslint.configs.recommendedTypeChecked` を使っている一方で、型情報取得に必要な `parserOptions.projectService: true` が不足していると、型付きルールは動けません。今回のエラーの中心は、ルール自体ではなくその前提設定でした。

## 結論

### 今回の対応

- `backend/eslint.config.mts` に `parserOptions.projectService: true` を追加
- backend 用の globals を `globals.browser` から `globals.node` に変更

### 見直しポイント

- `recommended` と `recommendedTypeChecked` では必要条件が違います
- 型付きルールを入れるなら、型情報の取得方法も同じタイミングで設定する必要があります
- backend / frontend で実行環境が違うなら、globals も分けておくほうが自然です

## まとめ

`typescript-eslint` のエラーでは、ルールの不具合より設定不足を疑うほうが早い場合があります。

- `recommendedTypeChecked` を使う
- `projectService: true` も入れる
- 実行環境に合わせて globals を調整する

この 3 つをセットで見ると切り分けしやすくなります。
