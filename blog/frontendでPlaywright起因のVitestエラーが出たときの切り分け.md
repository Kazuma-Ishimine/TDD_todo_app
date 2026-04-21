# frontendでPlaywright起因のVitestエラーが出たときの切り分け

## エラー

frontend の `npx vitest run` 実行時に、Playwright の Chromium 実行ファイルがなくて失敗しました。

## 原因

`frontend/vite.config.ts` で Vitest の browser mode と Playwright が有効になっていました。  
そのため、通常の unit test を回したいだけでも先にブラウザ起動が必要になっていました。

## ユーザーの考え

> backend.yamlなのになぜ？ frontendの影響を受けてる？

ここで重要だったのは、`push` / `pull_request` では backend と frontend の workflow が別々に動いていることです。  
つまり backend を直しても、frontend 側の workflow は独立して失敗します。

## 修正

- `frontend/vite.config.ts` から Storybook + Playwright を使う Vitest 設定を外した
- `test.include` を `src/**/*.{test,spec}.{ts,tsx}` に限定
- `frontend/src/App.test.tsx` を追加
- `frontend/package.json` に `test`, `typecheck` script を追加
- `.github/workflows/frontend.yaml` のテスト実行を `npx vitest run` から `npm test` に変更

## 対策

unit test と browser test は分離して運用するのが安全です。  
通常の CI では unit test を回し、Playwright や Storybook の browser test は別ジョブに分けると切り分けしやすくなります。

## ユーザーが身につけるべきこと

- workflow 名と失敗ログの実行パスを見ると、どのジョブが落ちているか判断しやすい
- Vitest の失敗でも、実際の原因が Playwright や Storybook 設定にあることは普通にある
- `vite.config.ts` の test 設定は CI の挙動に直結する
