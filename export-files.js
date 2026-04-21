// export-files.js
const fs = require('fs');
const path = require('path');

const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.json'];
const excludeDirs = ['node_modules', '.next', 'out', 'build', 'dist'];

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else {
      if (extensions.includes(path.extname(file))) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

const allFiles = getAllFiles('./');
const output = [];

allFiles.forEach(file => {
  output.push(`\n========== ${file} ==========\n`);
  output.push(fs.readFileSync(file, 'utf8'));
  output.push('\n');
});

fs.writeFileSync('project-export.txt', output.join(''));
console.log('Exported to project-export.txt');