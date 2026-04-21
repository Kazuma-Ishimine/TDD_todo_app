# backendでNo test files foundが出たときに見直したこと

## エラー

`npx vitest run` 実行時に、backend 配下でテストファイルが 0 件だったため失敗しました。

## 原因

backend の CI は「テストが存在する前提」で組まれていました。  
さらに、`test-result.json` の存在や `numTotalTests > 0` も前提になっていたため、まだテストを書いていない状態でも CI は落ちる構成でした。

## ユーザーの考え

> これ、テストがないからですよね？

この切り分けは正しく、最初の失敗原因はまさに「backend にテストが存在しないこと」でした。

## 修正

- `backend/src/index.test.ts` を追加
- `GET /` が `200` と `Hello Hono!` を返す最小テストを作成
- `backend/package.json` に `test`, `lint`, `typecheck` script を追加
- `.github/workflows/backend.yaml` のテスト実行を `npx vitest run` から `npm test` に変更

## 対策

CI が `test-result.json` やテスト件数を前提にしているなら、最小でも 1 件テストを用意しておくべきです。  
また、workflow では直接 `npx vitest run` を叩くより、`npm test` 経由にしてローカルと CI のコマンドを揃えるほうが安全です。

## ユーザーが身につけるべきこと

- CI はコードだけでなく「そのリポジトリの前提」を実行している
- `vitest run` が通ることと workflow 全体が通ることは別問題
- テスト結果ファイルを前提にした workflow では、最小テストの存在自体が重要になる
