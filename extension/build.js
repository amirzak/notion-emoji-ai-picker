const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isDev = process.argv.includes('--dev');

// Files to copy directly
const staticFiles = [
  'manifest.json',
  'popup.html',
  { from: 'icons', to: 'icons' }
];

// Files to bundle with esbuild
const jsFiles = ['content.js', 'popup.js'];

async function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
}

async function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function copyStaticFiles() {
  for (const file of staticFiles) {
    if (typeof file === 'string') {
      await copyFile(file, `dist/${file}`);
    } else {
      await copyDir(file.from, `dist/${file.to}`);
    }
  }
}

async function build() {
  try {
    // Clean dist directory
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true });
    }
    fs.mkdirSync('dist');

    // Copy static files
    await copyStaticFiles();

    // Bundle JS files
    await Promise.all(
      jsFiles.map(file => 
        esbuild.build({
          entryPoints: [file],
          outdir: 'dist',
          bundle: true,
          minify: !isDev,
          sourcemap: isDev,
          drop: isDev ? [] : ['console'],
          define: {
            'process.env.NODE_ENV': isDev ? '"development"' : '"production"'
          }
        })
      )
    );

    console.log('⚡ Build complete! Your extension is ready in the dist folder ⚡');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); 