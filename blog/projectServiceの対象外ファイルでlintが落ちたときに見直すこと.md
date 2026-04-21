# projectServiceの対象外ファイルでlintが落ちたときに見直すこと

frontend の lint を通そうとしたとき、アプリ本体ではなく周辺の TypeScript ファイルで大量の parsing error が出ました。
今回の原因は、`typescript-eslint` の typed lint と `tsconfig` の管理範囲が噛み合っていなかったことでした。

## どんなエラーが出たか

今回出たのは、次のようなエラーです。

> was not found by the project service

対象になっていたのは次のファイルでした。

- `.storybook/main.ts`
- `.storybook/preview.ts`
- `e2e/example.spec.ts`
- `playwright.config.ts`
- `vitest.shims.d.ts`

最初はファイルごとの型エラーに見えますが、実際には個別のコード不備ではなく **typed lint がそのファイルを tsconfig 管理下で見つけられていない** のが本質でした。

## 原因

`frontend/eslint.config.js` では `parserOptions.projectService: true` を使っていて、typed lint を有効にしています。

一方で `frontend/tsconfig.node.json` の `include` は当初かなり狭く、`vite.config.ts` しか対象にしていませんでした。

そのため ESLint は次の 2 つの事実を同時に持っている状態でした。

1. 型情報つきで lint したい
2. でもそのファイルが tsconfig には含まれていない

このズレが、`projectService` 系の parsing error につながっていました。

## 修正

`frontend/tsconfig.node.json` の `include` を広げて、設定ファイルや周辺の TS ファイルも typed lint の対象に入れました。

```json
"include": [
  "vite.config.ts",
  "playwright.config.ts",
  "vitest.shims.d.ts",
  ".storybook/**/*.ts",
  "e2e/**/*.ts"
]
```

これで `projectService` が参照しようとするファイル群と、tsconfig が管理している範囲が一致するようになりました。

## 途中で紛らわしかったこと

この流れの途中では、`eslint-plugin-import` 側の resolver も疑いたくなります。
実際に `typescript with invalid interface loaded as resolver` というメッセージも出ていたため、最初は resolver 不足が本命に見えました。

ただ、最終的に重要だったのは resolver 以前に **typed lint の対象ファイルが tsconfig に入っているか** でした。

つまり今回の主因は「import の解決」ではなく、「型情報の解決範囲」だったわけです。

## 対策

typed lint を使うときは、**アプリコードだけでなく設定ファイルや周辺ファイルも lint 対象に含めるかどうか** を最初に決めておくと安定します。

特に次のようなファイルは漏れやすいです。

- `vite.config.ts`
- `playwright.config.ts`
- `.storybook/**/*.ts`
- `e2e/**/*.ts`
- `*.d.ts`

ESLint で拾うなら、tsconfig の `include` にも入っているかを必ず確認したほうがよいです。

## まとめ

`projectService` のエラーは、コードの中身よりも **ESLint と tsconfig の管理範囲のズレ** を疑うべきケースが多いです。

今回の学びはシンプルで、typed lint を使うなら

1. ESLint が見るファイル
2. tsconfig が管理するファイル

この 2 つを揃えることが大前提、ということでした。
