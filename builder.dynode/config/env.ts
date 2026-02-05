// Static environment config for build.dynode (moved to project root /config)
// This file replaces src/config/env.ts. Update CURRENT_ENV to switch environment.

export type AppEnv =
  | "development"
  | "staging"
  | "production"
  | "test"
  | "docker";

const CURRENT_ENV: AppEnv = "development"; // change as needed (also supports 'docker')

interface BuildConfig {
  env: AppEnv;
  // External origins (what the browser should see)
  externalOrigins: {
    source: string;
    render: string;
    builder: string;
  };
  // Internal service names (container-to-container)
  internalServices: {
    source: string; // source api base (no trailing slash)
    render: string;
    builder: string;
  };
}

const configs: Record<AppEnv, BuildConfig> = {
  development: {
    env: "development",
    externalOrigins: {
      source: "http://localhost:3333",
      render: "http://localhost:5555",
      builder: "http://localhost:4444",
    },
    internalServices: {
      source: "http://localhost:3333",
      render: "http://localhost:5555",
      builder: "http://localhost:4444",
    },
  },
  staging: {
    env: "staging",
    externalOrigins: {
      source: "https://api.staging.dynode.example",
      render: "https://render.staging.dynode.example",
      builder: "https://builder.staging.dynode.example",
    },
    internalServices: {
      source: "https://api.staging.dynode.example",
      render: "https://render.staging.dynode.example",
      builder: "https://builder.staging.dynode.example",
    },
  },
  production: {
    env: "production",
    externalOrigins: {
      source: "http://localhost:3000",
      render: "http://localhost:5000",
      builder: "http://localhost:4000",
    },
    internalServices: {
      source: "http://source",
      render: "http://render",
      builder: "http://build",
    },
  },
  test: {
    env: "test",
    externalOrigins: {
      source: "http://localhost:3333",
      render: "http://localhost:5555",
      builder: "http://localhost:4444",
    },
    internalServices: {
      source: "http://localhost:3333",
      render: "http://localhost:5555",
      builder: "http://localhost:4444",
    },
  },
  docker: {
    env: "docker",
    externalOrigins: {
      source: "http://localhost:3000",
      render: "http://localhost:5000",
      builder: "http://localhost:4000",
    },
    internalServices: {
      source: "http://source",
      render: "http://render",
      builder: "http://build",
    },
  },
};

const env = configs[CURRENT_ENV];
// Helper to retrieve the correct base for API calls (internal in docker, else external)
export function getSourceApiBase() {
  return env.env === "docker"
    ? env.internalServices.source
    : env.externalOrigins.source;
}
export function getRenderBase() {
  return env.env === "docker"
    ? env.externalOrigins.render // browser still needs host mapping
    : env.externalOrigins.render;
}
export default env;
