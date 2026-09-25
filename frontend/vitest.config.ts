import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-results/vitest-junit.xml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      reportsDirectory: './test-results/coverage',
      include: [
        'src/api/axios.ts',
        'src/context/**',
        'src/utils/**',
        'src/App.tsx',
        'src/pages/auth/**',
        'src/components/common/SessionChangedModal.tsx',
        'src/components/common/Toast.tsx',
      ],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts', 'src/test/**'],
    },
  },
});
