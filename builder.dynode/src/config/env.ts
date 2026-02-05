// Static environment config for build.dynode (no VITE_* / .env dependency)
// Switch environments by changing CURRENT_ENV below. Each environment embeds
// the URLs directly. This means a new build is required to change targets.
// Do NOT place secrets here; everything is bundled and public.

export type AppEnv = "development" | "staging" | "production" | "test";

const CURRENT_ENV: AppEnv = "development"; // <- change to 'staging' | 'production' | 'test' as needed

interface BuildConfig {
  env: AppEnv;
  sourceApi: string; // points to source.dynode service
  renderBase: string; // points to render.dynode (public rendering endpoint)
  builderBase: string; // optional builder UI base (self or other)
}

const configs: Record<AppEnv, BuildConfig> = {
  development: {
    env: "development",
    sourceApi: "http://localhost:3333",
    renderBase: "http://localhost:5555",
    builderBase: "http://localhost:4444",
  },
  staging: {
    env: "staging",
    sourceApi: "https://source.staging.dynode.example", // EDIT
    renderBase: "https://render.staging.dynode.example", // EDIT
    builderBase: "https://builder.staging.dynode.example", // EDIT
  },
  production: {
    env: "production",
    sourceApi: "https://source.prod.dynode.example", // EDIT
    renderBase: "https://render.prod.dynode.example", // EDIT
    builderBase: "https://builder.prod.dynode.example", // EDIT
  },
  test: {
    env: "test",
    sourceApi: "http://localhost:3333",
    renderBase: "http://localhost:5555",
    builderBase: "http://localhost:4444",
  },
};

const config = configs[CURRENT_ENV];

export default config;
