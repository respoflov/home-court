import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import pkg from "./package.json" with { type: "json" }

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  // 설정 화면의 버전은 package.json 하나만 보고 따라간다
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-512-maskable.png"],
      manifest: {
        name: "홈코트",
        short_name: "홈코트",
        // 적지 않으면 플러그인이 lang: "en"을 넣는다. 기본 언어는 한국어다
        lang: "ko",
        description: "집에서 층간소음 없이 하는 홈트 루틴을 순서대로 따라가는 앱",
        start_url: "./",
        scope: "./",
        display: "standalone",
        background_color: "#0B0E15",
        theme_color: "#0B0E15",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
