import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Keep this import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // Keep this plugin
  ],
  // --- ADD THIS 'preview' BLOCK ---
  preview: {
    host: true, // Ensures Vite listens on 0.0.0.0 for Render
    port: process.env.PORT || 4173, // Use Render's assigned PORT, or default locally
    strictPort: true,
    allowedHosts: [
      'localhost', // For local testing
      'chat-app-client-6wl7.onrender.com' // <-- ADD YOUR DEPLOYED CLIENT URL HERE
    ],
  }
  // --- END 'preview' BLOCK ---
});