import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const DEFAULT_URL = "https://fake-api.tractian.com";
const MODULE_PATH = "../../helpers/config";
const ENV_KEY = "VITE_API_BASE_URL";

type EnvStubUtils = {
  stubEnv?: (key: string, value: string) => void;
  unstubAllEnvs?: () => void;
};

const envStubs = vi as unknown as EnvStubUtils;

const deleteProcessEnv = () => {
  delete process.env[ENV_KEY];
};

const resetModule = async () => {
  vi.resetModules();
  return import(MODULE_PATH);
};

const clearEnv = () => {
  envStubs.unstubAllEnvs?.();
  deleteProcessEnv();
};

describe("config helper", () => {
  beforeEach(() => {
    clearEnv();
  });

  afterEach(() => {
    clearEnv();
  });

  it("uses the value defined in process.env", async () => {
    process.env[ENV_KEY] = "https://process-env.example";

    const { config } = await resetModule();

    expect(config.apiBaseUrl).toBe("https://process-env.example");
  });

  it("prefers import.meta.env over the default fallback", async () => {
    envStubs.stubEnv?.(ENV_KEY, "https://import-meta-env.example");

    const { config } = await resetModule();

    expect(config.apiBaseUrl).toBe("https://import-meta-env.example");
  });

  it("falls back to the default URL when env variables are empty", async () => {
    envStubs.stubEnv?.(ENV_KEY, "");

    const { config } = await resetModule();

    expect(config.apiBaseUrl).toBe(DEFAULT_URL);
  });
});
