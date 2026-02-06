import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    exclude: ['node_modules', '.expo'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/providers/**',
        'src/hooks/useAuth.ts',
        'src/hooks/useUser.ts',
        'src/hooks/useBiometrics.ts',
        'src/services/api/**',
        'src/services/storage/**',
        'src/services/websocket/**',
        'src/components/**',
        'src/config/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ahub/shared/types': path.resolve(
        __dirname,
        '../../packages/shared/src/types/index.ts'
      ),
      '@ahub/shared/validation': path.resolve(
        __dirname,
        '../../packages/shared/src/validation/index.ts'
      ),
      '@ahub/shared/utils': path.resolve(
        __dirname,
        '../../packages/shared/src/utils/index.ts'
      ),
    },
  },
});
