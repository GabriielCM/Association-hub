const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

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
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web') {
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
