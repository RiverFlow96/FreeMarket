import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'frontend/src/components/ReportModal.tsx',
  'frontend/src/pages/Favorites.tsx',
  'frontend/src/pages/Home.tsx',
  'frontend/src/pages/Login.tsx',
  'frontend/src/pages/ProductDetail.tsx',
  'frontend/src/pages/ProductsPage.tsx',
  'frontend/src/pages/Register.tsx',
  'frontend/src/pages/SellProduct.tsx',
  'frontend/src/store/authStore.ts'
];

for (const file of filesToUpdate) {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add import if not present
  if (!content.includes('getApiUrl')) {
    // Find the last import statement or the beginning of the file
    const importMatch = content.match(/import.*?;?\n/g);
    let importPos = 0;
    if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        importPos = content.lastIndexOf(lastImport) + lastImport.length;
    }

    // Determine relative path to getApiUrl
    const dirDepth = file.split('/').length - 3; // frontend/src/ = 2. minus 1 for root
    let relativePath = '';
    if (dirDepth === 0) relativePath = './utils/apiUrl';
    else if (dirDepth === 1) relativePath = '../utils/apiUrl';
    else if (dirDepth === 2) relativePath = '../../utils/apiUrl';

    // Specifically for absolute import
    content = `import { getApiUrl } from "@/utils/apiUrl";\n` + content;
  }

  // Replace fetch("/api/v1/...") with fetch(getApiUrl("/api/v1/..."))
  content = content.replace(/fetch\((["'`]\/api\/v1[^"'`]*["'`])\)/g, 'fetch(getApiUrl($1))');
  content = content.replace(/fetch\((["'`]\/api\/v1[^"'`]*["'`]),/g, 'fetch(getApiUrl($1),');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
