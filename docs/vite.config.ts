import react from '@vitejs/plugin-react'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import mdx from 'fumadocs-mdx/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'

export default defineConfig(async ({ command }) => ({
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: [
      'convex/react',
      'convex/server',
      'tailwind-merge',
      'prism-react-renderer',
      'date-fns',
      'fumadocs-ui/layouts/home',
      'fumadocs-ui/layouts/docs',
      'fumadocs-ui/provider/tanstack',
      'fumadocs-ui/page',
      'fumadocs-ui/mdx',
      'fumadocs-mdx/runtime/browser',
      'fumadocs-core/source/client'
    ]
  },
  plugins: [
    mdx(await import('./source.config')),
    tailwindcss(),
    tsConfigPaths({
      projects: ['./tsconfig.json']
    }),
    tanstackStart({
      prerender: {
        enabled: true
      }
    }),
    react(),
    command === 'build' && netlify()
  ]
}))
