# backend.rules準拠でバックエンドを組み直し、TDD・レビュー・Copilot運用までつなぎ直した話

## 対象読者

- TypeScript + Hono でバックエンドを書いている人
- Clean Architecture を「図」ではなく「ファイル配置と責務」で整えたい人
- TDD、コードレビュー、CI、記事化までをひとつの開発フローとして回したい人
- GitHub Copilot CLI 用のカスタムエージェント運用に興味がある人

## この記事で扱う範囲 / 扱わない範囲

### 扱う範囲

- `.github/rules/backend.rules.md` を基準に、バックエンド実装がどう再編されたか
- 現在の `backend/src/` の層構造と責務分離
- テスト、レビュー、CI、PR コメント出力までの流れ
- `ArticleWriterAgent` / `WorkSummaryAgent` / `OrchestratorAgent` など周辺運用の整備

### 扱わない範囲

- MySQL 実接続や ORM 導入
- 認証・認可
- OpenAPI の詳細生成手順
- Git の差分を逐語的に追う解説

## 先に断っておくこと

本来は `git --no-pager status --short`、`git --no-pager diff --stat`、`git --no-pager diff` の順で差分を確認したいところですが、今回の記事化ではそれらのコマンドを直接実行できるツールが手元になかったため、以下の**観測可能なファイル内容**を根拠に整理しています。

- `backend/src/` の現物コード
- `.github/rules/backend.rules.md`
- `.github/agents/*.agent.md`
- `.github/CUSTOM_COMMANDS.md`
- `.github/instructions/copilot-instructions.md`
- `.github/workflows/*.yml`
- `diary/20260425.md`
- `review/todo-api-20260425.md`
- `pull-request/*.md`
- 既存の `blog/*.md`

つまり、この記事は**git メタデータではなく、現在のリポジトリ状態と関連記録をもとにした技術整理**です。

---

## 背景: まず「実装が動く」状態から、「ルールに沿って保守できる」状態へ進める必要があった

`diary/20260425.md` と `blog/Hono-Vitest-TDDでTodo-APIバックエンドを実装した.md` を読むと、このバックエンドは最初、`backend/src/index.ts` にルーティング・ストレージ・バリデーション・DTO 変換をまとめて持つ形で進んでいました。

一方、現在の `backend/src/index.ts` は次のような薄い入口になっています。

```ts
import { createBackendRegistry } from './infrastructure/framework/registry';

const registry = createBackendRegistry();

export function clearStorage(): void {
  registry.clearStorage();
}

export default registry.app;
```

この変化が重要です。  
いまの実装は「API が動く」だけでなく、`.github/rules/backend.rules.md` が求める次の方向へ寄せ直されています。

- `domain/`
- `usecase/`
- `interface/`
- `infrastructure/`
- registry による配線
- thin handler / controller
- バリデーション境界の明確化
- インフラ起因エラーのアプリケーションエラーへの写像

つまり今回の見どころは、Todo API の機能追加そのもの以上に、**バックエンド実装が repository ルールに合わせて再設計されたこと**です。

---

## `.github/rules/backend.rules.md` が何を求めていたか

`backend.rules.md` には、バックエンド実装についてかなり具体的な指針があります。

要点を抜くとこうです。

- `domain` は最内周。フレームワークやインフラに依存しない
- `usecase` は業務フローの調停だけを行う
- `handler/controller` は薄く保つ
- バリデーションは入口側で扱う
- 生のインフラエラーを外へ漏らさない
- registry で依存を接続する
- 検証コマンドは `backend` ディレクトリで `npm run lint` / `npm run typecheck` / `npm run test`

現在の `backend/src/` は、少なくとも観測できる範囲ではこの方針にかなり素直に沿っています。

---

## 現在のバックエンド構成を、rules と対応づけて見る

現状の `backend/src/` は次のように分かれています。

