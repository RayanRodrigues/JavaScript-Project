import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Separate from vite.config.ts to avoid Plugin type mismatch between
// Vite 8 (rolldown) and Vitest 3's bundled Vite 6 (rollup).
// tsconfig.node.json only includes vite.config.ts, so tsc never checks this file.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
