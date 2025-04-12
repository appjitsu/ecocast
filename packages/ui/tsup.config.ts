import { resolve } from 'path';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: {
    compilerOptions: {
      moduleResolution: 'NodeNext',
      esModuleInterop: true,
      jsx: 'react-jsx',
      jsxImportSource: 'react',
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.resolveExtensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];
    options.mainFields = ['module', 'main'];
    options.alias = {
      '@': resolve(__dirname, 'src'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/lib': resolve(__dirname, 'src/lib'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
    };
  },
  external: ['react', 'react-dom'],
});
