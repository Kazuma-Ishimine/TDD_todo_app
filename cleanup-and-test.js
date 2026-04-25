#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = process.cwd();
const dirsToDelete = [
  'backend/src/domain',
  'backend/src/usecase',
  'backend/src/interface',
  'backend/src/infrastructure/framework'
];

const filesToDelete = [
  'backend/src/app.test.ts',
  'backend/src/index.test.ts'
];

console.log('Step 1: Deleting old directories and files...\n');

// Delete directories
for (const dir of dirsToDelete) {
  const fullPath = path.join(projectRoot, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`Deleting: ${dir}`);
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    console.log(`Not found (skipping): ${dir}`);
  }
}

// Delete files
for (const file of filesToDelete) {
  const fullPath = path.join(projectRoot, file);
  if (fs.existsSync(fullPath)) {
    console.log(`Deleting: ${file}`);
    fs.unlinkSync(fullPath);
  } else {
    console.log(`Not found (skipping): ${file}`);
  }
}

console.log('\nStep 2: Running checks from backend/\n');

process.chdir(path.join(projectRoot, 'backend'));

let allPassed = true;

// Run typecheck
console.log('========================================');
console.log('Running: npm run typecheck');
console.log('========================================');
try {
  execSync('npm run typecheck', { stdio: 'inherit' });
  console.log('✓ Typecheck PASSED\n');
} catch (error) {
  console.log('✗ Typecheck FAILED\n');
  allPassed = false;
}

// Run lint
console.log('========================================');
console.log('Running: npm run lint');
console.log('========================================');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  console.log('✓ Lint PASSED\n');
} catch (error) {
  console.log('✗ Lint FAILED\n');
  allPassed = false;
}

// Run tests
console.log('========================================');
console.log('Running: npm run test');
console.log('========================================');
try {
  execSync('npm run test', { stdio: 'inherit' });
  console.log('✓ Tests PASSED\n');
} catch (error) {
  console.log('✗ Tests FAILED\n');
  allPassed = false;
}

// If all passed, commit
if (allPassed) {
  console.log('========================================');
  console.log('All checks PASSED! Committing changes...');
  console.log('========================================');
  process.chdir(projectRoot);
  try {
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "refactor: reorganize backend to match layered architecture rules\n\nCo-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"', { stdio: 'inherit' });
    console.log('\n✓ Commit successful!');
  } catch (error) {
    console.log('✗ Git commit failed');
    process.exit(1);
  }
} else {
  console.log('========================================');
  console.log('Some checks FAILED. Review output above.');
  console.log('========================================');
  process.exit(1);
}
