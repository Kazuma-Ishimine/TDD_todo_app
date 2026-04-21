# typescript-eslintの型情報不足エラーをどう直したか

## エラー

`npm run lint` 実行時に、`@typescript-eslint/await-thenable` が型情報を取れず失敗しました。

## 原因

`typescript-eslint` の型付きルールを使う `recommendedTypeChecked` を有効にしていた一方で、型情報取得の設定が不足していました。  
具体的には `parserOptions.projectService: true` が backend の ESLint 設定にありませんでした。

## ユーザーの考え

> typescript-eslintでエラーが起きてるね

この見立ても正しく、エラーの中心は `typescript-eslint` の型付き lint 設定でした。

## 修正

- `backend/eslint.config.mts` に `parserOptions.projectService: true` を追加
- backend 用の設定として `globals.browser` を `globals.node` に変更

## 対策

`tseslint.configs.recommendedTypeChecked` を使うなら、型情報の取得設定もセットで入れるべきです。  
「型付き lint を使うかどうか」を最初に決めて、設定を中途半端にしないことが重要です。

## ユーザーが身につけるべきこと

- `recommended` と `recommendedTypeChecked` は必要条件が違う
- `typescript-eslint` のエラーはルール自体より設定不足が原因のことが多い
- backend / frontend の globals は実行環境に合わせて分けるべき
