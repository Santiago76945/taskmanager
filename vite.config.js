// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    // Directorio de archivos estáticos
    publicDir: 'public',
    // Plugins
    plugins: [react()],
    // Opciones de build
    build: {
        outDir: 'dist',       // Carpeta de salida
        emptyOutDir: true,    // Limpia dist antes de cada build
    },
    // Configuración del servidor de desarrollo
    server: {
        port: 3000,           // Puerto local
        open: true,           // Abre el navegador al iniciar
    }
})
