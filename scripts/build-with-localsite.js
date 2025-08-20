#!/usr/bin/env node

/**
 * Build script that pulls localsite submodule into dist folder
 * Usage: node scripts/build-with-localsite.js
 */

import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import path from 'path';

const LOCALSITE_REPO = 'https://github.com/ModelEarth/localsite.git';
const DIST_LOCALSITE_PATH = './dist/localsite';

function log(message) {
  console.log(`[BUILD] ${message}`);
}

function runCommand(command, description) {
  log(description);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    log(`Error: ${error.message}`);
    process.exit(1);
  }
}

// 1. Run normal Vite build
log('Building feed application...');
runCommand('yarn build', 'Running Vite build');

// 2. Remove existing localsite if present
const localsiteExists = existsSync(DIST_LOCALSITE_PATH);
if (localsiteExists) {
  log('Removing existing localsite...');
  rmSync(DIST_LOCALSITE_PATH, { recursive: true, force: true });
}

// 3. Clone localsite directly into dist folder
log('Cloning localsite into dist/localsite...');
runCommand(
  `git clone --depth 1 ${LOCALSITE_REPO} ${DIST_LOCALSITE_PATH}`,
  'Cloning localsite repository'
);

// 4. Remove .git folder to clean up
log('Cleaning up localsite .git folder...');
const gitPath = path.join(DIST_LOCALSITE_PATH, '.git');
if (existsSync(gitPath)) {
  rmSync(gitPath, { recursive: true, force: true });
}

log('Build with localsite complete! 🎉');
log(`Localsite available at: ${DIST_LOCALSITE_PATH}`);