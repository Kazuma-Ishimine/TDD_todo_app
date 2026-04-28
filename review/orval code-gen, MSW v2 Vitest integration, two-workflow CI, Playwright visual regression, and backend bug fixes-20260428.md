**<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>
Return HTTP envelope from customFetch**

The generated Orval client functions are typed to return an HTTP envelope
(`{ data, status, headers }`, e.g. `postApiV1AppsResponse` in
`src/api/generated/index.ts`), but `customFetch` currently returns only
`response.json()`. That makes runtime values incompatible with the generated
contract (missing `status`/`headers` and one-level `data` mismatch), so
consumers using the generated hook types will read incorrect fields or
`undefined`. Build and return the expected envelope from `response.status`,
`response.headers`, and the parsed body (and mirror this shape for thrown
errors) so runtime matches the generated API types.

Useful? React with 👍 / 👎.

**Disposition:** Fixed — `frontend/src/api/client.ts`

`customFetch` now parses the response body for all HTTP status codes (JSON with text fallback) and returns `{ data, status, headers }` matching the orval-generated envelope types. The `response.ok` guard and throw were removed because the generated types include 4xx/5xx as typed response variants, not thrown errors. Verified with `tsc -b` (typecheck) and ESLint — both pass. Committed in `fd613a6`.

---

**<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>
Commit visual baseline before running screenshot assertion**

This new `toHaveScreenshot('home.png')` assertion requires a checked-in baseline
image, but the commit adds the test without adding any
`frontend/e2e/__snapshots__/.../home.png` file. Because `ci-nightly.yml`
executes `npx playwright test --grep "@visual"` without `--update-snapshots`,
the nightly visual-regression job will fail continuously until the baseline
snapshot is committed.

Useful? React with 👍 / 👎.

**Disposition:** Reply only — `frontend/e2e/visual.spec.ts` + `.github/workflows/ci-nightly.yml`

Visual baselines are platform-specific; a snapshot generated on macOS or Windows will not match pixels rendered on ubuntu-latest (the CI runner). The correct process is: run `npx playwright test --grep "@visual" --update-snapshots` on an ubuntu-latest machine (or inside a Docker container matching the CI image), then commit the generated `frontend/e2e/__snapshots__/` files. Adding `--update-snapshots` unconditionally to the CI step is unsafe — it would silently regenerate the baseline on every nightly run and never catch regressions. The comment already in `ci-nightly.yml` documents the correct one-time bootstrap flow. Action required by maintainer: generate the baseline on Linux and commit it before the nightly run is expected to pass.

---