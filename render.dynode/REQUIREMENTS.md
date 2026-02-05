# render.dynode Product Requirements

## Overview

render.dynode renders dynamic campaign creatives on demand. It retrieves creative definitions from source.dynode, assembles the required HTML, JavaScript, CSS, font assets, and optional service worker scripts, and serves them to both preview tooling and playback runtimes.

## Goals

- Deliver faithful previews of creatives for operations teams.
- Provide production-ready bundles for signage player runtimes with minimal asset requests.
- Support service worker caching to reduce network overhead when enabled.
- Maintain operational visibility by forwarding render events to central logging.

## Stakeholders

- **Creative Operations**: need accurate previews and quick debug access.
- **Platform Engineers**: integrate the service with player infrastructure and deployment pipelines.
- **Quality Assurance**: validate that rendered output matches design expectations.
- **Site Reliability**: monitor render health and diagnose incidents via shared logging.

## Personas

- **Creative Manager**: opens `/dynamics/:id` in a browser to validate layouts, assets, and transitions; needs working debug links and consistent base URLs.
- **Player Runtime**: headless signage device requesting `/dynamics/:id/components.min.js`, `/libraries.min.js`, etc. for execution on screen hardware.
- **Platform Engineer**: configures `config.ts` for each environment, ensures TLS certificates and upstream service availability.

## User Journeys

1. **Preview a creative**
   - User navigates to `/dynamics/:id`.
   - Route fetches creative JSON from `${sourceBase}/data/creatives/:id`.
   - Pug template renders Slide/Box/Card/Text/Image/Video widgets with inline styles and computed URLs.
   - Client-side scripts initialize widget behaviour and a debug widget presents quick links.
2. **Request bundled assets**
   - Player requests `/dynamics/:id/components.min.js` or similar.
   - Bundler reads component files from `views/scripts`, concatenates, optionally minifies, and returns payload.
   - Media assets such as fonts or videos are proxied from `${sourceBase}/files/assets`.
3. **Service worker management**
   - When `config.serviceWorkers === "enabled"`, `manager_template.js` and `assets_template.js` are included.
   - A `creative-ready` event triggers registration, defining cached files scoped to the creative.
4. **Operational logging**
   - Each HTTP request triggers `logger.info`.
   - logger posts JSON payloads to `${sourceBase}/files/log` tagged with origin `render.dynode`.

## Functional Requirements

- FR1: Resolve creative metadata via GET `${sourceBase}/data/creatives/:id` with HTTPS agent that ignores self-signed certificates for local use.
- FR2: Render HTML at `/dynamics/:id` with `views/pages/dynamics/content.pug`, passing `content` and `baseURL` to nested mixins.
- FR3: Serve bundled assets at `/dynamics/:id/:resource.:debug.:extension` for `components`, `libraries`, `assets`, and `manager`. Respect `:debug` flag (`min` triggers minification) and support `.js` / `.css` output.
- FR4: Proxy media assets (`.mp4`, `.webm`, `.woff2`, etc.) from `${sourceBase}/files/assets` with correct MIME types.
- FR5: Generate font face rules when assets are grouped or legacy arrays, ensuring all provided formats appear in the bundle.
- FR6: Emit service worker templates when enabled, replacing tokens in `manager_template.js` and `assets_template.js`.
- FR7: Log every request via `logger` with method, URL, and client IP; tolerate remote logging failures without breaking flows.
- FR8: Provide index route `/` with `views/index.pug`, currently exposing the debug widget.
- FR9: Maintain optional JWT auth middleware (`middleware/auth.ts`) for routes that require protection in secured environments.

## API Surface

- GET `/` -> renders home page (`index.pug`).
- GET `/dynamics/:id` -> renders creative page using data from source.dynode.
- GET `/dynamics/:id/:resource.:debug.:extension` -> returns bundled JS/CSS or proxied binary asset.
- Internal POST (via axios) `/files/log` on source.dynode -> receives log payloads.

## Bundler Behaviour

- Component bundles read `views/scripts/components/<Component>/default.js` or `.css` and append widget initializer triggers.
- Library bundles read sibling component library files (legacy path structure).
- Manager bundle concatenates optional template and `views/scripts/pages/dynamics/default.js`.
- Assets bundles:
  - `.css`: generate grouped `@font-face` rules based on resource metadata.
  - `.js`: flatten asset URLs, append core bundle URLs, and render service worker configuration.
- Terser minifies JavaScript; clean-css minifies CSS; non JS/CSS types fall back to whitespace trimming.

## Front-End Runtime

- `window.creativeTicker`: shared interval publishing elapsed time for subscribers (countdown widgets).
- `window.widgetInitializer`: registers and initializes widget render functions in order (layouts, then widgets, then remaining modules).
- `CountdownWidget`: uses `creativeTicker` to update `data-value` attributes per unit, handling total time fields.
- `BoxLayout` and `CardWidget`: leverage MutationObservers to propagate data changes across nested widgets.
- `ImageWidget`, `VideoWidget`, and `SlideLayout` placeholders: currently log initialization without further behaviour.

## Configuration

- `config.ts` selects environment (`development`, `staging`, `production`, `test`, `docker`) via static constant.
- Each environment defines port, external/internal origins, HTTPS flag, service worker toggle, and JWT secret.
- Development logs config summary on startup.
- HTTPS mode reads `./cert/render.dynode.pfx`; falls back to HTTP if loading fails.
- Static config means `.env` overrides have limited effect beyond `dotenv` usage in `app.ts`.

## Non-Functional Requirements

- **Reliability**: graceful fallback from HTTPS to HTTP; synchronous file reads assume local disk availability.
- **Performance**: minification available; repeated bundler calls re-read files (consider caching for high load).
- **Scalability**: stateless service (except for local FS) supports horizontal scaling when shared access to `views` assets is maintained.
- **Observability**: centralized logging via source.dynode; console fallback suppressed to avoid noise unless debugging.
- **Security**: TLS support, optional JWT middleware, service worker scope limited to creative path.

## Dependencies

- Upstream services: source.dynode endpoints `/data/creatives/:id`, `/files/assets`, `/files/log`.
- Node packages: express 5 beta, axios, morgan, cookie-parser, dotenv, pug, terser, clean-css, bcrypt, jsonwebtoken, winston (unused), ts-node-dev for development.
- Local assets: Pug templates and widget scripts under `views/`, certificate under `cert/`.

## Operational Considerations

- Maintain parity with source.dynode resource schema (`resources.components`, `resources.libraries`, `resources.assets`).
- Refresh `render.dynode.pfx` before expiry in HTTPS deployments.
- Document when to switch `config.serviceWorkers` to "enabled" and how to manage cached files between creative updates.
- Clarify usage of `dotenv` alongside static config; consider future support for runtime environment variables.

## Open Questions

- Should `resources.manager` exist separately instead of reusing `resources.assets`? Current implementation reuses assets array.
- Is `services/caching` intended to perform actual caching or remain placeholder?
- Should the debug widget expose dynamic creative IDs rather than hardcoded examples?
- When will JWT middleware be enforced, and which routes should require authentication?
- Are additional widget behaviours (animations, lifecycle hooks) planned for the placeholder initializers?
