import fs from 'fs';
import path from 'path';

const clientDir = path.resolve('dist/client');
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

const indexPath = path.join(clientDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>FUTURE WORLD</title>
  <link rel="icon" href="favicon.ico">
</head>
<body class="bg-background text-foreground">
  <div id="root"></div>
</body>
</html>`;
  fs.writeFileSync(indexPath, html, 'utf-8');
  console.log('Created dist/client/index.html for Capacitor');
}
