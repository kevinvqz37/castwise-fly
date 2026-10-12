import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        // Libraries change far less often than the app, so keep them in their own files:
        // returning visitors re-download only the app chunk after a deploy.
        codeSplitting: {
          groups: [
            { name: 'vendor-data', test: /node_modules[\\/](@firebase|firebase)[\\/]/ },
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
})
