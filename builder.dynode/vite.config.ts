import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external connections (important for Docker)
    port: 4444,
    // Proxy API calls to your local source service
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    cssMinify: false, // Disable CSS minification temporarily
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom"],
          router: ["react-router-dom"],
          antd: ["antd"],
          icons: ["@ant-design/icons"],

          // Your app chunks
          components: [
            "./src/components/controls/DataCard/index.ts",
            "./src/components/controls/ComponentFilter/index.ts",
            "./src/components/controls/Link/index.ts",
          ],
          pages: [
            "./src/pages/Home/Default.tsx",
            "./src/pages/Help/Components/Default.tsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Adjust warning threshold
  },
});
//server: {
// https: {
//   pfx: fs.readFileSync("./cert/build.dynode.pfx"),
//   passphrase: "YourVeryStrongAndSecretPasswordHere",
// },
// port: 4000,
//}
