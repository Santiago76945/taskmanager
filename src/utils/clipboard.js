// src/utils/clipboard.js

export async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text)
        // Opcional: mostrar notificación o log
        console.log('Texto copiado al portapapeles')
    } catch (err) {
        console.error('Error copiando al portapapeles:', err)
        // Puedes lanzar un error o gestionar visualmente
    }
}
