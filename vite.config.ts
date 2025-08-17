import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/green-escape-adventure-kids/' : '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // Keep lovable-uploads in their own directory
          if (assetInfo.name && assetInfo.name.includes('lovable-uploads')) {
            return 'lovable-uploads/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
    emptyOutDir: true,
    // Ensure all public assets are copied
    copyPublicDir: true,
  },
  // Ensure public directory assets are served correctly
  publicDir: 'public',
}));
