import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  define: {
    // Ensure import.meta.env is available
    'import.meta.env': 'import.meta.env',
  },
  envPrefix: ['VITE_'],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion'],
          charts: ['recharts'],
          supabase: ['@supabase/supabase-js'],
          radix: ['@radix-ui/react-slot', '@radix-ui/react-dropdown-menu', '@radix-ui/react-avatar']
        }
      }
    }
  },
  server: {
    port: 3000,
    host: true,
    open: true
  },
  preview: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      '@supabase/supabase-js',
      'recharts',
      'sonner'
    ]
  }
})