```text
backend/src/
├── domain/
│   ├── entities/
│   │   ├── app.ts
│   │   ├── todo.ts
│   │   └── app-error.ts
│   └── repositories/
│       ├── app-repository.ts
│       └── todo-repository.ts
├── usecase/
│   ├── input_ports/
│   │   ├── app-usecase.ts
│   │   └── todo-usecase.ts
│   └── interactors/
│       ├── app-interactor.ts
│       └── todo-interactor.ts
├── interface/
│   ├── controllers/
│   │   ├── app-controller.ts
│   │   ├── todo-controller.ts
│   │   └── request-validation.ts
│   ├── presenters/
│   │   └── http-presenter.ts
│   └── gateways/
│       ├── in-memory-repositories.ts
│       └── in-memory-storage.ts
└── infrastructure/
    └── framework/
        ├── hono-app.ts
        └── registry.ts
```

以下、ルールとの対応を具体的に見ます。

### 1. `domain/`: エンティティとエラー、Port の定義だけを置く

`backend/src/domain/entities/app.ts` と `todo.ts` は単純な型定義です。  
`deletedAt` を含む内部表現もここで扱っています。

さらに `backend/src/domain/entities/app-error.ts` には `AppError` があり、コードは次の 4 種類です。

- `VALIDATION_ERROR`
- `CONFLICT`
- `NOT_FOUND`
- `REPOSITORY_ERROR`

これが後段の層をまたいで流れる「安全な失敗表現」になっています。

また `backend/src/domain/repositories/*.ts` は実装ではなく interface です。

```ts
export interface AppRepository {
  save(app: AppEntity): Promise<void>;
  listActive(): Promise<AppEntity[]>;
  findActiveById(id: string): Promise<AppEntity | null>;
  existsActiveByName(name: string, excludeId?: string): Promise<boolean>;
}
```

ここには Hono も Map も SQL もありません。  
`backend.rules.md` の「Domain Layer は framework / infrastructure を import しない」に沿った形です。

### 2. `usecase/`: HTTP を知らない業務フローに閉じ込める

`backend/src/usecase/input_ports/` では、各 usecase の入出力を型として定義しています。

- `app-usecase.ts`
- `todo-usecase.ts`

そして `interactors/` が実処理です。

- `app-interactor.ts`
- `todo-interactor.ts`

たとえば `createAppInteractor` では、

- 重複名チェック
- ID 生成
- timestamp 生成
- 保存
- 既存 App の存在確認
- App 削除時の Todo カスケード削除

といったアプリケーションの流れを担当しています。

重要なのは、ここに HTTP レスポンス生成がないことです。  
`status code` も `Context` も `c.json()` も出てきません。  
Usecase は repository port を呼び、必要なら `AppError` を投げるだけです。

これも `backend.rules.md` の「Usecase は SQL や HTTP call を持たない」に合っています。

### 3. `interface/controllers/`: 本当に薄い controller になった

`backend.rules.md` が強く言っているのが、controller を薄くすることです。  
現在の `app-controller.ts` と `todo-controller.ts` はかなりその通りです。

やっていることはほぼ 3 つだけです。

1. request body を parse / validate
2. usecase を呼ぶ
3. `AppError` を HTTP レスポンスへ変換する

たとえば `todo-controller.ts` の update はこうです。

```ts
const todo = await todoUsecase.update(
  parseUpdateTodoInput(appId, todoId, body),
);
return presentSuccess(presentTodo(todo));
```

異常系も `handleControllerError()` に寄せられています。  
ここで `isAppError()` を見て `presentError()` へ流し、それ以外は再 throw です。

「controller が業務ロジックを抱え込まない」形になっているのがわかります。

### 4. バリデーション境界が `request-validation.ts` に集約された

これは今回の再編で特に大きい点です。

`backend/src/interface/controllers/request-validation.ts` が、App/Todo の create/update 入力をまとめて扱っています。

- `parseCreateAppInput`
- `parseUpdateAppInput`
- `parseCreateTodoInput`
- `parseUpdateTodoInput`

ここでやっているのは次のような処理です。

- body が object でなければ空 object 扱い
- `name` / `title` の trim と長さ制限
- `completed` が boolean 以外なら `VALIDATION_ERROR`

つまり、以前レビューで問題になった「`Boolean()` による黙った型変換」を、**controller 手前の validation boundary で止める**方向に変わっています。

### 5. `interface/presenters/`: DTO と HTTP エラー写像をここに寄せる

