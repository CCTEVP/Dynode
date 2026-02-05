# BUILDER Project Files

> Auto-generated documentation from project analysis

**Generated:** 28/01/2026, 09:16:23

## 📊 Overview

| Metric | Value |
|--------|-------|
| Total Files | 175 |
| Total Size | 606.55 KB |
| Files with Descriptions | 168 (96%) |
| Internal Dependencies | 134 |
| External Dependencies | 17 |
| Categories | 11 |

## 📑 Table of Contents

- [Build Cache](#build-cache) (2 files)
- [Config](#config) (6 files)
- [Data](#data) (5 files)
- [Deployment](#deployment) (2 files)
- [Documentation](#documentation) (6 files)
- [Image](#image) (4 files)
- [Other](#other) (8 files)
- [Project Meta](#project-meta) (3 files)
- [Security](#security) (1 files)
- [Source](#source) (121 files)
- [Style](#style) (17 files)

---

## Build Cache

### `obj/Debug/package.g.props`

**Description:** MSBuild generated properties file for package references and build configuration.

| Property | Value |
|----------|-------|
| Size | 3.72 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | build-cache |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `obj/Debug/player.dynode.esproj.CoreCompileInputs.cache`

**Description:** MSBuild cache file tracking core compilation inputs for incremental builds.

| Property | Value |
|----------|-------|
| Size | 0 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | build-cache |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*
- **May 13, 2025** - First Commit *(CCTEVP)*

---

## Config

### `.env`

**Description:** Environment configuration file containing development settings for ports, JWT secret, API URLs, and MongoDB connection parameters.

| Property | Value |
|----------|-------|
| Size | 641 Bytes |
| Created | Sep 30, 2025 |
| Updated | Jan 15, 2026 |
| Category | config |
---

### `.env.dev`

**Description:** Development environment configuration with localhost URLs for source, render, builder, and echo services.

| Property | Value |
|----------|-------|
| Size | 641 Bytes |
| Created | Jan 15, 2026 |
| Updated | Jan 15, 2026 |
| Category | config |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*

---

### `.env.prod`

**Description:** Production environment configuration with port 80 mappings and internal Docker service names.

| Property | Value |
|----------|-------|
| Size | 641 Bytes |
| Created | Jan 15, 2026 |
| Updated | Jan 15, 2026 |
| Category | config |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*

---

### `.env.stag`

**Description:** Staging environment configuration for pre-production testing with staging domain URLs.

| Property | Value |
|----------|-------|
| Size | 641 Bytes |
| Created | Jan 15, 2026 |
| Updated | Jan 15, 2026 |
| Category | config |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*

---

### `.gitignore`

**Description:** Git ignore file excluding build artifacts, dependencies, logs, IDE settings, and OS-specific files from version control.

| Property | Value |
|----------|-------|
| Size | 277 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | config |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `config/env.ts`

**Description:** Centralized environment configuration module defining API base URLs and service endpoints for development, staging, production, Docker, and test environments.

| Property | Value |
|----------|-------|
| Size | 2.97 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 15, 2026 |
| Category | config |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Jan 13, 2026** - Added Clock Widget and General Optimization *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- *...and 1 more commits*

---

## Data

### `obj/Debug/player.dynode.esproj.FileListAbsolute.txt`

**Description:** MSBuild file list containing absolute paths of project files for build tracking.

| Property | Value |
|----------|-------|
| Size | 101 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | data |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `package-lock.json`

**Description:** npm lock file ensuring consistent dependency versions across installations.

| Property | Value |
|----------|-------|
| Size | 197.6 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 21, 2026 |
| Category | data |
**Recent History:**

- **Jan 22, 2026** - Checkpoint before Switch to Antigravity *(CCTEvalencia)*
- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*
- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- *...and 1 more commits*

---

### `page_excerpt.txt`

**Description:** Text excerpt or snippet extracted from page content for reference or testing.

| Property | Value |
|----------|-------|
| Size | 710 Bytes |
| Created | Sep 30, 2025 |
| Updated | Oct 28, 2025 |
| Category | data |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Oct 28, 2025** - General Standardization *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `tsconfig.app.json`

**Description:** TypeScript configuration for application source code with React JSX and module resolution settings.

| Property | Value |
|----------|-------|
| Size | 729 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | data |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `tsconfig.node.json`

**Description:** TypeScript configuration for Node.js build scripts and configuration files.

| Property | Value |
|----------|-------|
| Size | 655 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | data |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

## Deployment

### `.dockerignore`

**Description:** Docker ignore file specifying files and directories to exclude from Docker build context, including node_modules, logs, and environment files.

| Property | Value |
|----------|-------|
| Size | 223 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | deployment |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `Dockerfile`

**Description:** Multi-stage Docker build configuration creating production nginx container with SSL certificate extraction, environment-specific config selection, and health checks.

| Property | Value |
|----------|-------|
| Size | 2.5 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 15, 2026 |
| Category | deployment |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Jan 13, 2026** - Added Clock Widget and General Optimization *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- *...and 1 more commits*

---

## Documentation

### `CHANGELOG.md`

**Description:** Project changelog documenting creation process using create-vite, port configuration, and Visual Studio integration steps.

| Property | Value |
|----------|-------|
| Size | 483 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | documentation |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `documentation/diagrams/app.mmd`

**Description:** Mermaid flowchart diagram illustrating application routing structure and layout hierarchy.

| Property | Value |
|----------|-------|
| Size | 511 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | documentation |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Builder flowchart fixed *(CCTEvalencia)*
- **Sep 25, 2025** - Builder flowchart fixed *(CCTEvalencia)*
- *...and 1 more commits*

---

### `documentation/diagrams/auth.mmd`

**Description:** Mermaid sequence diagram documenting authentication flow between UI, auth service, and source API.

| Property | Value |
|----------|-------|
| Size | 456 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | documentation |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Builder flowchart updated *(CCTEvalencia)*

---

### `documentation/diagrams/data-flow.mmd`

**Description:** Mermaid diagram showing data flow for creative operations including list and edit functionality.

| Property | Value |
|----------|-------|
| Size | 256 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | documentation |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Builder flowchart updated *(CCTEvalencia)*

---

### `documentation/diagrams/logging.mmd`

**Description:** Mermaid diagram illustrating logging architecture and patterns.

| Property | Value |
|----------|-------|
| Size | 141 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | documentation |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Source scafolding + data updated *(CCTEvalencia)*
- **Sep 25, 2025** - Builder flowchart updated *(CCTEvalencia)*

---

### `README.md`

**Description:** Project documentation with architecture overview, Mermaid flowcharts for routing, authentication, and data flow patterns.

| Property | Value |
|----------|-------|
| Size | 3.17 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | documentation |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Builder flowchart updated *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

## Image

### `public/images/logo.svg`

**Description:** SVG logo image file served as static asset and used as favicon.

| Property | Value |
|----------|-------|
| Size | 1.89 KB |
| Created | Oct 28, 2025 |
| Updated | Oct 28, 2025 |
| Category | image |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Oct 28, 2025** - General Standardization *(CCTEvalencia)*

---

### `public/logo.svg`

**Description:** Alternate SVG logo file in public assets directory.

| Property | Value |
|----------|-------|
| Size | 2.04 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | image |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Favicon fixed *(CCTEvalencia)*

---

### `src/assets/logo.svg`

**Description:** SVG logo asset imported and used within React components.

| Property | Value |
|----------|-------|
| Size | 1.9 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | image |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/assets/react.svg`

**Description:** React framework logo SVG included by Vite template.

| Property | Value |
|----------|-------|
| Size | 4.03 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | image |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

## Other

### `.eslintcache`

**Description:** ESLint cache file storing linting results to improve subsequent linting performance.

| Property | Value |
|----------|-------|
| Size | 1.31 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `index.html`

**Description:** Application entry HTML file setting up root div, favicon, viewport meta tags, and loading main TypeScript module.

| Property | Value |
|----------|-------|
| Size | 430 Bytes |
| Created | Sep 30, 2025 |
| Updated | Oct 28, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Oct 28, 2025** - General Standardization *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `nginx.conf`

**Description:** Nginx configuration for HTTPS server with SSL, API proxy to source service, gzip compression, and WebSocket support.

| Property | Value |
|----------|-------|
| Size | 3.89 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `nginx.dev.conf`

**Description:** Development nginx configuration with HTTP-only setup proxying API requests to localhost for local testing.

| Property | Value |
|----------|-------|
| Size | 1.26 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `nginx.docker.conf`

**Description:** Docker-specific nginx configuration with HTTP server proxying to internal source container without TLS.

| Property | Value |
|----------|-------|
| Size | 1.11 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*

---

### `nginx.prod.conf`

**Description:** Production nginx configuration with SSL/TLS, security headers, and proxying to internal Docker service names.

| Property | Value |
|----------|-------|
| Size | 1.84 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*

---

### `page.html`

**Description:** Static HTML page template or reference document.

| Property | Value |
|----------|-------|
| Size | 740 Bytes |
| Created | Sep 30, 2025 |
| Updated | Oct 28, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Oct 28, 2025** - General Standardization *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Creatives/Edit.xhtml`

**Description:** XHTML template or reference document for editor page structure.

| Property | Value |
|----------|-------|
| Size | 2.19 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | other |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

## Project Meta

### `build.dynode.esproj`

**Description:** Visual Studio JavaScript project file configuring startup commands, test framework (Vitest), and build output folder.

| Property | Value |
|----------|-------|
| Size | 570 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | project-meta |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `package.json`

**Description:** Project manifest defining dependencies, scripts, and metadata for React+Vite builder application with Ant Design UI.

| Property | Value |
|----------|-------|
| Size | 1.93 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 21, 2026 |
| Category | project-meta |
**Recent History:**

- **Jan 22, 2026** - Checkpoint before Switch to Antigravity *(CCTEvalencia)*
- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*
- **Jan 20, 2026** - Consolidation System Fixed *(CCTEvalencia)*
- *...and 4 more commits*

---

### `tsconfig.json`

**Description:** Root TypeScript configuration referencing app and node config files with project references.

| Property | Value |
|----------|-------|
| Size | 126 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | project-meta |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

## Security

### `cert/builder.dynode.pfx`

**Description:** PFX certificate bundle containing SSL/TLS certificate and private key for HTTPS deployment.

| Property | Value |
|----------|-------|
| Size | 2.73 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | security |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

## Source

### `eslint.config.js`

**Description:** ESLint configuration defining linting rules for TypeScript/React with react-hooks and react-refresh plugins.

| Property | Value |
|----------|-------|
| Size | 762 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `@eslint/js`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `globals`
- `typescript-eslint`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/App.tsx`

**Description:** Root React component configuring routing, authentication, layouts, and lazy-loaded pages with protected routes.

| Property | Value |
|----------|-------|
| Size | 3.13 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 21, 2026 |
| Category | source |

**Internal Dependencies:**

- `./contexts/AuthContext` → `src/contexts/AuthContext.tsx`
- `./components/controls/ProtectedRoute` → `src/components/controls/ProtectedRoute/index.tsx`
- `./layouts/MainLayout` → `src/layouts/MainLayout.tsx`

**External Dependencies:**

- `antd`
- `react`
- `react-router-dom`

**Recent History:**

- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*
- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/auth/CodeVerificationStep.tsx`

**Description:** Authentication component handling verification code input and validation for passwordless login.

| Property | Value |
|----------|-------|
| Size | 4.78 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../contexts/AuthContext` → `src/contexts/AuthContext.tsx`
- `../../services/auth` → `src/services/auth.ts`
- `./Login.css` → `src/components/auth/Login.css`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/auth/EmailStep.tsx`

**Description:** Authentication component managing email input step for initiating passwordless authentication flow.

| Property | Value |
|----------|-------|
| Size | 2.43 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../services/auth` → `src/services/auth.ts`
- `./Login.css` → `src/components/auth/Login.css`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/auth/Login.tsx`

**Description:** Login orchestrator component managing multi-step authentication workflow between email and code verification.

| Property | Value |
|----------|-------|
| Size | 726 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./EmailStep` → `src/components/auth/EmailStep.tsx`
- `./CodeVerificationStep` → `src/components/auth/CodeVerificationStep.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ActionButtons/Default.tsx`

**Description:** Default action buttons component for common UI operations with back navigation.

| Property | Value |
|----------|-------|
| Size | 655 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`
- `react-router-dom`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ActionButtons/index.tsx`

**Description:** Barrel export for ActionButtons component variants.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ComponentFilter/ComponentFilter.tsx`

**Description:** UI filter component for selecting and filtering components in the editor.

| Property | Value |
|----------|-------|
| Size | 842 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ComponentFilter/index.ts`

**Description:** Barrel export for ComponentFilter module.

| Property | Value |
|----------|-------|
| Size | 63 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeCanvas/Default.tsx`

**Description:** Canvas component rendering creative scenes with zoom, grid, and element positioning features.

| Property | Value |
|----------|-------|
| Size | 9.05 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./Default.css` → `src/components/controls/CreativeCanvas/Default.css`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeCanvas/index.ts`

**Description:** Barrel export for CreativeCanvas component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeCard/Default.tsx`

**Description:** Card component displaying creative summary with click-to-edit navigation.

| Property | Value |
|----------|-------|
| Size | 720 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`
- `react-router-dom`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeCard/index.tsx`

**Description:** Barrel export for CreativeCard component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeRenderer/Default.tsx`

**Description:** Core renderer component converting creative JSON structure into React elements with layouts and widgets.

| Property | Value |
|----------|-------|
| Size | 13.17 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../types/creative` → `src/types/creative.ts`
- `../../editor/utils/styleUtils` → `src/components/editor/utils/styleUtils.ts`
- `../../editor/layouts` → `src/components/editor/layouts/index.ts`
- `../../editor/widgets` → `src/components/editor/widgets/index.ts`
- `../CreativeScene/Default` → `src/components/controls/CreativeScene/Default.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeRenderer/index.ts`

**Description:** Barrel export for CreativeRenderer module.

| Property | Value |
|----------|-------|
| Size | 85 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeScene/Default.tsx`

**Description:** Scene wrapper component applying scene-specific styles to rendered creative content.

| Property | Value |
|----------|-------|
| Size | 621 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./Default.css` → `src/components/controls/CreativeScene/Default.css`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeScene/index.tsx`

**Description:** Barrel export for CreativeScene component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCard.tsx`

**Description:** Collapsible data card component managing expanded/collapsed states for displaying creative metadata.

| Property | Value |
|----------|-------|
| Size | 1.95 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`
- `./utils` → `src/components/controls/DataCard/utils.tsx`
- `./DataCardCollapsed` → `src/components/controls/DataCard/DataCardCollapsed.tsx`
- `./DataCardExpanded` → `src/components/controls/DataCard/DataCardExpanded.tsx`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCardActions.tsx`

**Description:** Action buttons subcomponent for DataCard providing edit, view, and delete operations.

| Property | Value |
|----------|-------|
| Size | 1.13 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`

**External Dependencies:**

- `@ant-design/icons`
- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCardCollapse.tsx`

**Description:** Ant Design Collapse integration for DataCard with nested data rendering.

| Property | Value |
|----------|-------|
| Size | 3.74 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`
- `./utils` → `src/components/controls/DataCard/utils.tsx`

**External Dependencies:**

- `@ant-design/icons`
- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCardCollapsed.tsx`

**Description:** Collapsed state view for DataCard showing abbreviated information and expand trigger.

| Property | Value |
|----------|-------|
| Size | 802 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`
- `./utils` → `src/components/controls/DataCard/utils.tsx`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCardDates.tsx`

**Description:** Subcomponent rendering creation and update timestamps within DataCard.

| Property | Value |
|----------|-------|
| Size | 1.06 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`
- `./utils` → `src/components/controls/DataCard/utils.tsx`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCardExpanded.tsx`

**Description:** Expanded state view for DataCard displaying full creative details with all subcomponents.

| Property | Value |
|----------|-------|
| Size | 948 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`
- `./DataCardHeader` → `src/components/controls/DataCard/DataCardHeader.tsx`
- `./DataCardDates` → `src/components/controls/DataCard/DataCardDates.tsx`
- `./DataCardInfo` → `src/components/controls/DataCard/DataCardInfo.tsx`
- `./DataCardCollapse` → `src/components/controls/DataCard/DataCardCollapse.tsx`
- `./DataCardActions` → `src/components/controls/DataCard/DataCardActions.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCardHeader.tsx`

**Description:** Header subcomponent for DataCard displaying title, identifier, and status badges.

| Property | Value |
|----------|-------|
| Size | 1.26 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`
- `./utils` → `src/components/controls/DataCard/utils.tsx`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/DataCardInfo.tsx`

**Description:** Info section subcomponent showing formatted creative metadata fields.

| Property | Value |
|----------|-------|
| Size | 1.18 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/index.ts`

**Description:** Barrel export for DataCard module exporting all subcomponents and utilities.

| Property | Value |
|----------|-------|
| Size | 554 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/controls/DataCard/types.ts`
- `./utils` → `src/components/controls/DataCard/utils.tsx`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/types.ts`

**Description:** TypeScript type definitions for DataCard component props and data structures.

| Property | Value |
|----------|-------|
| Size | 493 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/DataCard/utils.tsx`

**Description:** Utility functions for DataCard including status badge colors, icons, and formatting helpers.

| Property | Value |
|----------|-------|
| Size | 1.71 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `@ant-design/icons`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditLeft/Default.tsx`

**Description:** Left sidebar panel for editor containing element list and layout selection organized in panel groups.

| Property | Value |
|----------|-------|
| Size | 5.79 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../Panel/Default` → `src/components/controls/Panel/Default.tsx`
- `../PanelGroup/Default` → `src/components/controls/PanelGroup/Default.tsx`
- `../ElementList/Default` → `src/components/controls/ElementList/Default.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditLeft/index.tsx`

**Description:** Barrel export for EditLeft sidebar component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Editor/Default.tsx`

**Description:** Main editor orchestrator integrating canvas, panels, selection bridge, and element synchronization.

| Property | Value |
|----------|-------|
| Size | 3.75 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../SelectionBridge/Default` → `src/components/controls/SelectionBridge/Default.tsx`
- `../SyncSelectionToLocal/Default` → `src/components/controls/SyncSelectionToLocal/Default.tsx`
- `../EditorCanvas/Default` → `src/components/controls/EditorCanvas/Default.tsx`
- `../EditorSelector/Default` → `src/components/controls/EditorSelector/Default.tsx`
- `../EditorPanels/Default` → `src/components/controls/EditorPanels/Default.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Editor/index.tsx`

**Description:** Barrel export for Editor component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditorCanvas/Default.tsx`

**Description:** Editor canvas wrapper combining CreativeCanvas and CreativeRenderer for visual editing.

| Property | Value |
|----------|-------|
| Size | 709 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../CreativeCanvas/Default` → `src/components/controls/CreativeCanvas/Default.tsx`
- `../CreativeRenderer/Default` → `src/components/controls/CreativeRenderer/Default.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditorCanvas/index.tsx`

**Description:** Barrel export for EditorCanvas component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditorPanels/Default.tsx`

**Description:** Panel layout component organizing EditLeft sidebar, EditToolbar, and EditRight properties panel.

| Property | Value |
|----------|-------|
| Size | 4.11 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../EditLeft/Default` → `src/components/controls/EditLeft/Default.tsx`
- `../EditToolbar/Default` → `src/components/controls/EditToolbar/Default.tsx`
- `../EditRight/Default` → `src/components/controls/EditRight/Default.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditorPanels/index.tsx`

**Description:** Barrel export for EditorPanels component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditorSelector/Default.tsx`

**Description:** Selection overlay component providing visual feedback and click handlers for element selection in editor.

| Property | Value |
|----------|-------|
| Size | 2.75 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../contexts/SelectionContext` → `src/contexts/SelectionContext.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditorSelector/index.tsx`

**Description:** Barrel export for EditorSelector component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditRight/Default.tsx`

**Description:** Right properties panel displaying selected element/widget properties with edit controls organized in panel groups.

| Property | Value |
|----------|-------|
| Size | 5.24 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../Panel/Default` → `src/components/controls/Panel/Default.tsx`
- `../PanelGroup/Default` → `src/components/controls/PanelGroup/Default.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditRight/index.tsx`

**Description:** Barrel export for EditRight properties panel.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditToolbar/Default.tsx`

**Description:** Top toolbar for editor providing tool selection, zoom controls, preview toggle, and save/exit actions.

| Property | Value |
|----------|-------|
| Size | 14.71 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../PanelGroup/Default` → `src/components/controls/PanelGroup/Default.tsx`
- `../Panel/Default` → `src/components/controls/Panel/Default.tsx`
- `../../../contexts/ToolComponentsContext` → `src/contexts/ToolComponentsContext.tsx`

**External Dependencies:**

- `@ant-design/icons`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/EditToolbar/index.tsx`

**Description:** Barrel export for EditToolbar component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ElementList/Default.tsx`

**Description:** Tree-view component listing creative elements with selection, visibility toggle, lock, and delete functionality.

| Property | Value |
|----------|-------|
| Size | 12.72 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../contexts/SelectionContext` → `src/contexts/SelectionContext.tsx`

**External Dependencies:**

- `@ant-design/icons`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ElementList/index.ts`

**Description:** Barrel export for ElementList component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/index.ts`

**Description:** Barrel export aggregating all control components for simplified imports.

| Property | Value |
|----------|-------|
| Size | 436 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Link/Default.tsx`

**Description:** Ant Design Link wrapper component for consistent link styling across application.

| Property | Value |
|----------|-------|
| Size | 510 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `antd`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Link/index.ts`

**Description:** Barrel export for Link component.

| Property | Value |
|----------|-------|
| Size | 46 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Modal/index.tsx`

**Description:** Barrel export for Modal component.

| Property | Value |
|----------|-------|
| Size | 36 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Modal/Modal.tsx`

**Description:** Modal dialog wrapper component extending Ant Design Modal with custom styling.

| Property | Value |
|----------|-------|
| Size | 505 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Panel/Default.tsx`

**Description:** Collapsible panel component with header, body sections, and expand/collapse state management.

| Property | Value |
|----------|-------|
| Size | 4.35 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Panel/index.tsx`

**Description:** Barrel export for Panel component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/PanelGroup/Default.tsx`

**Description:** Container component grouping multiple Panel components with consistent styling.

| Property | Value |
|----------|-------|
| Size | 439 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/PanelGroup/index.tsx`

**Description:** Barrel export for PanelGroup component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ProtectedRoute/Default.tsx`

**Description:** Route guard component checking authentication and redirecting to login if unauthorized.

| Property | Value |
|----------|-------|
| Size | 913 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../contexts/useAuth` → `src/contexts/useAuth.ts`
- `../../auth/Login` → `src/components/auth/Login.tsx`

**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ProtectedRoute/index.tsx`

**Description:** Barrel export for ProtectedRoute component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Section/Default.tsx`

**Description:** Basic section container component with optional className for layout organization.

| Property | Value |
|----------|-------|
| Size | 321 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Section/index.tsx`

**Description:** Barrel export for Section component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/SelectionBridge.tsx`

**Description:** Alternative SelectionBridge implementation providing context-to-local selection synchronization.

| Property | Value |
|----------|-------|
| Size | 3.66 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../contexts/SelectionContext` → `src/contexts/SelectionContext.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/SelectionBridge/Default.tsx`

**Description:** Bridge component synchronizing element selection between context and local editor state.

| Property | Value |
|----------|-------|
| Size | 3.67 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../contexts/SelectionContext` → `src/contexts/SelectionContext.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/SelectionBridge/index.ts`

**Description:** Barrel export for SelectionBridge component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Sidebar/Default.tsx`

**Description:** Navigation sidebar component with logo and route links using React Router.

| Property | Value |
|----------|-------|
| Size | 1.14 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`
- `react-router-dom`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Sidebar/index.tsx`

**Description:** Barrel export for Sidebar component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/SyncSelectionToLocal.tsx`

**Description:** Alternative SyncSelectionToLocal implementation for selection state synchronization.

| Property | Value |
|----------|-------|
| Size | 11.93 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../contexts/SelectionContext` → `src/contexts/SelectionContext.tsx`
- `../../contexts/CreativeContext` → `src/contexts/CreativeContext.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/SyncSelectionToLocal/Default.tsx`

**Description:** Component synchronizing global selection context to local component state with change detection.

| Property | Value |
|----------|-------|
| Size | 11.93 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../contexts/SelectionContext` → `src/contexts/SelectionContext.tsx`
- `../../../contexts/CreativeContext` → `src/contexts/CreativeContext.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/SyncSelectionToLocal/index.ts`

**Description:** Barrel export for SyncSelectionToLocal component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Tag/index.ts`

**Description:** Barrel export for Tag component.

| Property | Value |
|----------|-------|
| Size | 74 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Tag/Tag.tsx`

**Description:** Custom tag component with color variants and delete functionality.

| Property | Value |
|----------|-------|
| Size | 1.41 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/TopBar/Default.tsx`

**Description:** Top application bar component displaying logo and brand text.

| Property | Value |
|----------|-------|
| Size | 591 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/TopBar/index.tsx`

**Description:** Barrel export for TopBar component.

| Property | Value |
|----------|-------|
| Size | 38 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/layouts/BaseLayout.tsx`

**Description:** Base layout component providing common rendering logic and style application for all layout types.

| Property | Value |
|----------|-------|
| Size | 1.69 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/layouts/types.ts`
- `../utils/styleUtils` → `src/components/editor/utils/styleUtils.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/layouts/BoxLayout.tsx`

**Description:** Box layout component extending BaseLayout with flexbox positioning for child widgets.

| Property | Value |
|----------|-------|
| Size | 851 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/layouts/types.ts`
- `./BaseLayout` → `src/components/editor/layouts/BaseLayout.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/layouts/GridLayout.tsx`

**Description:** Grid layout component extending BaseLayout with CSS grid system for widget positioning.

| Property | Value |
|----------|-------|
| Size | 1.01 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/layouts/types.ts`
- `./BaseLayout` → `src/components/editor/layouts/BaseLayout.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/layouts/index.ts`

**Description:** Barrel export for layout components mapping widgetType strings to layout components.

| Property | Value |
|----------|-------|
| Size | 214 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/layouts/types.ts`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/layouts/SlideLayout.tsx`

**Description:** Slide layout component extending BaseLayout for full-screen slide-based presentations.

| Property | Value |
|----------|-------|
| Size | 566 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/layouts/types.ts`
- `./BaseLayout` → `src/components/editor/layouts/BaseLayout.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/layouts/types.ts`

**Description:** TypeScript type definitions for layout components including props, config, and MongoDB ObjectId types.

| Property | Value |
|----------|-------|
| Size | 2.6 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/layouts/utils.ts`

**Description:** Empty utility file reserved for layout helper functions.

| Property | Value |
|----------|-------|
| Size | 0 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*
- **May 13, 2025** - First Commit *(CCTEVP)*

---

### `src/components/editor/utils/styleUtils.ts`

**Description:** Utility functions converting widget style objects to React inline style format.

| Property | Value |
|----------|-------|
| Size | 1.06 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/BaseWidget.tsx`

**Description:** Base widget component providing common rendering logic, style application, and event handling for all widget types.

| Property | Value |
|----------|-------|
| Size | 1.21 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`
- `../utils/styleUtils` → `src/components/editor/utils/styleUtils.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/CardWidget.tsx`

**Description:** Card widget component rendering bordered container with optional title extending BaseWidget.

| Property | Value |
|----------|-------|
| Size | 1.28 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`
- `./BaseWidget` → `src/components/editor/widgets/BaseWidget.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/ClockWidget.tsx`

**Description:** Clock widget displaying live time with configurable format, timezone support, and auto-update extending BaseWidget.

| Property | Value |
|----------|-------|
| Size | 2.78 KB |
| Created | Jan 13, 2026 |
| Updated | Jan 13, 2026 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`
- `./BaseWidget` → `src/components/editor/widgets/BaseWidget.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Jan 13, 2026** - Added Clock Widget and General Optimization *(CCTEvalencia)*

---

### `src/components/editor/widgets/CountdownWidget.tsx`

**Description:** Countdown widget displaying time remaining until target date with auto-update and format customization.

| Property | Value |
|----------|-------|
| Size | 2.63 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 8, 2026 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`
- `./BaseWidget` → `src/components/editor/widgets/BaseWidget.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Jan 13, 2026** - Added Clock Widget and General Optimization *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/ImageWidget.tsx`

**Description:** Image widget resolving and rendering images from creative assets with source URL construction.

| Property | Value |
|----------|-------|
| Size | 2.2 KB |
| Created | Sep 30, 2025 |
| Updated | Nov 11, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`
- `./BaseWidget` → `src/components/editor/widgets/BaseWidget.tsx`
- `../../../types/creative` → `src/types/creative.ts`
- `../../../../config/env` → `config/env.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Nov 11, 2025** - Missing port binding in ImageWidget *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/index.ts`

**Description:** Barrel export for widget components mapping widgetType strings to widget components.

| Property | Value |
|----------|-------|
| Size | 316 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/TextWidget.tsx`

**Description:** Text widget rendering styled text content extending BaseWidget.

| Property | Value |
|----------|-------|
| Size | 574 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`
- `./BaseWidget` → `src/components/editor/widgets/BaseWidget.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/types.ts`

**Description:** TypeScript type definitions for all widget types including Image, Text, Video, Card, Clock, and Countdown widgets.

| Property | Value |
|----------|-------|
| Size | 4.61 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 13, 2026 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Jan 13, 2026** - Added Clock Widget and General Optimization *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/editor/widgets/VideoWidget.tsx`

**Description:** Video widget resolving and rendering videos from creative assets with playback controls and autoplay.

| Property | Value |
|----------|-------|
| Size | 2.85 KB |
| Created | Sep 30, 2025 |
| Updated | Nov 11, 2025 |
| Category | source |

**Internal Dependencies:**

- `./types` → `src/components/editor/widgets/types.ts`
- `./BaseWidget` → `src/components/editor/widgets/BaseWidget.tsx`
- `../../../types/creative` → `src/types/creative.ts`
- `../../../../config/env` → `config/env.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 30, 2025** - Configuration centralized per project *(CCTEvalencia)*
- *...and 1 more commits*

---

### `src/config/env.ts`

**Description:** Deprecated environment configuration moved to project root config/env.ts.

| Property | Value |
|----------|-------|
| Size | 1.62 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Configuration centralized per project *(CCTEvalencia)*

---

### `src/contexts/AuthContext.tsx`

**Description:** React context provider managing authentication state, token storage, and domain permissions with login/logout methods.

| Property | Value |
|----------|-------|
| Size | 2.17 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../services/auth` → `src/services/auth.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/contexts/CreativeContext.tsx`

**Description:** React context provider managing creative data state, loading status, and CRUD operations for editor.

| Property | Value |
|----------|-------|
| Size | 784 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../types/creative` → `src/types/creative.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/contexts/EditorProviders.tsx`

**Description:** Composite provider wrapping multiple editor contexts (Creative, Selection, ToolComponents) for editor page.

| Property | Value |
|----------|-------|
| Size | 866 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./AuthContext` → `src/contexts/AuthContext.tsx`
- `./ToolComponentsContext` → `src/contexts/ToolComponentsContext.tsx`
- `./CreativeContext` → `src/contexts/CreativeContext.tsx`
- `../contexts/SelectionContext` → `src/contexts/SelectionContext.tsx`
- `../hooks/useCreative` → `src/hooks/useCreative.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/contexts/SelectionContext.tsx`

**Description:** React context provider managing selected scene, element path, and element data for editor selection state.

| Property | Value |
|----------|-------|
| Size | 2.66 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/contexts/ToolComponentsContext.tsx`

**Description:** React context provider managing available layout and widget components for editor toolbar.

| Property | Value |
|----------|-------|
| Size | 940 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../hooks/useToolComponents` → `src/hooks/useToolComponents.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/contexts/useAuth.ts`

**Description:** Custom React hook accessing AuthContext providing authentication state and methods with error handling.

| Property | Value |
|----------|-------|
| Size | 286 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./AuthContext` → `src/contexts/AuthContext.tsx`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/hooks/useCreative.ts`

**Description:** Custom React hook fetching and managing single creative data with loading, error states, and reload functionality.

| Property | Value |
|----------|-------|
| Size | 1.33 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../types/creative` → `src/types/creative.ts`
- `../services/creative` → `src/services/creative.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/hooks/useToolComponents.ts`

**Description:** Custom React hook accessing ToolComponentsContext providing available editor layouts and widgets.

| Property | Value |
|----------|-------|
| Size | 1.4 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../config/env` → `config/env.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/layouts/FullLayout.tsx`

**Description:** Full-bleed layout component wrapping content without sidebars for editor and other full-screen views.

| Property | Value |
|----------|-------|
| Size | 417 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/layouts/MainLayout.tsx`

**Description:** Main application layout with TopBar, Sidebar, and content area for standard application pages.

| Property | Value |
|----------|-------|
| Size | 7.37 KB |
| Created | Sep 30, 2025 |
| Updated | Jan 21, 2026 |
| Category | source |
**External Dependencies:**

- `@ant-design/icons`
- `antd`
- `react`
- `react-router-dom`

**Recent History:**

- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*
- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/main.tsx`

**Description:** Application entry point rendering root App component with React StrictMode and Ant Design CSS reset.

| Property | Value |
|----------|-------|
| Size | 298 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `./App` → `src/App.tsx`
- `./index.css` → `src/index.css`

**External Dependencies:**

- `antd/dist/reset.css`
- `react`
- `react-dom/client`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Assets/Upload.tsx`

**Description:** Asset upload page for uploading and managing images, videos, and other creative assets.

| Property | Value |
|----------|-------|
| Size | 2.55 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../config/env` → `config/env.ts`

**External Dependencies:**

- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 30, 2025** - Configuration centralized per project *(CCTEvalencia)*
- *...and 1 more commits*

---

### `src/pages/Community/Index.tsx`

**Description:** Community page placeholder for sharing and browsing community-created creatives.

| Property | Value |
|----------|-------|
| Size | 1.9 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Creatives/Create.tsx`

**Description:** Creative creation page with form for entering new creative metadata and initial configuration.

| Property | Value |
|----------|-------|
| Size | 0 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*
- **May 13, 2025** - First Commit *(CCTEVP)*

---

### `src/pages/Creatives/Data.tsx`

**Description:** Creative data utilities and type definitions for creative list page.

| Property | Value |
|----------|-------|
| Size | 0 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*
- **May 13, 2025** - First Commit *(CCTEVP)*

---

### `src/pages/Creatives/Default.tsx`

**Description:** Creative list page displaying table/grid of creatives with edit, view, delete, and filter actions.

| Property | Value |
|----------|-------|
| Size | 18.53 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../services/creative` → `src/services/creative.ts`
- `../../types/creative` → `src/types/creative.ts`
- `./Default.css` → `src/pages/Creatives/Default.css`
- `../../../config/env` → `config/env.ts`

**External Dependencies:**

- `@ant-design/icons`
- `antd`
- `antd/es/table`
- `react`
- `react-router-dom`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 30, 2025** - Configuration centralized per project *(CCTEvalencia)*
- *...and 1 more commits*

---

### `src/pages/Creatives/Delete.tsx`

**Description:** Creative deletion confirmation modal with API integration for permanent removal.

| Property | Value |
|----------|-------|
| Size | 0 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*
- **May 13, 2025** - First Commit *(CCTEVP)*

---

### `src/pages/Creatives/Edit.tsx`

**Description:** Creative editor page integrating EditorProviders, Editor component, and save/preview functionality.

| Property | Value |
|----------|-------|
| Size | 7.33 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../services/creative` → `src/services/creative.ts`
- `../../hooks/useCreative` → `src/hooks/useCreative.ts`
- `../../contexts/EditorProviders` → `src/contexts/EditorProviders.tsx`
- `../../components/controls/Editor` → `src/components/controls/Editor/index.tsx`
- `./Edit.css` → `src/pages/Creatives/Edit.css`

**External Dependencies:**

- `antd`
- `react`
- `react-router-dom`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Help/Codebase/Default.tsx`

| Property | Value |
|----------|-------|
| Size | 59.54 KB |
| Created | Jan 21, 2026 |
| Updated | Jan 27, 2026 |
| Category | source |

**Internal Dependencies:**

- `./reactflow-selection.css` → `src/pages/Help/Codebase/reactflow-selection.css`
- `../../../services/codebase` → `src/services/codebase.ts`
- `../../../types/codebase` → `src/types/codebase.ts`
- `../../../utils/layoutUtils` → `src/utils/layoutUtils.ts`
- `./styles.css` → `src/pages/Help/Codebase/styles.css`

**External Dependencies:**

- `@xyflow/react`
- `@xyflow/react/dist/style.css`
- `antd`
- `react`

**Recent History:**

- **Jan 22, 2026** - Checkpoint before Switch to Antigravity *(CCTEvalencia)*
- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*

---

### `src/pages/Help/Codebase/Test.tsx`

| Property | Value |
|----------|-------|
| Size | 356 Bytes |
| Created | Jan 21, 2026 |
| Updated | Jan 21, 2026 |
| Category | source |
**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 22, 2026** - Checkpoint before Switch to Antigravity *(CCTEvalencia)*

---

### `src/pages/Help/Components/Default.tsx`

**Description:** Help documentation page explaining available editor components, widgets, and layouts.

| Property | Value |
|----------|-------|
| Size | 5.02 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../../../config/env` → `config/env.ts`
- `../../../components/controls/DataCard` → `src/components/controls/DataCard/index.ts`

**External Dependencies:**

- `antd`
- `react`
- `react-router-dom`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 30, 2025** - Configuration centralized per project *(CCTEvalencia)*
- *...and 1 more commits*

---

### `src/pages/Help/Default.tsx`

**Description:** Main help page with application overview, navigation guide, and documentation links.

| Property | Value |
|----------|-------|
| Size | 278 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../components/controls/Link` → `src/components/controls/Link/index.ts`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Home/Default.tsx`

**Description:** Home dashboard page with quick actions, recent creatives, and getting started guidance.

| Property | Value |
|----------|-------|
| Size | 7.2 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `@ant-design/icons`
- `antd`
- `react`
- `react-router-dom`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Templates/Index.tsx`

**Description:** Template gallery page for browsing and creating creatives from predefined templates.

| Property | Value |
|----------|-------|
| Size | 1.9 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `antd`
- `react`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/services/auth.ts`

**Description:** Authentication service handling email verification, code validation, token management, and API communication.

| Property | Value |
|----------|-------|
| Size | 4.67 KB |
| Created | Sep 30, 2025 |
| Updated | Dec 11, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../config/env` → `config/env.ts`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Jan 13, 2026** - Added Clock Widget and General Optimization *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- *...and 2 more commits*

---

### `src/services/codebase.ts`

| Property | Value |
|----------|-------|
| Size | 3.4 KB |
| Created | Jan 21, 2026 |
| Updated | Jan 21, 2026 |
| Category | source |

**Internal Dependencies:**

- `../config/env` → `src/config/env.ts`
- `../types/codebase` → `src/types/codebase.ts`

**Recent History:**

- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*

---

### `src/services/creative.ts`

**Description:** Creative service providing API methods for CRUD operations, flattening, and element manipulation.

| Property | Value |
|----------|-------|
| Size | 8.14 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../types/creative` → `src/types/creative.ts`
- `../../config/env` → `config/env.ts`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 30, 2025** - Configuration centralized per project *(CCTEvalencia)*
- *...and 1 more commits*

---

### `src/services/deliverer.ts`

**Description:** Delivery service managing creative deployment and distribution to external systems.

| Property | Value |
|----------|-------|
| Size | 0 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*
- **May 13, 2025** - First Commit *(CCTEVP)*

---

### `src/services/logger.ts`

**Description:** Logging service providing structured logging with winston for debugging and monitoring.

| Property | Value |
|----------|-------|
| Size | 1.39 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../../config/env` → `config/env.ts`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Development + Docker environments *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/types/codebase.ts`

| Property | Value |
|----------|-------|
| Size | 1.45 KB |
| Created | Jan 21, 2026 |
| Updated | Jan 27, 2026 |
| Category | source |
**Recent History:**

- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*

---

### `src/types/creative.ts`

**Description:** TypeScript type definitions for Creative, CreativeChange, and CreativeResponse data structures.

| Property | Value |
|----------|-------|
| Size | 829 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |

**Internal Dependencies:**

- `../components/editor/layouts/types` → `src/components/editor/layouts/types.ts`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/utils/layoutUtils.ts`

| Property | Value |
|----------|-------|
| Size | 6.09 KB |
| Created | Jan 21, 2026 |
| Updated | Jan 27, 2026 |
| Category | source |
**External Dependencies:**

- `@xyflow/react`
- `dagre`

**Recent History:**

- **Jan 22, 2026** - Checkpoint before Switch to Antigravity *(CCTEvalencia)*

---

### `src/vite-env.d.ts`

**Description:** Vite environment type declarations for client-side type safety.

| Property | Value |
|----------|-------|
| Size | 39 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `vite.config.ts`

**Description:** Vite build configuration setting up React plugin, server port, build output, and path aliases.

| Property | Value |
|----------|-------|
| Size | 1.4 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | source |
**External Dependencies:**

- `@vitejs/plugin-react`
- `vite`

**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 30, 2025** - Configuration centralized per project *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

## Style

### `src/App.css`

**Description:** Global application styles and CSS overrides for the main App component.

| Property | Value |
|----------|-------|
| Size | 652 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/auth/Login.css`

**Description:** Stylesheet for login components including email step and code verification styling.

| Property | Value |
|----------|-------|
| Size | 3.71 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ActionButtons/styles/default.css`

**Description:** CSS styles for default action buttons layout and appearance.

| Property | Value |
|----------|-------|
| Size | 228 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeCanvas/Default.css`

**Description:** Styles for creative canvas including container, scene, and element positioning.

| Property | Value |
|----------|-------|
| Size | 8.11 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeCard/styles/default.css`

**Description:** CSS styles for creative card layout and hover effects.

| Property | Value |
|----------|-------|
| Size | 119 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/CreativeScene/Default.css`

**Description:** Minimal CSS for creative scene container styling.

| Property | Value |
|----------|-------|
| Size | 55 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Modal/styles/default.css`

**Description:** CSS styles for modal component customization.

| Property | Value |
|----------|-------|
| Size | 77 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/ProtectedRoute/styles/default.css`

**Description:** CSS styles for protected route container and loading states.

| Property | Value |
|----------|-------|
| Size | 102 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Section/styles/default.css`

**Description:** CSS styles for section component layout.

| Property | Value |
|----------|-------|
| Size | 81 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Sidebar/styles/default.css`

**Description:** CSS styles for sidebar layout and navigation styling.

| Property | Value |
|----------|-------|
| Size | 81 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/Tag/Tag.module.css`

**Description:** CSS module defining tag component styles with color variants.

| Property | Value |
|----------|-------|
| Size | 811 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/components/controls/TopBar/styles/default.css`

**Description:** CSS styles for top bar layout and branding.

| Property | Value |
|----------|-------|
| Size | 79 Bytes |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/index.css`

**Description:** Global application styles including CSS reset, typography, and utility classes.

| Property | Value |
|----------|-------|
| Size | 2.03 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Creatives/Default.css`

**Description:** Styles for creative list page including table, cards, and action buttons.

| Property | Value |
|----------|-------|
| Size | 5.77 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Creatives/Edit.css`

**Description:** Styles for creative editor page including layout, toolbar, canvas, and panel positioning.

| Property | Value |
|----------|-------|
| Size | 15.82 KB |
| Created | Sep 30, 2025 |
| Updated | Sep 30, 2025 |
| Category | style |
**Recent History:**

- **Jan 16, 2026** - CardWidget Animations and Build Automation *(CCTEvalencia)*
- **Sep 25, 2025** - Switch to Node.js *(CCTEvalencia)*

---

### `src/pages/Help/Codebase/reactflow-selection.css`

| Property | Value |
|----------|-------|
| Size | 1.11 KB |
| Created | Jan 27, 2026 |
| Updated | Jan 27, 2026 |
| Category | style |
---

### `src/pages/Help/Codebase/styles.css`

| Property | Value |
|----------|-------|
| Size | 447 Bytes |
| Created | Jan 21, 2026 |
| Updated | Jan 27, 2026 |
| Category | style |
**Recent History:**

- **Jan 21, 2026** - Builder -> Help -> Codebase UI *(CCTEvalencia)*

---

## 📦 External Dependencies Summary

Total unique external packages: **17**

| Package | Usage Count |
|---------|-------------|
| `react` | 69 |
| `antd` | 23 |
| `react-router-dom` | 9 |
| `@ant-design/icons` | 8 |
| `@xyflow/react` | 2 |
| `@eslint/js` | 1 |
| `globals` | 1 |
| `eslint-plugin-react-hooks` | 1 |
| `eslint-plugin-react-refresh` | 1 |
| `typescript-eslint` | 1 |
| `react-dom/client` | 1 |
| `antd/dist/reset.css` | 1 |
| `antd/es/table` | 1 |
| `@xyflow/react/dist/style.css` | 1 |
| `dagre` | 1 |
| `vite` | 1 |
| `@vitejs/plugin-react` | 1 |

