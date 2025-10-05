const DEFAULT_API_BASE_URL = "https://fake-api.tractian.com";

type EnvRecord = Record<string, string | undefined>;

type ImportMetaWithEnv = ImportMeta & { env?: EnvRecord };

const getRuntimeEnv = (): EnvRecord => {
  const fromImportMeta =
    typeof import.meta !== "undefined"
      ? ((import.meta as ImportMetaWithEnv).env ?? {})
      : {};

  const fromProcess =
    typeof globalThis !== "undefined" && "process" in globalThis
      ? ((globalThis.process as { env?: EnvRecord })?.env ?? {})
      : {};

  return { ...fromImportMeta, ...fromProcess };
};

const env = getRuntimeEnv();

const getEnvValue = (key: keyof EnvRecord, fallback?: string): string => {
  const value = env[key as string];

  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof fallback === "string") {
    return fallback;
  }

  throw new Error(
    `Missing required environment variable "${key as string}" and no fallback provided.`,
  );
};

export const config = {
  apiBaseUrl: getEnvValue("VITE_API_BASE_URL", DEFAULT_API_BASE_URL),
};

export type AppConfig = typeof config;
