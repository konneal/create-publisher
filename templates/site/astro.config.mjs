import { defineConfig } from 'astro/config'
import vue from '@astrojs/vue'

// The client package ships Vue SFCs as source — Vite compiles them, so
// they stay out of the dependency pre-bundler.
export default defineConfig({
  integrations: [vue()],
  vite: { optimizeDeps: { exclude: ['@konneal/client'] } },
})
