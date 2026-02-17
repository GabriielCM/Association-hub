/**
 * Patches @expo/cli AsyncNgrok.js to support custom NGROK_AUTHTOKEN env var.
 *
 * The Expo CLI hardcodes a shared ngrok authtoken that is shared among ALL
 * Expo users worldwide. When too many users connect simultaneously, ngrok
 * returns ERR_NGROK_108 (session limit exceeded), causing the tunnel to fail.
 *
 * This patch makes AsyncNgrok.js check for a NGROK_AUTHTOKEN environment
 * variable first, falling back to the shared token if not set.
 *
 * Usage:
 *   1. Sign up at https://ngrok.com (free)
 *   2. Copy your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
 *   3. Add to apps/mobile/.env: NGROK_AUTHTOKEN=your_token_here
 *   4. Run: npx expo start --tunnel
 */
const fs = require('fs');
const path = require('path');

const ASYNC_NGROK_PATH = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'AsyncNgrok.js'
);

const SHARED_TOKEN = '5W1bR67GNbWcXqmxZzBG1_56GezNeaX6sSRvn8npeQ8';
const PATCHED_LINE = `    authToken: process.env.NGROK_AUTHTOKEN || '${SHARED_TOKEN}',`;

try {
  if (!fs.existsSync(ASYNC_NGROK_PATH)) {
    console.log('[patch-expo-ngrok] AsyncNgrok.js not found, skipping patch.');
    process.exit(0);
  }

  let content = fs.readFileSync(ASYNC_NGROK_PATH, 'utf8');

  if (content.includes('process.env.NGROK_AUTHTOKEN')) {
    console.log('[patch-expo-ngrok] Already patched, skipping.');
    process.exit(0);
  }

  const original = `    authToken: '${SHARED_TOKEN}',`;
  if (!content.includes(original)) {
    console.log('[patch-expo-ngrok] Could not find hardcoded token line, skipping.');
    process.exit(0);
  }

  content = content.replace(original, PATCHED_LINE);
  fs.writeFileSync(ASYNC_NGROK_PATH, content, 'utf8');
  console.log('[patch-expo-ngrok] Patched successfully! Set NGROK_AUTHTOKEN env var to use your personal token.');
} catch (err) {
  console.error('[patch-expo-ngrok] Failed to patch:', err.message);
  process.exit(0); // Don't fail the install
}
