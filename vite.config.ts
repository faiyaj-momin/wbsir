import fs from "fs"
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

function readLocalEnvValue(key: string): string {
  const envFiles = [
    path.resolve(__dirname, ".env.local"),
    path.resolve(__dirname, "env.local"),
  ];

  for (const filePath of envFiles) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const [currentKey, ...rest] = line.split("=");
      if (currentKey?.trim() === key) {
        return rest.join("=").trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }

  return "";
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  define: {
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(
      process.env.VITE_GEMINI_API_KEY ||
      process.env.GEMINI_KEY ||
      readLocalEnvValue("VITE_GEMINI_API_KEY") ||
      readLocalEnvValue("GEMINI_KEY")
    ),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
