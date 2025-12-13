import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(async () => {
  let tailwindcssPlugin = undefined
  try {
    const mod = await import('@tailwindcss/vite')
    tailwindcssPlugin = mod.default()
  } catch (_) {}
  return {
    plugins: tailwindcssPlugin ? [react(), tailwindcssPlugin] : [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
