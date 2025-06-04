import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  onSuccess: "tsc --noEmit",
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
      "@components": "./src/components",
      "@utils": "./src/utils",
      "@types": "./src/types",
    };
  },
});
