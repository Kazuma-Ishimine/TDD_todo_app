# frontendでPlaywright起因のVitestエラーが出たときの切り分け

## 対象読者

- frontend の CI で Vitest を回している人
- unit test のつもりで実行したら Playwright 側のエラーが出た人
- browser test と unit test の境界を整理したい人

## テーマ

Vitest の失敗がそのまま unit test の問題とは限らず、`vite.config.ts` の browser mode 設定まで確認する必要がある、という観点でまとめます。

## エラー概要

frontend の `npx vitest run` 実行時に、Playwright の Chromium 実行ファイルがなくて失敗しました。`frontend` の workflow は `.github/workflows/frontend.yaml` で独立しているため、backend 側を直しても frontend CI の失敗は別で残ります。

## 原因

`frontend/vite.config.ts` で Vitest の browser mode と Playwright を前提にした設定が入っていたため、通常の unit test を回したいだけでも先にブラウザ実行環境が必要になっていました。つまり、表面上は Vitest の失敗でも、根本原因はテスト実行モードの混在です。

## 結論

### 今回の対応

- `frontend/vite.config.ts` から browser mode 前提の構成を外した
- `test.include` を `src/**/*.{test,spec}.{ts,tsx}` に限定した
- `frontend/src/App.test.tsx` を追加した
- `frontend/package.json` に `test`, `typecheck` script を定義した
- `.github/workflows/frontend.yaml` のテスト実行を `npx vitest run` から `npm test` に変更した

### 見直しポイント

- unit test と browser test を同じ入口で回すと、原因の切り分けが難しくなります
- workflow 名と `working-directory` を見れば、どの job が失敗しているか判断しやすくなります
- `vite.config.ts` の `test` 設定は CI の挙動にそのまま影響します

## まとめ

今回の失敗は、Vitest 自体よりも「どのモードでテストを動かしていたか」の問題でした。

- unit test 用の設定は unit test に絞る
- browser test は別 job に分ける
- CI では `npm test` のように入口を一本化する

こうしておくと、Playwright 由来の失敗を unit test 側に持ち込みにくくなります。
