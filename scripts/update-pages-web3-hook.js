import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to recursively find all .tsx files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .git directories
      if (!file.includes('node_modules') && !file.startsWith('.')) {
        findTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Find all .tsx files in pages directory
const pagesDir = path.join(__dirname, '..', 'client', 'src', 'pages');
const tsxFiles = findTsxFiles(pagesDir);

console.log(`Found ${tsxFiles.length} .tsx files to update in pages`);

// Update each file
tsxFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Replace import statement
  if (content.includes('import { useWeb3 } from "@/hooks/useWeb3"')) {
    content = content.replace(
      'import { useWeb3 } from "@/hooks/useWeb3"',
      'import { useWeb3Context } from "@/contexts/Web3Context"'
    );
    modified = true;
  }
  
  // Replace hook usage
  if (content.includes('useWeb3()')) {
    content = content.replace(/useWeb3\(\)/g, 'useWeb3Context()');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${path.relative(process.cwd(), filePath)}`);
  }
});

console.log('Pages conversion complete!');