`backend/src/interface/presenters/http-presenter.ts` では、

- `presentApp`
- `presentTodo`
- `presentSuccess`
- `presentError`

が定義されています。

ここが効いているのは 2 点です。

#### `deletedAt` をレスポンスに出さない

内部 entity には `deletedAt` がありますが、外向け DTO には出していません。  
これは `docs/design/backend/api.md` の

> GET responses do NOT include `deletedAt`

という仕様とも一致します。

#### エラーコードから HTTP status への変換を presenter に閉じ込める

`statusForErrorCode()` は次の写像です。

- `VALIDATION_ERROR` → 422
- `CONFLICT` → 409
- `NOT_FOUND` → 404
- `REPOSITORY_ERROR` → 500

これで usecase 側は HTTP を知らずに済み、controller 側も `presentError()` を呼ぶだけで済みます。

### 6. `interface/gateways/`: repository 実装は Port の裏側に押し込める

`backend/src/interface/gateways/in-memory-repositories.ts` は、in-memory 実装ですが立派な gateway です。

ここでは `Map` を直接触りながらも、例外は `withRepositoryError()` で包んでいます。

```ts
function withRepositoryError<T>(operation: () => T): T {
  try {
    return operation();
  } catch {
    throw new AppError('REPOSITORY_ERROR', 'Repository operation failed');
  }
}
```

これで生の例外をそのまま外に漏らさず、`backend.rules.md` の

> Never leak raw infrastructure errors outside the infrastructure layer.

に近い運用ができています。

現時点では DB ではなく `Map` ベースですが、**Port の背後に隠してある**ので、将来 MySQL 実装へ差し替える場所も明確です。

### 7. `infrastructure/framework/`: Hono と DI 配線だけを置く

`backend/src/infrastructure/framework/hono-app.ts` はルート登録専用です。  
Hono の `Context` を触るのはここだけで、各ルートは controller に委譲しています。

`readRequestBody()` が JSON parse 失敗時に `{}` を返すのも入口側の責務として自然です。  
結果的に JSON パース失敗は validation error に寄せやすくなります。

さらに `registry.ts` が依存を配線しています。

- storage 作成
- repository 作成
- interactor 作成
- controller 作成
- Hono app 作成

この registry があることで、`index.ts` は薄く保てています。  
`backend.rules.md` にある「Registry: Wire everything together using Dependency Injection」に対応する実装です。

---

## 旧実装と比べると、何がいちばん変わったのか

いちばん大きいのは、**責務の置き場所が明確になったこと**です。

過去の記録では、`backend/src/index.ts` が次をまとめて持っていました。

- ルーティング
- ストレージ
- バリデーション
- DTO 変換
- エラーレスポンス生成
- カスケード削除

現在はこれが分散されています。

| 責務 | 現在の主な配置 |
|---|---|
| Entity / エラー | `domain/entities/` |
| Repository Port | `domain/repositories/` |
| 業務フロー | `usecase/interactors/` |
| 入力境界 | `interface/controllers/request-validation.ts` |
| HTTP controller | `interface/controllers/*.ts` |
| DTO / レスポンス整形 | `interface/presenters/http-presenter.ts` |
| repository 実装 | `interface/gateways/*.ts` |
| Hono と配線 | `infrastructure/framework/*.ts` |

この分解により、少なくとも次の利点があります。

- validation の修正箇所が明確
- HTTP 仕様変更が usecase に波及しにくい
- DB 置換時に controller/usecase まで巻き込みにくい
- review で「どの層の責務違反か」を判断しやすい

---

## レビューで出た指摘が、今の構造とどうつながっているか

`review/todo-api-20260425.md` は、今回の再編を見るうえでかなり重要です。  
単にバグ一覧ではなく、「どこで受けるべき問題か」を示しています。

### 1. `completed` の `Boolean()` 強制変換問題

レビューでは、`"false"` や `1` を `Boolean()` が黙って `true` / `false` に変換してしまう問題が指摘されていました。

現在の `request-validation.ts` では、これが次の形で止められています。

