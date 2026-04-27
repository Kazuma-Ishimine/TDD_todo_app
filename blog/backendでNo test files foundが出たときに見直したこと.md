# backendでNo test files foundが出たときに見直したこと

## 対象読者

- backend の CI に Vitest を組み込んでいる人
- `No test files found` で止まったあと、workflow 側の前提まで見直したい人
- ローカル実行と CI 実行のコマンドを揃えたい人

## テーマ

backend の `No test files found` は、単にテストがないだけでなく、workflow が何を前提にしているかまで含めて見る必要がある、という観点で整理します。

## エラー概要

`npx vitest run` 実行時に、backend 配下でテストファイルが 0 件だったため失敗しました。加えて `.github/workflows/backend.yaml` では `backend/test-result.json` の存在と `numTotalTests > 0` も確認しているため、テスト未作成の状態では workflow 全体も通りません。

## 原因

根本原因は、backend にテストが存在しない状態で CI が「Vitest の結果ファイルが出力され、かつテスト件数が 1 件以上ある」前提になっていたことです。つまり、失敗の出発点はテスト未作成で、workflow 側の設計がその前提をさらに強めていました。

## 結論

### 今回の対応

- `backend/src/index.test.ts` を追加
- `GET /` が `200` と `Hello Hono!` を返す最小テストを作成
- `backend/package.json` に `test`, `lint`, `typecheck` script を定義
- `.github/workflows/backend.yaml` のテスト実行を `npx vitest run` から `npm test` に変更

### 見直しポイント

- workflow が `test-result.json` を読むなら、その出力を含む実行コマンドを package script に寄せたほうがずれにくいです
- ローカルでは通るが CI では落ちる、ではなく「CI は何を前提にしているか」を先に確認すると切り分けしやすくなります
- PR コメント用の集計処理がある workflow では、最小でも 1 件のテストが必要になることがあります

## まとめ

今回のケースでは、最初のエラーは `No test files found` でしたが、実際に見るべきだったのは CI 全体の前提でした。

- backend にテストが 0 件だと Vitest が失敗する
- workflow も結果ファイルとテスト件数を前提にしている
- その前提に合わせて最小テストと `npm test` を整えると、ローカルと CI を揃えやすい
