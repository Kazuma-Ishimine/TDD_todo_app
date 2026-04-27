# トップコンポーネントのJSDocルールを緩めるときに考えたこと

## 対象読者

- React コンポーネントに対する JSDoc ルールを調整したい人
- `eslint-plugin-jsdoc` の `require-jsdoc` を構文単位で見直したい人
- 形式的なコメントを増やさず lint 運用を整えたい人

## テーマ

「JSDoc を消すか残すか」ではなく、「どの構文に対して JSDoc を強制するか」を見直した技術的な判断として整理します。

## この記事で扱うこと / 扱わないこと

### 扱うこと

- `frontend/eslint.config.js` の `jsdoc/require-jsdoc` 設定
- トップコンポーネントに形式的な JSDoc が増えた理由
- ルール変更とコンポーネント定義スタイルの調整

### 扱わないこと

- JSDoc 全廃の是非
- props や公開 API の説明まで不要にする話

## 問題背景

frontend の lint を整える中で、props を持たないトップコンポーネントにも JSDoc が必要になっていました。たとえば `Header.tsx` や `Page.tsx` のようなコンポーネントに、ルールを満たすためだけの短いコメントが付きやすい状態でした。

## 原因または制約

`jsdoc/require-jsdoc` は「React コンポーネントかどうか」ではなく「どの構文か」で判定します。当初は `ArrowFunctionExpression` にも JSDoc を必須にしていたため、次のようなトップコンポーネントでもコメントが必要でした。

```tsx
export const Page = () => {
  // ...
};
```

一方で、`FunctionDeclaration` は別の構文として扱われます。そのため、同じトップコンポーネントでも定義スタイル次第で lint 結果が変わる制約がありました。

## 解決策

`frontend/eslint.config.js` では `ArrowFunctionExpression` の JSDoc 必須だけを外しました。

```js
"jsdoc/require-jsdoc": [
  "error",
  {
    publicOnly: true,
    require: {
      FunctionDeclaration: true,
      MethodDefinition: true,
      ClassDeclaration: true,
      ArrowFunctionExpression: false,
    },
  },
]
```

## 実装の要点

- `Header.tsx` と `Page.tsx` に追加していた JSDoc を削除
- `App.tsx` は `FunctionDeclaration` だったため、JSDoc を消すだけでは lint が残る
- そこで `App` を arrow function に寄せて、他のトップコンポーネントと同じ扱いにした

この対応で、ルールを必要以上に緩めずに、props を持たないトップコンポーネントだけ形式的な JSDoc から外せました。

## 気をつけたいこと

- JSDoc ルールは名前ではなく構文に対して効きます
- `function App() {}` と `const App = () => {}` では lint 上の扱いが変わります
- ルール調整だけでなく、コンポーネント定義スタイルも揃えると運用が安定します

## まとめ

今回のポイントは、JSDoc を全面的に外すことではなく、チームが許容したいコードスタイルに合わせて強制対象を絞ったことでした。

- `ArrowFunctionExpression` の必須だけ外す
- `FunctionDeclaration` は引き続き対象にする
- 必要ならコンポーネント側の定義スタイルも合わせる

こうしておくと、説明が必要な場所にはルールを残しつつ、形式的なコメントだけが増える状態を避けやすくなります。
