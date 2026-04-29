**<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>  Check mutation status before firing todo form success flow**

`mutateAsync` resolves even for 4xx/5xx responses in this codebase (the fetch wrapper returns `{ data, status }` without throwing), so this branch calls `onSuccess()` even when create/update failed. In failure cases like 422 validation or 404 app/todo mismatch, the form still closes and parent refresh logic runs as if the save succeeded, which can hide errors and discard user context.

Useful? React with 👍 / 👎.

✅ **Fixed**

Added status validation before calling `onSuccess()` in both edit and create modes. The mutation response is now checked for 2xx status codes (lines 40-53), and `onSuccess()` only fires on successful responses. Three new test cases verify this behavior: `onSuccess` is not called on 422 validation errors, 409 conflicts, or 500 server errors. Commit: `5844450`

---

**<sub><sub>![P1 Badge](https://img.shields.io/badge/P1-orange?style=flat)</sub></sub>  Validate delete response before showing success message**

This unconditionally sets a success message and refreshes the list after `mutateAsync`, but non-2xx API responses also resolve here, so failed deletes (e.g., 404/500) will still show "Todo deleted successfully." That creates a false-positive success state and can mislead users into thinking data was removed when it was not.

Useful? React with 👍 / 👎.

✅ **Fixed**

Added status validation in `handleDelete()` before updating UI state (lines 34-42). Only calls `setSuccessMsg()`, `setShowConfirm(false)`, and `onRefresh()` when response has 2xx status. Four new test cases verify: no success message or refresh on 422, 409, 500, or 404 responses. Commit: `f159e16`

---

**<sub><sub>![P2 Badge](https://img.shields.io/badge/P2-yellow?style=flat)</sub></sub>  Handle missing app in edit page instead of infinite loading**

The page treats any falsy `app` as loading forever. When `GET /api/v1/apps/:id` returns a terminal error payload (such as 404 not found), `app` remains undefined and the UI never exits the loading state, so users cannot recover or navigate based on a clear error message.

Useful? React with 👍 / 👎.

✅ **Fixed**

Restructured loading and error state logic (lines 18-30). Now destructures `isLoading` from the query hook and displays loading only while `isLoading === true`. After query completes, if `app` is falsy, displays a clear error message instead of infinite loading. Three new test cases verify proper error UI on 404, 500, and 403 responses. Commit: `6b6450e`

---

## 🔍 **Verification Results**

| Check | Result | Status |
|-------|--------|--------|
| `npm run test` | 128/128 passed (+10 new tests) | ✅ |
| `npm run typecheck` | 0 errors | ✅ |
| `npm run lint` | 0 errors | ✅ |
| Tests regression | 0 regressions | ✅ |

All business logic issues have been resolved. Frontend is production-ready. ✨
