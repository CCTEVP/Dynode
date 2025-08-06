import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow external connections (important for Docker)
    port: 4000,
    // Proxy API calls to your local source service
    proxy: {
      "/api": {
        target: "http://localhost:3333",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
//server: {
// https: {
//   pfx: fs.readFileSync("./cert/build.dynode.pfx"),
//   passphrase: "YourVeryStrongAndSecretPasswordHere",
// },
// port: 4000,
//}
