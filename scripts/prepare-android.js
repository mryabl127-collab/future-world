import fs from 'fs';
import path from 'path';

async function prerender() {
  const candidates = [
    path.resolve('.output/server/index.mjs'),
    path.resolve('dist/server/index.mjs')
  ];
  let serverEntry = candidates.find(p => fs.existsSync(p));

  if (!serverEntry) {
    console.error('Server build not found in candidates:', candidates);
    process.exit(1);
  }

  console.log('Using server bundle at:', serverEntry);

  const clientDir = path.resolve('dist/client');
  const outputPublic = path.resolve('.output/public');

  if (fs.existsSync(outputPublic) && !fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
    fs.cpSync(outputPublic, clientDir, { recursive: true });
  } else if (!fs.existsSync(clientDir)) {
    fs.mkdirSync(clientDir, { recursive: true });
  }

  if (fs.existsSync(outputPublic)) {
    fs.cpSync(outputPublic, clientDir, { recursive: true });
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
    { url: '/community', file: 'community/index.html' },
  ];

  for (const r of routes) {
    try {
      const res = await server.default.fetch(new Request('http://localhost' + r.url), env);
      if (res.status === 200) {
        let html = await res.text();
        const targets = [
          path.join(clientDir, r.file),
          ...(fs.existsSync(outputPublic) ? [path.join(outputPublic, r.file)] : [])
        ];
        for (const dest of targets) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, html, 'utf8');
        }
        console.log(`Prerendered ${r.url} (${html.length} bytes)`);
      } else {
        console.warn(`Failed to render ${r.url}: status ${res.status}`);
      }
    } catch (err) {
      console.error(`Error prerendering ${r.url}:`, err);
    }
  }

  const fallback = path.join(clientDir, '404.html');
  const indexFile = path.join(clientDir, 'index.html');
  if (fs.existsSync(indexFile)) {
    fs.copyFileSync(indexFile, fallback);
  }
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
