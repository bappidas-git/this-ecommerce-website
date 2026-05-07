import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === 'analyze') {
    const { visualizer } = await import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'dist/bundle-stats.html',
        gzipSize: true,
        brotliSize: true,
        template: 'treemap',
        open: false,
      }),
    );
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(dirname, 'src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return undefined;
            if (id.includes('recharts') || id.includes('/d3-')) return 'admin-charts';
            if (id.includes('@mui/x-data-grid')) return 'admin-datagrid';
            if (id.includes('@mui/x-date-pickers')) return 'admin-datepickers';
            if (id.includes('framer-motion')) return 'framer-motion';
            if (id.includes('react-router')) return 'react-router';
            if (
              id.includes('react-hook-form') ||
              id.includes('/yup/') ||
              id.includes('@hookform')
            )
              return 'forms';
            return undefined;
          },
        },
      },
    },
  };
});
