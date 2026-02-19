const path = require('path');

const monorepoRoot = path.resolve(__dirname, '../..');

/**
 * Resolve an Expo config plugin, checking local node_modules first,
 * then falling back to monorepo root node_modules.
 * Needed for EAS Build with pnpm monorepos.
 */
function resolvePlugin(pluginEntry) {
  if (Array.isArray(pluginEntry)) {
    const [name, options] = pluginEntry;
    return [resolvePluginName(name), options];
  }
  return resolvePluginName(pluginEntry);
}

function resolvePluginName(name) {
  const searchPaths = [__dirname, monorepoRoot];
  for (const searchPath of searchPaths) {
    try {
      const pkgJsonPath = require.resolve(name + '/package.json', {
        paths: [searchPath],
      });
      return path.dirname(pkgJsonPath);
    } catch {
      // continue
    }
  }
  return name;
}

module.exports = {
  expo: {
    name: 'A-hub',
    slug: 'ahub',
    version: '0.1.0',
    orientation: 'portrait',
    scheme: 'ahub',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash-logo.png',
      resizeMode: 'contain',
      backgroundColor: '#8B5CF6',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.ahub.app',
      infoPlist: {
        NSFaceIDUsageDescription:
          'Usamos Face ID para autenticação rápida e segura.',
        NSCameraUsageDescription:
          'Permitir que A-hub acesse sua camera para escanear QR Codes.',
      },
    },
    androidNavigationBar: {
      barStyle: 'light-content',
      backgroundColor: '#0D0520',
    },
    android: {
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#8B5CF6',
      },
      package: 'com.ahub.app',
      permissions: [
        'USE_BIOMETRIC',
        'USE_FINGERPRINT',
        'CAMERA',
        'android.permission.USE_BIOMETRIC',
        'android.permission.USE_FINGERPRINT',
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
      ],
    },
    web: {
      bundler: 'metro',
      output: 'static',
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      [
        'expo-local-authentication',
        {
          faceIDPermission:
            'Permitir que A-hub use Face ID para autenticação.',
        },
      ],
      'expo-asset',
      'expo-font',
      [
        'expo-camera',
        {
          cameraPermission:
            'Permitir que A-hub acesse sua camera para escanear QR Codes.',
        },
      ],
      [
        'expo-av',
        {
          microphonePermission:
            'Permitir que A-hub grave mensagens de áudio.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Permitir que A-hub acesse sua galeria de fotos para enviar imagens.',
          cameraPermission:
            'Permitir que A-hub acesse sua câmera para tirar fotos.',
        },
      ],
      [
        'expo-notifications',
        {
          icon: './assets/notification-icon.png',
          color: '#8B5CF6',
        },
      ],
      [
        '@stripe/stripe-react-native',
        {
          merchantIdentifier: 'merchant.com.ahub.app',
          enableGooglePay: true,
        },
      ],
    ].map(resolvePlugin),
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: '9338501a-68c6-4a67-af2c-3b64fa97f07e',
      },
    },
  },
};
