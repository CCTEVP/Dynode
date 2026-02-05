// Static config ONLY (no .env usage) for render.dynode
export type AppEnv =
  | "development"
  | "staging"
  | "production"
  | "test"
  | "docker";
// Hold raw current env label here (edit manually to switch)
const CURRENT_ENV = "development" as const; // change this string only (also supports 'docker')
const APP_ENV = CURRENT_ENV as AppEnv;

interface RenderConfig {
  env: AppEnv;
  port: number;
  externalOrigins: { source: string; render: string };
  internalServices: { source: string; render: string };
  serviceWorkers: "enabled" | "disabled";
  https: boolean;
  jwtSecret?: string;
}

// Fixed literal values (no environment variable fallbacks)
const FIXED_PORT = 5555; // chosen to align with docker-compose & docs
const base: Omit<RenderConfig, "env"> = {
  port: FIXED_PORT,
  externalOrigins: {
    source: "http://localhost:3333",
    render: "http://localhost:5555",
  },
  internalServices: {
    source: "http://localhost:3333",
    render: "http://localhost:5555",
  },
  serviceWorkers: "disabled",
  https: false,
  jwtSecret: "your_super_secret_key",
};

let envOverrides: Partial<RenderConfig> = {};
switch (APP_ENV) {
  case "production":
    envOverrides = {
      https: true,
      externalOrigins: {
        source: "https://source.prod.dynode.example",
        render: "https://render.prod.dynode.example",
      },
      internalServices: {
        source: "https://source.prod.dynode.example",
        render: "https://render.prod.dynode.example",
      },
      serviceWorkers: "enabled",
    };
    break;
  case "staging":
    envOverrides = {
      https: true,
      externalOrigins: {
        source: "https://source.staging.dynode.example",
        render: "https://render.staging.dynode.example",
      },
      internalServices: {
        source: "https://source.staging.dynode.example",
        render: "https://render.staging.dynode.example",
      },
      serviceWorkers: "enabled",
    };
    break;
  case "test":
    envOverrides = {
      https: false,
      externalOrigins: {
        source: "http://localhost:3333",
        render: "http://localhost:5555",
      },
      internalServices: {
        source: "http://localhost:3333",
        render: "http://localhost:5555",
      },
    };
    break;
  case "docker":
    envOverrides = {
      https: false,
      port: 80,
      externalOrigins: {
        source: "http://localhost:3000",
        render: "http://localhost:5000",
      },
      internalServices: {
        source: "http://source",
        render: "http://render",
      },
      serviceWorkers: "disabled",
    };
    break;
  case "development":
  default:
    // already covered by base
    break;
}

const config: RenderConfig = { env: APP_ENV, ...base, ...envOverrides };

// Lightweight summary (no secrets) for startup debugging
if (config.env === "development") {
  console.log("🔧 render.dynode config (static):", config);
}

export default config;
// Helper accessors for symmetry with build/source
export function getSourceApiBase() {
  return config.env === "docker"
    ? config.internalServices.source
    : config.externalOrigins.source;
}
export function getRenderPublicBase() {
  return config.externalOrigins.render;
}
