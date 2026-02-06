const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project root (monorepo root)
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// Exclude build artifacts from watching (but NOT node_modules/*/dist)
// Use [/\\] to match both forward and back slashes (Windows/Unix)
config.resolver.blockList = [
  /apps[/\\]api[/\\]dist[/\\].*/,
  /apps[/\\]web[/\\]\.next[/\\].*/,
  /packages[/\\][^/\\]+[/\\]dist[/\\].*/,
  /.*[/\\]\.git[/\\].*/,
];

// Let Metro know where to resolve packages from
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Force resolving nested modules to the root node_modules
config.resolver.disableHierarchicalLookup = true;

// Tamagui support
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

// Tamagui v2 resolveRequest hook for proper module resolution
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
    return context.resolveRequest(context, moduleName, platform);
  }

  const isTamagui =
    moduleName === 'tamagui' ||
    moduleName.startsWith('tamagui/') ||
    moduleName.startsWith('@tamagui/');

  if (isTamagui) {
    return context.resolveRequest(
      {
        ...context,
        unstable_conditionNames: ['react-native', 'require', 'default'],
      },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
