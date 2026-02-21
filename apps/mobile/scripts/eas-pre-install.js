/**
 * EAS Build pre-install script for pnpm monorepo compatibility.
 *
 * Problem: EAS detects pnpm workspace and runs "npm ci" from the MONOREPO ROOT,
 * which only installs root-level deps (turbo, husky, etc). Expo packages like
 * expo-router are in apps/mobile/package.json and never get installed.
 *
 * Solution: Run npm install directly in apps/mobile during pre-install.
 * Since EAS's npm ci runs from root, it won't touch apps/mobile/node_modules,
 * so our pre-installed packages survive.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pkgPath = './package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

console.log('[eas-pre-install] Starting...');
console.log('[eas-pre-install] CWD:', process.cwd());

// Step 1: Remove workspace:* deps (npm can't resolve them from the registry)
const workspaceDeps = {};
for (const [name, version] of Object.entries(pkg.dependencies || {})) {
  if (typeof version === 'string' && version.startsWith('workspace:')) {
    workspaceDeps[name] = version;
    delete pkg.dependencies[name];
  }
}
console.log('[eas-pre-install] Removed workspace deps:', Object.keys(workspaceDeps));

// Step 2: Remove hooks that aren't needed during install
delete pkg.scripts['eas-build-post-install'];

// Step 3: Write modified package.json
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log('[eas-pre-install] Modified package.json written');

// Step 4: Remove stale lock files
try { fs.unlinkSync('package-lock.json'); } catch {}
console.log('[eas-pre-install] Cleaned stale lock files');

// Step 5: Run full npm install (not just lock file) in apps/mobile
console.log('[eas-pre-install] Running npm install --legacy-peer-deps...');
try {
  execSync('npm install --legacy-peer-deps', {
    stdio: 'inherit',
    timeout: 180000,
  });
  console.log('[eas-pre-install] npm install completed');
} catch (err) {
  console.error('[eas-pre-install] npm install failed:', err.message);
  process.exit(1);
}

// Step 6: Create symlinks for workspace packages
console.log('[eas-pre-install] Creating workspace package symlinks...');
for (const name of Object.keys(workspaceDeps)) {
  const shortName = name.replace('@ahub/', '');
  const symlinkTarget = path.resolve('../../packages', shortName);
  const symlinkPath = path.resolve('node_modules', name);

  // Ensure parent dir exists
  const parentDir = path.dirname(symlinkPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  // Remove existing if any
  try { fs.rmSync(symlinkPath, { recursive: true, force: true }); } catch {}

  // Create symlink
  try {
    fs.symlinkSync(symlinkTarget, symlinkPath, 'dir');
    console.log(`[eas-pre-install] Symlinked ${name} -> ${symlinkTarget}`);
  } catch (err) {
    console.error(`[eas-pre-install] Failed to symlink ${name}:`, err.message);
  }
}

// Step 7: Verify critical packages
const criticalPackages = ['expo-router', 'expo', 'react-native', 'expo-camera', 'expo-notifications'];
for (const pkg of criticalPackages) {
  const pkgDir = path.resolve('node_modules', pkg);
  if (fs.existsSync(pkgDir)) {
    console.log(`[eas-pre-install] ${pkg}: FOUND`);
  } else {
    console.error(`[eas-pre-install] ${pkg}: NOT FOUND!`);
  }
}

console.log('[eas-pre-install] Done!');
