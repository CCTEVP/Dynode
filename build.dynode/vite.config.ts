import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      pfx: fs.readFileSync("./cert/build.dynode.pfx"),
      passphrase: "password", // Use your actual passphrase
    },
    port: 4000,
  },
});
