# require is not defined in ES module scopeをeslint設定で踏んだときの整理

## 対象読者

- `"type": "module"` のプロジェクトで ESLint Flat Config を使っている人
- `eslint.config.js` で `require is not defined in ES module scope` を見た人
- 設定ファイルも ESM として扱う必要があるか確認したい人

## テーマ

ESM プロジェクトでは、アプリ本体だけでなく `eslint.config.js` も module system の影響を受ける、という一点に絞って整理します。

## エラー概要

`npm run lint` 実行時に、frontend の `eslint.config.js` で `ReferenceError: require is not defined in ES module scope` が発生しました。

## 原因

`frontend/package.json` には `"type": "module"` があるため、`eslint.config.js` は ESM として評価されます。その状態で `const jsxA11y = require("eslint-plugin-jsx-a11y");` のような CommonJS の `require` を使っていたため、ES module scope では未定義として失敗しました。

## 結論

### 今回の対応

- `frontend/eslint.config.js` の `const jsxA11y = require("eslint-plugin-jsx-a11y");` を削除
- 代わりに `import jsxA11y from "eslint-plugin-jsx-a11y";` を追加

### 見直しポイント

- `.js` ファイルでも `"type": "module"` があると ESM として扱われます
- 設定ファイルだけ CommonJS の書き方が残っていないか確認すると、初回の lint 失敗を減らせます
- Flat Config は通常の JavaScript と同じく実行時評価されるため、module system の不一致がそのまま実行エラーになります

## まとめ

このエラーでは、ESLint 本体より先に `package.json` の `"type"` と設定ファイルの書き方を確認するのが近道でした。

- ESM プロジェクトでは `require` ではなく `import`
- 設定ファイルもアプリ本体と同じ module system の影響を受ける
- `eslint.config.js` も実行コードとして扱って切り分ける
