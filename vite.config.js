// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    publicDir: 'public',
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
    },
    server: {
        port: 3000,
        open: false, // no abre automáticamente en :3000
        proxy: {
            // Redirige las llamadas a Netlify Functions al servidor de netlify dev en el puerto 8888
            '/.netlify/functions': {
                target: 'http://localhost:8888',
                changeOrigin: true,
                rewrite: path => path.replace(/^\/.netlify\/functions/, '/.netlify/functions'),
            },
        },
    },
})
