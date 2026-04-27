## Title

Add FixAgent, automate CodeReview→ReviewResponse→Fix pipeline, translate .github/ to English, and fix npm run migrate

---

## Summary

This PR introduces four distinct improvements to the backend and AI agent layer:

1. **FixAgent** — a new surgical bug-repair agent distinct from `RefactorAgent`, which is limited to non-breaking quality improvements
2. **Automated review-to-fix pipeline** — `CodeReviewAgent` now automatically chains into `ReviewResponseAgent → FixAgent`, so a single `@CodeReviewAgent` invocation drives the full review, response, and fix cycle
3. **English translation of all `.github/` files** — agent definitions, rule files, prompt templates, and CI workflow templates are now in English; `blog/` and `diary/` output remains Japanese
4. **`npm run migrate` bug fix** — `.env` was not loaded by the migrate script, causing `ER_ACCESS_DENIED_ERROR (using password: NO)`; resolved via Node.js 22's native `--env-file` flag

A backend code-quality refactor (`handleControllerError` deduplication) is also included.

---

## Related Tasks

TBD

---

## What was done

### 1. Add FixAgent (`4d23fe3`)

Created `.github/agents/FixAgent.agent.md` — a bug/defect repair agent modeled on `RefactorAgent` with the following key differences:

| Aspect | RefactorAgent | FixAgent |
|---|---|---|
| Purpose | Improve internal structure | Correct wrong behavior |
| External behavior change | ❌ Prohibited | ✅ Allowed when needed |
| Test modification | ❌ Not allowed | ✅ Allowed when spec-confirmed wrong |
| Commit prefix | `refactor:` | `fix:` |
| `user-invocable` | `false` | `true` |

Both agents commit one change at a time (verify → commit → repeat).

Also fixed a pre-existing duplicate rule 5 in `RefactorAgent`'s Thinking Rules section (renumbered 6–11).

### 2. Automate CodeReview→ReviewResponse→Fix pipeline (`b4b92ff`)

Updated `Post-Completion Required Steps` in two agent files:

- **`CodeReviewAgent`** — after writing the review file, calls `@ReviewResponseAgent`
- **`ReviewResponseAgent`** — after drafting replies, calls `@FixAgent`

Full automated chain:
```
@CodeReviewAgent
    → @ReviewResponseAgent
        → @FixAgent
            → @ArticleWriterAgent + @WorkSummaryAgent
```

### 3. Translate all `.github/` files to English (`d0fe133`)

19 files changed (166 insertions / 166 deletions — pure translation, no logic changes):

| Category | Files |
|---|---|
| Agent definitions | All 13 `.github/agents/*.agent.md` files |
| Rule files | `typescript.rules.md` |
| Prompt templates | `prompts/write-article.prompt.md`, `prompts/summarize-work.prompt.md` |
| CI workflow templates | `backend.yaml`, `frontend.yaml` PR comment bodies |
| Command reference | `CUSTOM_COMMANDS.md` |

### 4. Revert blog/diary output language to Japanese (`402f7a5`)

The translation in step 3 inadvertently changed `ArticleWriterAgent` and `WorkSummaryAgent` output language to English. This commit reverts the output language settings back to Japanese while keeping the agent definition prose in English.

Files reverted: `ArticleWriterAgent.agent.md`, `WorkSummaryAgent.agent.md`, `prompts/write-article.prompt.md`, `prompts/summarize-work.prompt.md`.

### 5. Fix `npm run migrate` ER_ACCESS_DENIED_ERROR (`49e333d`)

**Root cause:** `backend/package.json` migrate script called `tsx src/infrastructure/migrate.ts` without loading `.env`. `DB_PASSWORD` resolved to empty string via the `??''` fallback in `migrate.ts`, causing MySQL to reject the connection with "using password: NO".

**Fix:** One-line change in `backend/package.json`:
```json
"migrate": "tsx --env-file=.env src/infrastructure/migrate.ts"
```

Node.js 22 supports `--env-file` natively; `tsx` passes it through transparently. Zero new dependencies added.

### 6. Extract `handleControllerError` to `http-presenter.ts` (`ebb7e6d`)

The identical `handleControllerError` function was duplicated in `app-controller.ts` and `todo-controller.ts`. Centralized it in `http-presenter.ts` (which both controllers already import), eliminating the duplication.

**Files changed:**
- `backend/src/controllers/http-presenter.ts` — added `handleControllerError` export
- `backend/src/controllers/app-controller.ts` — removed local copy, now imports from `http-presenter`
- `backend/src/controllers/todo-controller.ts` — removed local copy, now imports from `http-presenter`

---

## What is not included

- No new API endpoints or backend behavior changes
- No frontend changes
- No new test cases for `FixAgent` (agent definitions are not covered by automated tests)
- The `FixAgent` invocation chain is not tested via integration tests — behavior is verified by convention and manual invocation

---

## Impact

- **Backend runtime**: Only `backend/package.json` (migrate script) and `http-presenter.ts` change runtime behavior. All other backend changes are refactors with no external behavior change.
- **Agent layer**: Adding `FixAgent` and the CodeReview→Fix chain changes how AI agents interact when `@CodeReviewAgent` is invoked. Existing manual invocations of individual agents are unaffected.
- **CI**: `backend.yaml` and `frontend.yaml` PR comment template strings changed from Japanese to English. No CI logic changed.
- **Compatibility**: `--env-file` requires Node.js ≥ 20.6. The project already uses Node.js 22, so no compatibility concern.

---

## Testing

- `npm run migrate` was executed after the fix and completed successfully: `Migration complete.`
- Backend `handleControllerError` refactor was verified with `npm run typecheck` and `npm run test` (all passing)
- Agent definitions are reviewed by reading the files; no automated test coverage for agent behavior

---

## Notes

- `blog/` and `diary/` are in `.gitignore` and cannot be committed. Articles and diary entries written by `ArticleWriterAgent` / `WorkSummaryAgent` during this session exist only locally.
- The `RefactorAgent` rule numbering fix (duplicate rule 5) was a pre-existing defect unrelated to the main FixAgent work but fixed in the same commit for convenience.
- The "agent definition language = English, output language = Japanese" split is intentional: it allows English-reading contributors to understand agent logic while keeping `blog/` and `diary/` outputs in Japanese for the primary audience.
