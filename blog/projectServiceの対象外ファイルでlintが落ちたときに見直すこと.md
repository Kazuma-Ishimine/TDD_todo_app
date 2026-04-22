# projectServiceの対象外ファイルでlintが落ちたときに見直すこと

## 対象読者

- `typescript-eslint` の typed lint を有効にしている人
- `projectService` 系の parsing error が設定ファイルや E2E ファイルで出た人
- ESLint と tsconfig の担当範囲を揃えたい人

## テーマ

`projectService` のエラーを「個別ファイルの型エラー」ではなく「ESLint と tsconfig の管理範囲のずれ」として切り分ける記事です。

## この記事で扱うこと / 扱わないこと

### 扱うこと

- `frontend/eslint.config.js` の typed lint 設定
- `frontend/tsconfig.node.json` の `include` 範囲
- `.storybook/` や `e2e/` のような周辺ファイルで lint が落ちる理由

### 扱わないこと

- 各ファイルの個別ロジックの正しさ
- `eslint-plugin-import` の詳細設定全般

## 問題背景

frontend の lint 実行時に、アプリ本体ではなく周辺の TypeScript ファイルで parsing error がまとまって出ました。対象になっていたのは次のようなファイルです。

- `.storybook/main.ts`
- `.storybook/preview.ts`
- `e2e/example.spec.ts`
- `playwright.config.ts`
- `vitest.shims.d.ts`

エラーメッセージは `was not found by the project service` でした。

## 原因または制約

`frontend/eslint.config.js` では `parserOptions.projectService: true` を使って typed lint を有効にしています。一方で、`frontend/tsconfig.node.json` の `include` が狭い状態だと、ESLint は型情報つきで見たいのに tsconfig 側がそのファイルを管理していない、というずれが起きます。

このずれがあると、コード内容ではなく「型情報の参照先がない」こと自体で parsing error になります。

## 解決策

`frontend/tsconfig.node.json` の `include` を広げて、typed lint の対象になっている周辺ファイルも tsconfig 管理下に入れました。

```json
"include": [
  "vite.config.ts",
  "playwright.config.ts",
  "vitest.shims.d.ts",
  ".storybook/**/*.ts",
  "e2e/**/*.ts"
]
```

## 実装の要点

- ESLint 側では `projectService: true` を維持する
- tsconfig 側で設定ファイルや E2E ファイルを `include` に追加する
- `projectService` が見る範囲と tsconfig が責任を持つ範囲を一致させる

途中では `typescript with invalid interface loaded as resolver` も出ていたため resolver 側を疑いやすい状況でしたが、今回の主因は import 解決ではなく型情報の解決範囲でした。

## 気をつけたいこと

- typed lint を入れるなら、アプリコード以外の TS ファイルも対象にするか最初に決めておくと安定します
- 次のようなファイルは漏れやすいです
  - `vite.config.ts`
  - `playwright.config.ts`
  - `.storybook/**/*.ts`
  - `e2e/**/*.ts`
  - `*.d.ts`
- ESLint が拾うなら、tsconfig の `include` でも拾えているかを確認する必要があります

## まとめ

`projectService` の parsing error では、コードの中身より先に設定の責任範囲を確認するのが有効でした。

- ESLint が見るファイル
- tsconfig が管理するファイル

この 2 つがずれていると、周辺ファイルで lint がまとめて落ちやすくなります。
