import fs from 'fs';
import path from 'path';

const filesToUpdate = [
  'frontend/src/pages/Favorites.tsx',
  'frontend/src/pages/Home.tsx',
  'frontend/src/pages/ProductDetail.tsx',
  'frontend/src/pages/ProductsPage.tsx'
];

for (const file of filesToUpdate) {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace getApiUrl import with both getApiUrl and getMediaUrl
  content = content.replace(/import { getApiUrl } from ["']@\/utils\/apiUrl["'];?/, 'import { getApiUrl, getMediaUrl } from "@/utils/apiUrl";');

  // If it didn't have getApiUrl, add getMediaUrl
  if (!content.includes('getMediaUrl')) {
      content = 'import { getMediaUrl } from "@/utils/apiUrl";\n' + content;
  }

  // Find the cleanImageUrl block and replace it
  const cleanImageRegex = /function cleanImageUrl[\s\S]*?return decoded;\s*\}\s*catch\s*\{\s*return null;\s*\}\s*\}/g;

  content = content.replace(cleanImageRegex, 'const cleanImageUrl = getMediaUrl;');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated images in ${file}`);
}
