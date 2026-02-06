import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    exclude: ['node_modules', '.next'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.spec.tsx',
        'src/components/ui/**',
        'src/lib/providers/**',
        'src/lib/hooks/useAuth.ts',
        'src/lib/hooks/useUser.ts',
        'src/lib/websocket/**',
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