```ts
if (payload.completed !== undefined) {
  if (typeof payload.completed !== 'boolean') {
    throw new AppError('VALIDATION_ERROR', 'completed must be a boolean');
  }
  input.completed = payload.completed;
}
```

これは単なるバグ修正ではなく、**validation を interface 層で受ける**という rules 準拠そのものです。

### 2. trim と一意制約の不一致

レビューでは、trim して空文字判定はしているのに、保存や重複判定は元の文字列で行っていた点も指摘されていました。

現在の validation は `trimmed` を返すので、

- 空白だけを reject
- 長さ判定も trim 後で実施
- 保存される値も trim 済み

という流れになっています。

これも「バリデーション結果を usecase へ渡す」構造に直したことで、一貫性を持たせやすくなっています。

### 3. `createdAt` / `updatedAt` の timestamp 二重取得

レビューでは、生成時に `now()` を 2 回呼ぶのではなく 1 回にまとめるべき、という指摘もありました。  
現在の `app-interactor.ts` / `todo-interactor.ts` は `const timestamp = now();` と 1 回だけ取得しています。

この修正も「生成責務が usecase にまとまっている」から素直に入れられています。

### 4. まだ残るテスト上の弱さ

一方で、レビューが指摘した cascade delete テストの弱さは、現状でも完全には消えていません。  
`backend/src/app.test.ts` の該当テストには、

> The todo belonged to the old appId; either 404 app or 404 todo is acceptable

というコメントが入っており、**直接的に cascade の内部状態を証明しているわけではない**ことが自覚的に残されています。

ここは「修正済み」ではなく「今後さらに強くできる余地」として見るのが自然です。

---

## テスト戦略も、層分離後の形に合っている

### `backend/src/index.test.ts`: 入口のスモークテスト

まず root endpoint に対する最小のテストがあります。

```ts
describe('GET /', () => {
  it('when the root endpoint is requested, then it returns the greeting text', async () => {
    const response = await app.request('http://localhost/');
    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe('Hello Hono!');
  });
});
```

これは Hono アプリが正しく立ち上がっているかの最低限の確認です。

### `backend/src/app.test.ts`: HTTP レベルの統合テスト

本体はこちらで、App/Todo の CRUD を HTTP 経由でかなり広く押さえています。

観測できるケースだけでも次があります。

- App 作成
- App 一覧
- App 単体取得
- App 更新
- App 削除
- Todo 作成
- Todo 一覧
- Todo 単体取得
- Todo 更新
- Todo 削除

加えて、

- 422 系の入力エラー
- 409 の重複
- 404 の存在しない ID
- soft delete 後の非表示
- DTO に `deletedAt` を出さないこと
- 100 文字 / 200 文字の境界値
- `updatedAt >= createdAt`

まで見ています。

### `clearStorage()` を registry 越しに公開しているのが地味に良い

`beforeEach(() => clearStorage())` のために、`index.ts` が test helper を export しています。  
しかも storage を直接 export せず、`registry.clearStorage()` に閉じているので、テスト都合の API 追加が内部構造を壊しにくいです。

### ただし未確認事項もある

現物の `app.test.ts` を見る限り、`completed` に非 boolean を送って 422 になるケースは見当たりません。  
実装側では守られていても、そこを test で押さえる余地はまだあります。

---

## `backend.rules.md` の「検証コマンド」は package.json と CI にまで落ちている

`backend.rules.md` には、検証時は `backend/` で次を実行するよう書かれています。

- `npm run lint`
- `npm run typecheck`
- `npm run test`

現在の `backend/package.json` はそのままこれを持っています。

```json
"scripts": {
  "dev": "bun run --hot src/index.ts",
  "lint": "eslint .",
  "test": "vitest run --reporter=default --reporter=json --outputFile=test-result.json",
  "typecheck": "tsc --noEmit"
}
```

この `test` が JSON レポートも出すようになっているのが次の CI につながります。

### `.github/workflows/backend.yaml`

