import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist!');
  process.exit(1);
}

const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html does not exist!');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexPath, 'utf-8');

// Copy 200.html for hosting platforms that support standard SPA fallback
fs.writeFileSync(path.join(distDir, '200.html'), indexHtml);

// Essential application SPA routes
const routes = [
  'dossiers',
  'documents',
  'ask',
  'upload',
  'incidents',
  'admin',
  'login',
  'mfa',
  'custody'
];

for (const route of routes) {
  // 1. Write route.html
  const fileHtmlPath = path.join(distDir, `${route}.html`);
  fs.writeFileSync(fileHtmlPath, indexHtml);

  // 2. Write route/index.html
  const routeFolder = path.join(distDir, route);
  if (!fs.existsSync(routeFolder)) {
    fs.mkdirSync(routeFolder, { recursive: true });
  }
  fs.writeFileSync(path.join(routeFolder, 'index.html'), indexHtml);
}

console.log('✓ SPA static route fallbacks successfully generated for:', routes.join(', '));
