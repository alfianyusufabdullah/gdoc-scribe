import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
    plugins: [
        dts({
            insertTypesEntry: true,
            include: ['src/vanilla', 'src/core']
        })
    ],
    build: {
        emptyOutDir: false, // Don't delete dist from main build
        lib: {
            entry: resolve(__dirname, 'src/index.vanilla.ts'),
            name: 'GDocScribeLib',
            fileName: (format) => `gdoc-scribe.vanilla.${format}.js`,
            formats: ['umd']
        }
    }
});
