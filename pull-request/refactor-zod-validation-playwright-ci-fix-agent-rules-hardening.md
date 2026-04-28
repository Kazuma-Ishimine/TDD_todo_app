## Title

refactor(backend) + fix(e2e) + chore(agents): Zod validation refactor, Playwright CI fix, and agent rules hardening

---

## Summary

This PR covers a multi-session body of work across three distinct areas:

1. **Backend Zod refactoring** — `request-validation.ts` is rewritten to delegate entirely to Zod `safeParse()` using schemas already defined in `schemas.ts`. Redundant hand-rolled helpers are removed. `http-presenter.ts` DTO types are now derived from the same schemas via `z.infer<>`.

2. **Playwright smoke test fix** — `playwright.config.ts` had a 60s `webServer` timeout that was too short for `tsc -b + vite build` to finish locally, and it was unconditionally running the build in CI even though the workflow already builds `dist/` before Playwright runs. Both issues are resolved.

3. **Agent rules hardening** — Commit rights are revoked from `ArticleWriterAgent` and `WorkSummaryAgent` (write to `blog/` and `diary/` only; no `git commit`/`git push`). A new `AGENT_IO.md` reference document is added for all 13 custom agents. The `copilot-instructions.md` Autonomy section is rewritten to ban all confirmation prompts, including git operations.

---

## Related Tasks

TBD

---

## What was done

### Backend — Zod validation refactor (`61aaa25`)

**Files changed**: `backend/src/controllers/request-validation.ts`, `backend/src/controllers/http-presenter.ts`

- **`request-validation.ts`**: Replaced manual validation logic (`toRecord()`, `validateName()`, `validateTitle()` helpers, ~122 lines) with four thin parse functions (`parseCreateAppInput`, `parseUpdateAppInput`, `parseCreateTodoInput`, `parseUpdateTodoInput`) that each call `Schema.safeParse()` and throw an `AppError('VALIDATION_ERROR', ...)` on failure. Net reduction: ~90 lines.
- **`http-presenter.ts`**: Replaced manually declared `AppDto` and `TodoDto` interfaces with `z.infer<typeof AppDtoSchema>` and `z.infer<typeof TodoDtoSchema>` respectively. `AppDtoSchema`/`TodoDtoSchema` defined in `schemas.ts` are now the single source of truth for both validation and response shapes.

### Playwright — webServer CI fix (`9268a7f`, `51d9696`, `1786dac`)

**File changed**: `frontend/playwright.config.ts`

- `timeout` raised from default 60 s → `120_000` ms to accommodate `tsc -b + vite build` locally.
- `command` made conditional: CI (`process.env.CI` truthy) runs `npm run preview` only; local runs `npm run build && npm run preview`. This avoids a redundant double-build in the CI workflow where `dist/` is already present.
- `reuseExistingServer` set to `!process.env.CI` (reuse a running dev server locally; always start fresh in CI).

### Agent rules hardening (`acb7c22`, `2ca607b`)

**Files changed**: `.github/instructions/copilot-instructions.md`, `.github/agents/ArticleWriterAgent.agent.md`, `.github/agents/WorkSummaryAgent.agent.md`

- **Revoked commit rights** from `ArticleWriterAgent` and `WorkSummaryAgent`. Both agents may write files to `blog/` and `diary/` but are explicitly prohibited from running `git commit` or `git push`.
- **Autonomy rules rewritten** in `copilot-instructions.md`: all confirmation prompts are banned for every operation type (file edits, deletions, git commits, pushes, running commands). Agents may only pause to ask for a genuinely missing fact that blocks correct implementation.
- **`ReviewResponseAgent`**: removed the "ask for clarification" branch; the agent now picks the most reasonable interpretation and proceeds.

### Documentation — AGENT_IO.md (`709bfeb`)

**File added**: `.github/AGENT_IO.md`

- Comprehensive reference table for all 13 custom agents covering: input types, output file locations, and app-specific settings that differ across projects.
- Includes a project-wide settings table mapping commands (`npm run test`, `npm run typecheck`, etc.) to the agents that depend on them.
- Designed as a porting guide: when moving agents to a new project, `AGENT_IO.md` is the single file to update first.

---

## What is not included

- No changes to the Zod schemas themselves (`schemas.ts`) — only the consumers are updated.
- No changes to route handlers, use-case logic, or database layer.
- No frontend validation changes.
- No new Playwright test cases — only configuration is fixed.
- Agent prompt content and task logic are not changed; only git permission rules and autonomy rules are updated.
- `copilot-instructions.md` post-task automation rules (auto-invoke `ArticleWriterAgent` / `WorkSummaryAgent`) are unchanged.

---

## Impact

| Area | Impact |
|---|---|
| `backend/src/controllers/request-validation.ts` | Behaviour is equivalent; error messages and `AppError` codes are unchanged. All existing backend tests should pass without modification. |
| `backend/src/controllers/http-presenter.ts` | `AppDto` / `TodoDto` types are now narrower (driven by schema). Any consumer that relied on extra properties not in `AppDtoSchema`/`TodoDtoSchema` would break at compile time — this is intentional. |
| `frontend/playwright.config.ts` | Local Playwright runs no longer time out during the build step. CI no longer double-builds. |
| `.github/agents/*.agent.md` | `ArticleWriterAgent` and `WorkSummaryAgent` can no longer accidentally commit agent-generated content to the repository. |
| `.github/instructions/copilot-instructions.md` | All agents governed by `copilot-instructions.md` will no longer pause to ask permission mid-task. |
| `.github/AGENT_IO.md` | Informational only; no runtime impact. |

---

## Testing

- **Backend unit tests**: existing test suite covers the four parse functions via controller-level tests. No test changes were required — the public API (`parseCreateAppInput` etc.) and error shapes are identical.
- **Type checking**: `z.infer<>` derivation in `http-presenter.ts` is verified by `npm run typecheck` in the `backend/` workspace.
- **Playwright**: `playwright.config.ts` fix was validated by the CI workflow (`ci-nightly.yml`) completing the Playwright smoke test stage without webServer timeout errors.
- Agent rule changes are not automatically testable; they are validated by review of the affected `.agent.md` and `.md` files.

---

## Notes

- The Zod refactor reduces `request-validation.ts` from ~122 lines to ~53 lines. The deleted helpers (`toRecord`, `validateName`, `validateTitle`) were duplicating logic already present in `CreateAppRequestSchema` / `UpdateAppRequestSchema` / `CreateTodoRequestSchema` / `UpdateTodoRequestSchema`.
- The `AGENT_IO.md` file is written in Japanese to match the existing documentation convention in this repository.
- Commit `09cfeab` (`Implement feature X…`) on the `frontend` branch is **not** part of this PR scope and should be reviewed separately.
