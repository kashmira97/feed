import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'
import { existsSync, rmSync } from 'fs'

// Custom plugin to pull localsite
function localsitePlugin(options = {}) {
  return {
    name: 'localsite-puller',
    buildStart() {
      const { preserve = false } = options;
      const localsitePath = './dist/localsite';
      
      if (existsSync(localsitePath) && preserve) {
        console.log('[LocalSite] Preserving existing localsite folder');
        return;
      }
      
      console.log('[LocalSite] Pulling latest localsite...');
      
      // Remove existing
      if (existsSync(localsitePath)) {
        rmSync(localsitePath, { recursive: true, force: true });
      }
      
      // Clone fresh copy
      try {
        execSync(
          'git clone --depth 1 https://github.com/ModelEarth/localsite.git dist/localsite',
          { stdio: 'pipe' }
        );
        
        // Clean up .git folder
        const gitPath = './dist/localsite/.git';
        if (existsSync(gitPath)) {
          rmSync(gitPath, { recursive: true, force: true });
        }
        
        console.log('[LocalSite] ✅ LocalSite pulled successfully');
      } catch (error) {
        console.error('[LocalSite] ❌ Failed to pull localsite:', error.message);
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    localsitePlugin({ preserve: process.env.PRESERVE_LOCALSITE === 'true' })
  ],
  // ... rest of your config
})