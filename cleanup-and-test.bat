@echo off
cd /d C:\Users\Kazum\Desktop\programming\AI\website\tddTodoApp

echo Deleting old directories...
rmdir /s /q backend\src\domain 2>nul
rmdir /s /q backend\src\usecase 2>nul
rmdir /s /q backend\src\interface 2>nul
rmdir /s /q backend\src\infrastructure\framework 2>nul

echo Deleting old test files...
del /f /q backend\src\app.test.ts 2>nul
del /f /q backend\src\index.test.ts 2>nul

echo Cleanup complete. Running checks...
cd backend

echo.
echo Running typecheck...
call npm run typecheck
if errorlevel 1 (
  echo Typecheck FAILED
  exit /b 1
)

echo.
echo Running lint...
call npm run lint
if errorlevel 1 (
  echo Lint FAILED
  exit /b 1
)

echo.
echo Running tests...
call npm run test
if errorlevel 1 (
  echo Tests FAILED
  exit /b 1
)

echo.
echo All checks PASSED! Committing...
cd ..
git add -A
git commit -m "refactor: reorganize backend to match layered architecture rules" -m "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

echo.
echo Commit successful!
exit /b 0