- `backend` で `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `backend/test-result.json` を読んで PR にコメント

### `.github/workflows/frontend.yaml`

frontend 側も同じ構成で `npm test` を使い、`frontend/test-result.json` を PR コメント化しています。

つまり、この repository では「テストを走らせる」だけでなく、**PR 上で見える形にまで戻す**ところまで workflow 化されています。

---

## Copilot 用セットアップ workflow も、運用の再現性を上げている

`.github/workflows/copilot-setup-steps.yml` では、次の準備を自動化しています。

- checkout
- Node.js 22 セットアップ
- `backend/package-lock.json` と `frontend/package-lock.json` を使った npm cache
- `backend/` で `npm ci`
- `frontend/` で `npm ci`
- `git --version`
- `pwsh --version`

これは単なる環境構築メモではなく、**Copilot CLI が repository 文脈で動く前提条件を固定する**ためのものです。  
とくに backend と frontend の両方を同じ workflow で初期化しているのは、マルチパッケージ構成での揺れを減らします。

---

## バックエンド再編だけでなく、「変更を残す仕組み」も強くなっている

今回おもしろいのは、コードだけでなく `.github/` 配下のエージェント運用もかなり整理されていることです。

### `ArticleWriterAgent`: 実装を blog に残す前提が明文化された

`.github/agents/ArticleWriterAgent.agent.md` では、

- git evidence を優先
- 仕様、diff、PR 文脈を読む
- 日本語の技術記事にする
- `blog/` に Markdown で保存する
- rules が設計を形作ったなら、その関係を説明する

というルールが定義されています。

つまり「コードを書いたら終わり」ではなく、**変更理由と設計意図まで記録に残す**運用が agent に埋め込まれています。

### `WorkSummaryAgent`: 要約を chat で終わらせず `diary/` に追記する

`.github/agents/WorkSummaryAgent.agent.md` はさらに実務寄りで、

- `diary/YYYYMMDD.md` に書く
- 同日ファイルには append
- incomplete work も書く
- git diff が取れなければそのことを明記する

という設計です。

実際に `diary/20260425.md` には、

- OrchestratorAgent のルール強化
- Todo API 実装
- TypeScript rules 追加
- WorkSummaryAgent 強化
- Copilot setup 整備

がまとまっていて、**後から repository を読む人間にとっての時系列ログ**になっています。

### `CUSTOM_COMMANDS.md`: prompt より `@AgentName` を優先する方針

`.github/CUSTOM_COMMANDS.md` には、

- `/write-article`
- `/summarize-work`
- `@ArticleWriterAgent`
- `@OpenApiWriterAgent`
- `@WorkSummaryAgent`
- `@ReviewResponseAgent`

の役割が整理されています。

特に大事なのは、Copilot CLI では prompt file が必ずしも slash command として安定しないため、**実運用では `@AgentName` を優先する**と明言している点です。

これはツールの理想論ではなく、CLI の現実に合わせた設計です。

---

## TDD フロー自体も、レビュー込みで閉じるように強化されている

`pull-request/CodeReviewAgent追加とOrchestratorAgentへのReviewフェーズ統合.md` と  
`.github/agents/OrchestratorAgent.agent.md` を見ると、TDD の定義も変わっています。

以前の 3 段階ではなく、現在は次です。

1. Red
2. Green
3. Refactor
4. Review
5. Integration & Report

しかも `OrchestratorAgent` は、自分でコードを書いてはいけないと明示されています。

- sub-agent が失敗しても自分で source を書かない
- 1 回だけ retry し、それでもだめなら止まる
- review file ができる前に完了扱いしない

`diary/20260425.md` にも、このルール強化の背景として「オーケストレーターが失敗を埋めるために自分でコードを書いてしまった」問題が記録されています。

これは重要です。  
自動化を進めると、つい「とにかく結果を出す」方向へ寄りがちですが、この repository では逆に、**役割の境界を壊さないことを優先**しています。

---

## CodeReviewAgent と PR 下書き生成までつながっている

### `CodeReviewAgent`

`.github/agents/CodeReviewAgent.agent.md` は、レビューを `review/{topic}-{YYYYMMDD}.md` に保存する前提で作られています。

しかも review checklist に、

- Clean Architecture 違反
- handler/controller の薄さ
- infrastructure error のマッピング
- test quality
- security

が並んでいます。

今回の `review/todo-api-20260425.md` でも、まさにその観点で

- `Boolean()` coercion
- cascade delete test の検証不足
- trim と一意制約の不一致
- timestamp の一貫性

が挙がっていました。

### `PullRequestWriterAgent`

`.github/agents/PullRequestWriterAgent.agent.md` と  
`pull-request/PR下書き生成フローとPRテンプレート運用を整備.md` からは、PR の説明文まで repository 内で標準化しようとしていることがわかります。

固定セクションは次です。

- `## Title`
- `## Summary`
- `## Related Tasks`
- `## What was done`
- `## What is not included`
- `## Impact`
- `## Testing`
- `## Notes`

