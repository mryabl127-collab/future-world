import fs from 'fs';
import path from 'path';

async function prepareAndroid() {
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

  const liveUrl = 'https://green-map-smart-clean.lovable.app';
  const launcherHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>FUTURE WORLD</title>
  <link rel="icon" href="favicon.ico">
  <style>
    body {
      margin: 0;
      background: #030712;
      color: #00f0ff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(0, 240, 255, 0.15);
      border-top-color: #00f0ff;
      border-radius: 50%;
      animation: spin 0.8s ease-in-out infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .title { margin-top: 16px; font-size: 14px; letter-spacing: 0.15em; color: #94a3b8; font-weight: 600; }
  </style>
</head>
<body class="bg-background text-foreground">
  <div class="spinner"></div>
  <div class="title">FUTURE WORLD</div>
  <script type="module">
    window.location.replace("${liveUrl}" || "/");
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(clientDir, 'index.html'), launcherHtml, 'utf8');
  fs.writeFileSync(path.join(clientDir, '404.html'), launcherHtml, 'utf8');

  // Also write to android assets if they exist
  const androidPublic = path.resolve('android/app/src/main/assets/public');
  if (fs.existsSync(androidPublic)) {
    fs.writeFileSync(path.join(androidPublic, 'index.html'), launcherHtml, 'utf8');
    fs.writeFileSync(path.join(androidPublic, '404.html'), launcherHtml, 'utf8');
  }

  console.log('Android assets prepared with live URL launcher:', liveUrl);
}

prepareAndroid().catch((err) => {
  console.error('Prepare Android failed:', err);
  process.exit(1);
});
