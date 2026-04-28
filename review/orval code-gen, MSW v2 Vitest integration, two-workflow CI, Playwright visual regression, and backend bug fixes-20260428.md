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

Useful? React with 👍 / 👎.

**<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>
Commit visual baseline before running screenshot assertion**

This new `toHaveScreenshot('home.png')` assertion requires a checked-in baseline
image, but the commit adds the test without adding any
`frontend/e2e/__snapshots__/.../home.png` file. Because `ci-nightly.yml`
executes `npx playwright test --grep "@visual"` without `--update-snapshots`,
the nightly visual-regression job will fail continuously until the baseline
snapshot is committed.

Useful? React with 👍 / 👎.
1