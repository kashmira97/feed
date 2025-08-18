import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; // To get __dirname-like functionality

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  
  return {
    plugins: [
      react(),
      {
        name: 'handle-html',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/' || req.url === '/index.html') {
              req.url = '/feedplayer.html';
            }
            next();
          });
        },
        transformIndexHtml(html, { filename }) {
          if (isDev && path.basename(filename) === 'index.html') {
            return fs.readFileSync('./feedplayer.html', 'utf-8');
          }
          return html;
        },
      },
      {
        name: 'rename-html',
        apply: 'build',
        writeBundle() {
          const oldPath = path.resolve(__dirname, 'dist/feedplayer.html');
          const newPath = path.resolve(__dirname, 'dist/index.html');

          if (fs.existsSync(oldPath)) {
            fs.renameSync(oldPath, newPath);
          }
        },
      },
      {
        name: 'copy-src-assets',
        apply: 'build',
        writeBundle() {
          const srcAssetsPath = path.resolve(__dirname, 'src/assets');
          const distAssetsPath = path.resolve(__dirname, 'dist/assets');

          function copyRecursive(src, dest) {
            if (!fs.existsSync(src)) return;
            
            const stats = fs.statSync(src);
            if (stats.isDirectory()) {
              if (!fs.existsSync(dest)) {
                fs.mkdirSync(dest, { recursive: true });
              }
              const items = fs.readdirSync(src);
              items.forEach(item => {
                copyRecursive(path.join(src, item), path.join(dest, item));
              });
            } else {
              const destDir = path.dirname(dest);
              if (!fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
              }
              fs.copyFileSync(src, dest);
            }
          }

          copyRecursive(srcAssetsPath, distAssetsPath);
        },
      },
    ],
    base: '',
    build: {
      rollupOptions: {
        input: './feedplayer.html',
        output: {
          assetFileNames: 'assets/[name].[ext]',
          chunkFileNames: 'assets/[name].js',
          entryFileNames: 'assets/[name].js',
        },
      },
    },
  };
});