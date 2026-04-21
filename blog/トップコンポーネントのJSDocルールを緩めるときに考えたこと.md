# トップコンポーネントのJSDocルールを緩めるときに考えたこと

frontend の lint を整えていく中で、今度は JSDoc の運用ルールが実装スタイルと合っていないことが問題になりました。
特に気になったのは、**props を持たないトップコンポーネントにも JSDoc を強制してしまう** ことでした。

## 何が問題だったか

`jsdoc/require-jsdoc` の設定では、関数の種類ごとに JSDoc 必須かどうかを決められます。

当初は `ArrowFunctionExpression` に対しても JSDoc を必須にしていたため、たとえば次のようなトップコンポーネントでもコメントが必要になっていました。

```tsx
export const Page = () => {
  // ...
};
```

その結果、`Header.tsx` や `Page.tsx` に「とりあえず付けた」短い JSDoc が増えていきました。

## 目指したルール

今回ほしかったのは、単純に「全部の JSDoc をなくしたい」ではなく、

- props を持たないトップコンポーネントには JSDoc を強制しない
- ルールは必要以上に壊さない

というバランスでした。

このため、`frontend/eslint.config.js` では `ArrowFunctionExpression` の JSDoc 必須だけを外しました。

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

この変更に合わせて、`Header.tsx` と `Page.tsx` に追加していた JSDoc を削除しました。

## `App.tsx` だけ残った理由

ここで少し紛らわしかったのが、`App.tsx` です。

`App` もトップコンポーネントなのに、JSDoc を消したあとも lint エラーが残りました。
理由は、`App` の定義が arrow function ではなく **FunctionDeclaration** だったからです。

```tsx
function App() {
  // ...
}
```

今回の設定では、

- `FunctionDeclaration` は JSDoc 必須
- `ArrowFunctionExpression` は JSDoc 不要

なので、`App` だけ別ルールに引っかかっていました。

## どう直したか

設定をさらに広く緩めるのではなく、`App` 側を他のトップコンポーネントと同じスタイルに揃えました。

```tsx
const App = () => {
  // ...
};
```

この修正によって、`App.tsx` も JSDoc なしでルールに沿うようになりました。

## 対策

JSDoc ルールを調整するときは、「どの名前に対してコメントを付けたいか」ではなく、**どの構文に対して強制されるか** を見るのが重要です。

今回のように React コンポーネントでも、

- `function App() {}`
- `const App = () => {}`

では ESLint 上の扱いが変わります。

そのため、ルールだけを見るのではなく、**コンポーネント定義のスタイルも揃える** と運用が安定します。

## まとめ

今回の対応では、JSDoc を単に削ったのではなく、**チームが許容したいコードスタイルに合わせて lint ルールを調整した** ことがポイントでした。

特に重要だったのは次の 2 点です。

1. JSDoc ルールは構文単位で効く
2. React コンポーネントの定義スタイルを揃えると lint 運用がシンプルになる

トップコンポーネントに毎回形式的な JSDoc を書くより、必要な場所にだけ説明を書くほうが、結果としてコードレビューのノイズも減らしやすいと感じました。
