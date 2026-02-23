import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/twice/",   // ← doit correspondre au nom de ton repo GitHub
});
