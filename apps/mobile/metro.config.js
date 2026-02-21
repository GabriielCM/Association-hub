const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch all packages
config.watchFolders = [monorepoRoot];

// Monorepo: resolve node_modules from root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Exclude build artifacts from watching
config.resolver.blockList = [
  /apps[/\\]api[/\\]dist[/\\].*/,
  /apps[/\\]web[/\\]\.next[/\\].*/,
];

// Tamagui support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Tamagui v2 resolveRequest hook for proper module resolution.
// Adds 'react-native' condition so Tamagui's package.json "exports" resolves
// to .native.js files instead of web .mjs files.
// Native-only modules that need a web shim to avoid bundler errors
const NATIVE_ONLY_MODULES = [
  'react-native-pager-view',
  '@stripe/stripe-react-native',
];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    if (NATIVE_ONLY_MODULES.includes(moduleName)) {
      return {
        type: 'sourceFile',
        filePath: path.resolve(projectRoot, 'src/shims/empty-native-module.web.js'),
      };
    }
    return context.resolveRequest(context, moduleName, platform);
  }

  const isTamagui =
    moduleName === 'tamagui' ||
    moduleName.startsWith('tamagui/') ||
    moduleName.startsWith('@tamagui/');

  if (isTamagui) {
    const existing = context.unstable_conditionNames || [];
    if (!existing.includes('react-native')) {
      return context.resolveRequest(
        {
          ...context,
          unstable_conditionNames: ['react-native', ...existing],
        },
        moduleName,
        platform
      );
    }
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
