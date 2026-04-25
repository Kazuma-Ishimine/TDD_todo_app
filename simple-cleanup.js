const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\Kazum\\Desktop\\programming\\AI\\website\\tddTodoApp';

const dirsToDelete = [
  path.join(baseDir, 'backend', 'src', 'domain'),
  path.join(baseDir, 'backend', 'src', 'usecase'),
  path.join(baseDir, 'backend', 'src', 'interface'),
  path.join(baseDir, 'backend', 'src', 'infrastructure', 'framework')
];

const filesToDelete = [
  path.join(baseDir, 'backend', 'src', 'app.test.ts'),
  path.join(baseDir, 'backend', 'src', 'index.test.ts')
];

console.log('Deleting directories...');
for (const dir of dirsToDelete) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✓ Deleted: ${dir}`);
    }
  } catch (e) {
    console.log(`✗ Error deleting ${dir}: ${e.message}`);
  }
}

console.log('\nDeleting files...');
for (const file of filesToDelete) {
  try {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`✓ Deleted: ${file}`);
    }
  } catch (e) {
    console.log(`✗ Error deleting ${file}: ${e.message}`);
  }
}

console.log('\nCleanup complete!');
