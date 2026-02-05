# render.dynode — Documentation & Flowcharts

This service renders dynamic creatives by fetching content from source.dynode and bundling client assets on-the-fly.

> Generated on 2025-09-25. If routes or files move, update labels accordingly.

## High-level

```mermaid
flowchart LR
  app[app.ts]
  idx[root]
  dyn[dynamics]

  app --> idx
  app --> dyn
```

## Routes overview

```mermaid
flowchart TD
  D[dynamics]
  R1[id]
  R2[id_resource_debug_extension]
  D --> R1
  D --> R2
```

## Request/asset flow

```mermaid
flowchart TD
  subgraph Request
    C[Client]
    C --> API
    C --> MANAGER
    C --> COMPONENTS
    C --> LIBRARIES
    C --> ASSETS_CSS
    C --> ASSETS_JS
  end

  subgraph Server
    API[dynamics id]
    SRC[source data creatives id]
    BUNDLER[bundler]
    COMPONENTS --> BUNDLER
    LIBRARIES --> BUNDLER
    MANAGER --> BUNDLER
    ASSETS_CSS --> BUNDLER
    ASSETS_JS --> BUNDLER
    API --> SRC
  end

  BUNDLER --> RESP[(response)]
  ASSETS_JS --> RESP
  SRC --> API
```

## Bundler logic

```mermaid
flowchart LR
  subgraph bundleComponents
    IN[resources]
    IN --> SWITCH
    SWITCH --> COMP
    SWITCH --> LIB
    SWITCH --> MGR
    SWITCH --> FONTS
    SWITCH --> SW
    COMP[read component files]
    LIB[read library files]
    MGR[read manager script and template]
    FONTS[font face rules]
    SW[service worker cache list]
    COMP --> JOIN
    LIB --> JOIN
    MGR --> JOIN
    FONTS --> JOIN
    SW --> JOIN
    JOIN --> OUT[(payload)]
  end
```

## Logging pipeline

```mermaid
flowchart LR
  RENDER[render.dynode]
  SOURCE[source.dynode]
  LOG[(logs folder)]
  RENDER --> SOURCE
  SOURCE --> LOG
```

## Setup and run

### Prerequisites

- Node.js (18+ recommended)
- A running source.dynode (for /data and /files endpoints)

### Environment (.env)

```ini
NODE_ENV=development
PORT_ENV=5000
# Point to your source API for creatives and assets
SOURCE_API_URL=http://localhost:3000
# Optional: service workers logic in bundler
SERVICE_WORKERS=disabled
```

### Run locally

```powershell
npm ci
npm run dev
```

### Build and start

```powershell
npm run build
npm start
```

## Key files

- app.ts: Express app, index + /dynamics router, Pug views, logging
- routes/index.ts: mounts /dynamics and renders home
- routes/dynamics/default.ts: HTML render for :id and dynamic asset endpoints
- services/bundler.ts: concatenation/minification and template insertion
- services/logger.ts: posts logs to source.dynode /files/logs
- services/caching.ts: placeholder for future cache (kept for API completeness)
- views/pages/dynamics/content.pug: entry HTML for a dynamic creative
