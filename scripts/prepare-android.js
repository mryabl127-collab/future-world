import fs from 'fs';
import path from 'path';

async function prerender() {
  const clientDir = path.resolve('dist/client');
  if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  const serverEntry = path.resolve('dist/server/index.mjs');
  if (!fs.existsSync(serverEntry)) {
    console.error('Server build not found at', serverEntry);
    process.exit(1);
  }

  const server = await import(`file://${serverEntry}`);
  const env = { ASSETS: { fetch: (req) => fetch(req) } };

  const routes = [
    { url: '/', file: 'index.html' },
    { url: '/academy', file: 'academy/index.html' },
    { url: '/assistant', file: 'assistant/index.html' },
    { url: '/scan', file: 'scan/index.html' },
    { url: '/alerts', file: 'alerts/index.html' },
    { url: '/device', file: 'device/index.html' },
    { url: '/history', file: 'history/index.html' },
    { url: '/internet', file: 'internet/index.html' },
    { url: '/library', file: 'library/index.html' },
    { url: '/settings', file: 'settings/index.html' },
  ];

  for (const r of routes) {
    try {
      const res = await server.default.fetch(new Request('http://localhost' + r.url), env);
      if (res.status === 200) {
        let html = await res.text();
        const dest = path.join(clientDir, r.file);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.writeFileSync(dest, html, 'utf8');
        console.log(`Prerendered ${r.url} -> ${dest} (${html.length} bytes)`);
      } else {
        console.warn(`Failed to render ${r.url}: status ${res.status}`);
      }
    } catch (err) {
      console.error(`Error prerendering ${r.url}:`, err);
    }
  }

  // Ensure 404 / fallback index.html exists
  const fallback = path.join(clientDir, '404.html');
  const indexFile = path.join(clientDir, 'index.html');
  if (fs.existsSync(indexFile) && !fs.existsSync(fallback)) {
    fs.copyFileSync(indexFile, fallback);
  }
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
