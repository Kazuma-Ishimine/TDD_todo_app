# testingLibrary is not definedがeslint.config.jsで出たときの原因

## 対象読者

- ESLint Flat Config で testing-library の設定を追加している人
- `eslint.config.js` の未定義変数で lint 自体が起動しない人
- plugin の import と config 参照をセットで確認したい人

## テーマ

`...plugin.configs[...]` だけを書いて plugin 本体の import を忘れると、設定ファイルも普通の JavaScript と同じように落ちる、という点を整理します。

## エラー概要

`npm run lint` 実行時に、frontend の `eslint.config.js` で `ReferenceError: testingLibrary is not defined` が発生しました。

## 原因

`eslint.config.js` のテスト用設定で `...testingLibrary.configs["flat/react"]` を使っていた一方で、`testingLibrary` 自体の import がありませんでした。設定参照だけが先に存在し、変数定義が追いついていない状態です。

## 結論

### 今回の対応

- `frontend/eslint.config.js` に `import testingLibrary from "eslint-plugin-testing-library";` を追加
- 既存の `...testingLibrary.configs["flat/react"]` とつながる形にした

### 見直しポイント

- ESLint 設定ファイルも通常の JavaScript と同じく、未定義変数を参照すると実行時に失敗します
- `...plugin.configs[...]` を使うなら、その plugin の import も必要です
- 設定変更では「どこで使うか」と「どこで読み込むか」をセットで確認すると切り分けしやすくなります

## まとめ

今回のエラーは testing-library の設定内容ではなく、参照している変数を import していないことが原因でした。

- config 参照だけでは足りない
- plugin 本体の import が必要
- `eslint.config.js` も実行コードとして確認する
