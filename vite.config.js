import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        proxy: {
            '/ingest': {
                target: 'https://us.i.posthog.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ingest/, ''),
            },
        },
    },
});