ここまで来ると、この repository は単にアプリを作る場所というより、**実装 → テスト → レビュー → PR → 記事 → 日報** を一連の作業として設計していると言えます。

---

## TypeScript ルール追加も、今回のバックエンド再編と相性がいい

`.github/rules/typescript.rules.md` では、

- `as` 禁止
- `any` 禁止
- やむを得ず使うなら直前コメント必須
- 代替として `unknown` と型ガードを推奨

が定義されています。

今回の backend 側で見ると、このルールはかなり自然に活きます。

たとえば `request-validation.ts` は、`unknown` を受けて

- `typeof`
- `Array.isArray`
- `object` 判定

で絞り込みながら parse しています。

Clean Architecture の話に見えて、実際にはこうした TypeScript ルールも「境界で安全に扱う」設計と噛み合っています。

---

## 今の構成で見えている限界

良い点だけでなく、現時点の限界も書いておきます。

### 1. `usecase/output_ports/` は現状見当たらない

`backend.rules.md` の例では `usecase/output_ports/` がありますが、現在の `backend/src/usecase/` にあるのは

- `input_ports/`
- `interactors/`

だけです。

現状は presenter 側でレスポンス DTO を組み立てているため成立していますが、**ルール例を完全にそのまま写した構成ではない**ことは明記しておいたほうが正確です。

### 2. DB 実装はまだ in-memory

`interface/gateways/` の実装は `Map` ベースです。  
`docs/design/db/db.md` には MySQL スキーマがあるので、将来的には DB gateway / infrastructure database 層が増えるはずですが、そこはまだ未実装です。

### 3. 一部テストはさらに強くできる

- cascade delete の直接証明
- `completed` 非 boolean の 422
- repository error の 500 応答

あたりは、今後の追加候補として見えます。

### 4. 実コマンド実行による確認は、この記事ではしていない

`backend.package.json` と workflow 定義から `lint` / `typecheck` / `test` の導線は確認できますが、この記事作成時点ではそれらのコマンド実行結果までは確認していません。  
そのため、ここで言えるのは「実行経路が定義されている」までです。

---

## まとめ

今回の変化をひとことで言うなら、**Todo API を作った**だけではなく、**その実装を repository ルールに従って保守可能な形へ載せ替えた**ことが本質です。

ポイントを整理するとこうです。

- `backend/src/index.ts` に集まっていた責務を、`domain/` `usecase/` `interface/` `infrastructure/` に分離した
- controller は「validate → usecase 呼び出し → presenter 返却」の薄い形に寄せた
- repository 実装の例外は `AppError('REPOSITORY_ERROR')` に写像し、生の失敗を漏らしにくくした
- response shaping と error-to-status mapping を presenter に寄せた
- registry で依存を配線し、入口を薄くした
- テスト、レビュー、CI、PR コメントまでをひとつの流れにした
- `ArticleWriterAgent` と `WorkSummaryAgent` によって、変更内容を `blog/` と `diary/` に残す運用も整えた

個人的にいちばん良いと思ったのは、`.github/rules/backend.rules.md` が単なる理想論ではなく、現在のファイル配置、エラーハンドリング、workflow、agent 運用にまで落ちている点です。

設計ルールは、書くだけでは効きません。  
**どの層に何を書くか、失敗をどこで止めるか、変更をどう記録するか**までつながって、はじめて repository の習慣になります。

このバックエンド再編は、その「ルールをコードと運用へ落とす」段階まで進んだ、という意味で読み応えがありました。
