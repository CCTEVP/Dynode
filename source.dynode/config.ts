// Central static configuration (no .env dependency)
// Switch environments by editing APP_ENV below (or automate via build scripts if desired).
// NOTE: Embedding secrets (JWT, prod Mongo URI) in code is generally discouraged; placeholders used.

export type AppEnv =
  | "development"
  | "production"
  | "staging"
  | "test"
  | "docker";

// Change this single value to switch environment.
// Add 'docker' to use the internal Docker network Mongo host (mongo) instead of localhost.
// Auto-detect Docker environment or use explicit setting
const getAppEnv = (): AppEnv => {
  // Check for explicit environment setting first
  const explicitEnv = process.env.APP_ENV as AppEnv;
  if (
    explicitEnv &&
    ["development", "production", "staging", "test", "docker"].includes(
      explicitEnv,
    )
  ) {
    return explicitEnv;
  }

  // Auto-detect Docker environment
  const isDocker =
    process.env.DOCKER_ENV === "true" ||
    process.env.RUNNING_IN_DOCKER === "true" ||
    require("fs").existsSync("/.dockerenv");

  if (isDocker) {
    return "docker";
  }

  // Default fallback
  return "development";
};

const APP_ENV: AppEnv = getAppEnv();

interface BaseEnvConfig {
  env: AppEnv;
  port: number;
  mongoUri: string;
  cacheMongoUri: string; // separate cache database
  // External origins exposed to browsers
  externalOrigins: {
    source: string | undefined;
    render: string | undefined;
    builder: string | undefined;
  };
  // Internal service names (for inter-container calls)
  internalServices: {
    source: string;
    render: string;
    builder: string;
  };
  allowedOrigins: string[]; // derived from externalOrigins
  https: boolean;
  logsFolder: string;
  assetsFolder: string;
  jwtSecret?: string;
}

// Helper to collect non-empty origins
function collectOrigins(o: BaseEnvConfig["externalOrigins"]): string[] {
  return Object.values(o).filter((v): v is string => !!v);
}

// Single canonical port per environment (customize as needed)
const commonPort = 3333;

const configs: Record<AppEnv, BaseEnvConfig> = {
  development: (() => {
    const externalOrigins = {
      source: "http://localhost:3333",
      render: "http://localhost:4444",
      builder: "http://localhost:5555",
    };
    return {
      env: "development",
      port: commonPort,
      mongoUri: "mongodb://localhost:27017/dyna_content",
      cacheMongoUri: "mongodb://localhost:27017/dyna_sources",
      externalOrigins,
      internalServices: {
        source: "http://localhost:3333",
        render: "http://localhost:4444",
        builder: "http://localhost:5555",
      },
      allowedOrigins: collectOrigins(externalOrigins),
      https: false,
      logsFolder: "../logs",
      assetsFolder: "../files",
      jwtSecret: "your_super_secret_key", // set manually if needed
    };
  })(),
  production: (() => {
    const externalOrigins = {
      source: "https://source.prod.dynode.example", // EDIT with real production host
      render: "https://render.prod.dynode.example",
      builder: "https://builder.prod.dynode.example",
    };
    return {
      env: "production",
      port: commonPort,
      mongoUri: "mongodb://mongo-prod-host:27017/dyna_content", // PLACEHOLDER – replace with real (or externalize securely)
      cacheMongoUri: "mongodb://mongo-prod-host:27017/dyna_sources",
      externalOrigins,
      internalServices: {
        source: "http://source",
        render: "http://render",
        builder: "http://build",
      },
      allowedOrigins: collectOrigins(externalOrigins),
      https: true,
      logsFolder: "../logs",
      assetsFolder: "../files",
      jwtSecret: undefined, // DO NOT commit real secret
    };
  })(),
  staging: (() => {
    const externalOrigins = {
      source: "https://source.staging.dynode.example",
      render: "https://render.staging.dynode.example",
      builder: "https://builder.staging.dynode.example",
    };
    return {
      env: "staging",
      port: commonPort,
      mongoUri: "mongodb://mongo-staging-host:27017/dyna_content_staging",
      cacheMongoUri: "mongodb://mongo-staging-host:27017/dyna_sources_staging",
      externalOrigins,
      internalServices: {
        source: "http://source",
        render: "http://render",
        builder: "http://build",
      },
      allowedOrigins: collectOrigins(externalOrigins),
      https: true,
      logsFolder: "../logs",
      assetsFolder: "../files",
      jwtSecret: undefined,
    };
  })(),
  test: (() => {
    const externalOrigins = {
      source: "http://localhost:3333",
      render: "http://localhost:4444",
      builder: "http://localhost:5555",
    };
    return {
      env: "test",
      port: commonPort,
      mongoUri: "mongodb://localhost:27017/dyna_content_test",
      cacheMongoUri: "mongodb://localhost:27017/dyna_sources_test",
      externalOrigins,
      internalServices: {
        source: "http://localhost:3333",
        render: "http://localhost:4444",
        builder: "http://localhost:5555",
      },
      allowedOrigins: collectOrigins(externalOrigins),
      https: false,
      logsFolder: "../logs",
      assetsFolder: "../files",
      jwtSecret: undefined,
    };
  })(),
  docker: (() => {
    // Docker: internal app listens on port 80; host exposes 3000 (source), 4000 (build), 5000 (render).
    const externalOrigins = {
      source: "http://localhost:3000",
      render: "http://localhost:5000",
      builder: "http://localhost:4000",
    };
    return {
      env: "docker",
      port: 80,
      // Inside the Docker network we must use the Mongo container's internal port (27017),
      // not the host-mapped high port. Host mapping 32768:27017 is only for host access.
      mongoUri: "mongodb://mongo:27017/dyna_content",
      cacheMongoUri: "mongodb://mongo:27017/dyna_sources",
      externalOrigins,
      internalServices: {
        source: "http://source",
        render: "http://render",
        builder: "http://build",
      },
      allowedOrigins: collectOrigins(externalOrigins),
      https: false,
      logsFolder: "../logs",
      assetsFolder: "../files",
      jwtSecret: "your_super_secret_key",
    };
  })(),
};

const config: BaseEnvConfig = configs[APP_ENV] || configs.development;

// Configuration validation
if (!config.jwtSecret && config.env === "production") {
  throw new Error("JWT_SECRET must be set in production environment");
}

if (!config.mongoUri) {
  throw new Error("MongoDB URI is required but not configured");
}

export default config;
// Helper accessors (align with other services)
export function getSourcePublicBase() {
  return config.externalOrigins.source;
}
export function getRenderPublicBase() {
  return config.externalOrigins.render;
}
export function getInternalService(name: "source" | "render" | "builder") {
  return config.internalServices[name];
}
