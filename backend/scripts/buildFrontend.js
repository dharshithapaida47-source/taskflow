// Postinstall hook: builds the React frontend and copies the build output
// into backend/public/ so it ends up inside Railway's root directory and
// is included in the runtime container.
//
// Skip with `SKIP_FRONTEND_BUILD=1 npm install` when working purely on the
// backend (saves ~3-5 minutes of frontend rebuild).

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.env.SKIP_FRONTEND_BUILD) {
  console.log('[postinstall] SKIP_FRONTEND_BUILD is set — skipping frontend build');
  process.exit(0);
}

const frontendDir = path.join(__dirname, '..', '..', 'frontend');
const frontendPkg = path.join(frontendDir, 'package.json');
const buildDir = path.join(frontendDir, 'build');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(frontendPkg)) {
  console.log('[postinstall] frontend/package.json not found, skipping');
  process.exit(0);
}

console.log('[postinstall] Building React frontend at', frontendDir);

try {
  execSync('npm install --legacy-peer-deps', { cwd: frontendDir, stdio: 'inherit' });
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
} catch (err) {
  console.error('[postinstall] Frontend build failed:', err.message);
  process.exit(1);
}

// Copy build output into backend/public so it lives inside Railway's
// root directory. Recursive copy is fine — Node 16+ supports cpSync.
console.log('[postinstall] Copying', buildDir, '->', publicDir);

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.cpSync(buildDir, publicDir, { recursive: true });

console.log('[postinstall] ✓ Frontend build ready at', publicDir);
