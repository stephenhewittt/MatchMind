import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Relative base so the build works whether served from the domain root
// or a project sub-path (e.g. GitHub Pages /matchmind/). Safe with HashRouter.
export default defineConfig({
  base: "./",
  plugins: [react()],
});
