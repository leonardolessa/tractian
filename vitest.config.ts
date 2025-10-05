import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig(async (configEnv) => {
  const resolvedViteConfig =
    typeof viteConfig === "function"
      ? await viteConfig({
          ...configEnv,
          mode: configEnv.mode ?? "test",
          command: configEnv.command ?? "serve",
        })
      : viteConfig;

  return mergeConfig(resolvedViteConfig, {
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "src/tests/e2e/**"],
      coverage: {
        provider: "v8",
        reporter: ["text", "lcov", "json-summary"],
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          ...(configDefaults.coverage?.exclude ?? []),
          "src/tests/**",
          "src/types/**",
        ],
        thresholds: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80,
        },
      },
    },
  });
});
