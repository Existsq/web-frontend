import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import mkcert from "vite-plugin-mkcert";
import fs from "fs";
import path from "path";

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert.crt")),
    },
    host: true,
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: "",
        cookiePathRewrite: "/",
        configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
            if (req.headers.cookie) {
              proxyReq.setHeader("Cookie", req.headers.cookie);
            }
          });
          proxy.on("proxyRes", (proxyRes) => {
            const setCookieHeaders = proxyRes.headers["set-cookie"];
            if (setCookieHeaders) {
              const modifiedCookies = Array.isArray(setCookieHeaders)
                ? setCookieHeaders.map((cookie) => {
                    return cookie
                      .replace(/Domain=[^;]+/gi, "")
                      .replace(/Secure/gi, "Secure")
                      .replace(/SameSite=None/gi, "SameSite=None");
                  })
                : setCookieHeaders;
              
              proxyRes.headers["Set-Cookie"] = modifiedCookies;
            }
          });
        },
      },
    },
  },
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Расчет ИПЦ",
        short_name: "ИПЦ",
        description: "Веб-приложение для расчета индекса потребительских цен",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "./",
         icons: [
          {
            src: "/public/images/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/public/images/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg}"],
      },
    }),
  ],
  base: process.env.TAURI_ENV_PLATFORM ? "./" : "/web-frontend/",
});
