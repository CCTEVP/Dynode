# Dynode - DN Dynamic Campaign Tools

> **A microservices platform for creating, managing, and delivering dynamic digital advertising campaigns**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-green.svg)](https://www.mongodb.com/)

---

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Development Guide](#development-guide)
- [Deployment](#deployment)
- [Key Features](#key-features)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Dynode** is a comprehensive digital advertising platform consisting of four specialized microservices that work together to provide creative management, real-time broadcasting, and dynamic content delivery capabilities.

### What is Dynode?

Dynode enables marketing teams and content creators to:

- **Create** dynamic advertising creatives with data-driven content
- **Manage** assets, components, and creative libraries
- **Deliver** optimized creatives to digital signage and web platforms
- **Broadcast** real-time content updates via WebSocket

### Use Cases

- **Digital Signage**: Dynamic content for retail displays, corporate communications, public information
- **Dynamic Advertising**: Data-driven creative campaigns with real-time updates
- **Content Management**: Centralized asset and creative library management
- **Real-time Broadcasting**: Live content updates for connected displays

### System Components

| Service            | Purpose                    | Technology                   |
| ------------------ | -------------------------- | ---------------------------- |
| **source.dynode**  | Core API & Data Management | Express, TypeScript, MongoDB |
| **builder.dynode** | Web-based Creative Editor  | React, Vite, Ant Design      |
| **render.dynode**  | Creative Rendering Engine  | Express, Terser, CleanCSS    |
| **echo.dynode**    | WebSocket Broadcast Server | ws, Pure Node.js             |

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **MongoDB** 5.0 or higher ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized deployment) ([Download](https://www.docker.com/))

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Dynode
```

2. **Install dependencies for all services**

```bash
# Source service
cd source.dynode
npm install
cd ..

# Echo service
cd echo.dynode
npm install
cd ..

# Builder service
cd builder.dynode
npm install
cd ..

# Render service
cd render.dynode
npm install
cd ..
```

3. **Start MongoDB**

```bash
# If MongoDB is installed locally
mongod --dbpath /path/to/data/db

# Or use Docker
docker run -d -p 27017:27017 --name dynode-mongo mongo:5.0
```

4. **Configure environment variables**

Each service has `.env.dev` files with development defaults. For local development, these should work out of the box.

5. **Start the services**

Open **four separate terminal windows** and run:

```bash
# Terminal 1: Source service
cd source.dynode
npm run dev

# Terminal 2: Echo service
cd echo.dynode
npm run dev

# Terminal 3: Render service
cd render.dynode
npm run dev

# Terminal 4: Builder service
cd builder.dynode
npm run dev
```

6. **Access the application**

- **Builder UI**: http://localhost:4000
- **Source API Docs**: http://localhost:3333/docs
- **Render Service**: http://localhost:5000
- **Echo WebSocket**: ws://localhost:7777

### First Login

1. Navigate to http://localhost:4000
2. You'll need a user account in MongoDB. Create one using the source API or MongoDB directly
3. Use the email verification flow to log in

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Dynode Ecosystem                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │   builder    │────────▶│    source    │                  │
│  │  (React UI)  │◀────────│  (Core API)  │                  │
│  │  Port: 4000  │         │  Port: 3333  │                  │
│  └──────┬───────┘         └──────┬───────┘                  │
│         │                        │                           │
│         │                        │                           │
│         ▼                        ▼                           │
│  ┌──────────────┐         ┌──────────────┐                  │
│  │     echo     │         │    render    │                  │
│  │ (WebSocket)  │◀────────│  (Renderer)  │                  │
│  │  Port: 7777  │         │  Port: 5000  │                  │
│  └──────────────┘         └──────────────┘                  │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────┐                    │
│  │    Digital Signage / End Clients    │                    │
│  └─────────────────────────────────────┘                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Service Responsibilities

**source.dynode** - System of Record

- User authentication (JWT + email verification)
- CRUD operations for creatives, elements, components
- Asset storage and management
- Centralized logging
- Resource scraping (automatic component/library/asset extraction)

**builder.dynode** - Management Interface

- Web-based creative editor
- Drag-and-drop interface
- Asset upload and management
- User authentication UI
- Template and community features

**render.dynode** - Delivery Engine

- On-demand creative rendering
- JavaScript/CSS bundling and minification
- Asset proxying
- Template processing
- Behavior application

**echo.dynode** - Real-time Layer

- WebSocket broadcasting
- Room-based message routing
- HTTP injection for server-to-client push
- Configurable broadcast delays
- Control channel support

For detailed architecture information, see [SOLUTION.ARCHITECTURE.md](file:///E:/Development/Web/NODE/Dynode/.docs/SOLUTION.ARCHITECTURE.md).

---

## Development Guide

### Project Structure

```
Dynode/
├── source.dynode/          # Core API service
│   ├── app.ts              # Application entry point
│   ├── config.ts           # Environment configuration
│   ├── routes/             # API route handlers
│   ├── models/             # MongoDB models
│   ├── services/           # Business logic
│   └── middleware/         # Express middleware
│
├── echo.dynode/            # WebSocket server
│   ├── src/
│   │   ├── server.js       # Server entry point
│   │   ├── rooms/          # Room handlers
│   │   └── auth/           # Authentication
│   └── package.json
│
├── builder.dynode/         # React UI
│   ├── src/
│   │   ├── App.tsx         # React app root
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── components/     # Reusable components
│   └── vite.config.ts      # Vite configuration
│
├── render.dynode/          # Rendering engine
│   ├── app.ts              # Application entry point
│   ├── routes/             # Route handlers
│   ├── services/           # Bundler, behaviors
│   └── views/              # Pug templates
│
└── .docs/                  # Solution documentation
    ├── SOLUTION.ARCHITECTURE.md
    ├── SOLUTION.REQUIREMENTS.md
    └── README.md (this file)
```

### Running Individual Services

Each service can be run independently for development:

**Source Service:**

```bash
cd source.dynode
npm run dev
# Runs on http://localhost:3333
# API docs at /docs
```

**Echo Service:**

```bash
cd echo.dynode
npm run dev
# Runs on http://localhost:7777
# API docs at /docs (requires authentication)
```

**Builder Service:**

```bash
cd builder.dynode
npm run dev
# Runs on http://localhost:4000
# Vite dev server with HMR
```

**Render Service:**

```bash
cd render.dynode
npm run dev
# Runs on http://localhost:5000
```

### Building for Production

Each service has build scripts:

```bash
# Source
cd source.dynode
npm run build        # Compile TypeScript
npm start            # Run compiled code

# Echo
cd echo.dynode
npm start            # No build step (pure Node.js)

# Builder
cd builder.dynode
npm run build        # Vite production build
npm run preview      # Preview production build

# Render
cd render.dynode
npm run build        # Compile TypeScript
npm start            # Run compiled code
```

### Environment Variables

Each service uses environment-based configuration:

**Development** (`.env.dev`):

- Local MongoDB at `localhost:27017`
- HTTP endpoints
- Verbose logging

**Production** (`.env.prod`):

- Production MongoDB URIs
- HTTPS with certificates
- Optimized logging

**Docker** (auto-detected):

- Internal service names (`http://source`, `http://render`)
- Container networking
- MongoDB at `mongodb://mongo:27017`

### TypeScript Guidelines

- Use strict mode
- Define interfaces for all data structures
- Avoid `any` types where possible
- Use async/await for asynchronous operations
- Export types for reusability

---

## Deployment

### Docker Compose (Recommended)

The easiest way to deploy the entire stack:

1. **Ensure Docker and Docker Compose are installed**

2. **Build and start all services**

```bash
docker-compose up --build -d
```

3. **Access the services**

- Builder UI: http://localhost:4000
- Source API: http://localhost:3000
- Render Service: http://localhost:5000
- Echo WebSocket: ws://localhost:7777
- MongoDB: localhost:32768

4. **View logs**

```bash
docker-compose logs -f
```

5. **Stop services**

```bash
docker-compose down
```

### Individual Docker Builds

Build services individually:

```bash
# Source
cd source.dynode
docker build -t source-dynode:latest .

# Echo
cd echo.dynode
docker build -t echo-dynode:latest .

# Builder (with SSL certificate)
cd builder.dynode
docker build \
  --build-arg PFX_PASSWORD=YourPassword \
  -t builder-dynode:latest .

# Render
cd render.dynode
docker build -t render-dynode:latest .
```

### SSL/TLS Certificates

For HTTPS deployment:

1. **Generate or obtain PFX certificates**

```bash
# Example: Convert PEM to PFX
openssl pkcs12 -export \
  -out source.dynode.pfx \
  -inkey private.key \
  -in certificate.crt \
  -passout pass:YourPassword
```

2. **Place certificates in service directories**

```
source.dynode/cert/source.dynode.pfx
builder.dynode/cert/build.dynode.pfx
render.dynode/cert/render.dynode.pfx
```

3. **Set environment to production**

```bash
export APP_ENV=production
```

### Port Mappings

| Service | Internal | External HTTP | External HTTPS |
| ------- | -------- | ------------- | -------------- |
| source  | 80/443   | 3000          | 3333           |
| builder | 80/443   | 4000          | 4444           |
| render  | 80/443   | 5000          | 5555           |
| echo    | 80       | 7777          | -              |
| mongo   | 27017    | 32768         | -              |

---

## Key Features

### Creative Management

**Three Creative Types:**

- **Assemblies**: Static creative compositions
- **Dynamics**: Data-driven creatives with variable content
- **Interactives**: User-interactive creatives

**Features:**

- Drag-and-drop editor
- Component library
- Asset management
- Template system
- Version tracking

### Real-time Broadcasting

**WebSocket Rooms:**

- Room-based message routing
- Configurable broadcast delays
- HTTP injection for server-to-client push
- Control channels for monitoring

**Built-in Rooms:**

- `radio`: Content broadcasting with advertiser tracking
- `chat`: Real-time messaging

### Asset Management

- Multi-file upload
- Automatic metadata extraction
- Asset cataloging and search
- Font, image, video support
- Optimized delivery

### User Authentication

**Two Methods:**

1. **Email + Verification Code**
   - 6-digit code sent to email
   - 10-minute expiration
   - 3 attempt limit

2. **Password-based Login**
   - bcrypt hashed passwords
   - JWT token (24-hour expiry)

---

## API Documentation

### Source API (OpenAPI/Swagger)

Access interactive API documentation:

- **URL**: http://localhost:3333/docs
- **Format**: OpenAPI 3.0

**Key Endpoints:**

**Authentication:**

- `POST /auth/check-email` - Initiate email verification
- `POST /auth/verify-code` - Verify code and get JWT
- `GET /auth/me` - Get current user profile
- `POST /login` - Password-based login

**Creatives:**

- `GET /data/creatives` - List all creatives
- `GET /data/creatives/:id` - Get creative by ID
- `PUT /data/creatives/:type/:id` - Update creative
- `DELETE /data/creatives/:type/:id` - Delete creative

**Assets:**

- `POST /files/assets` - Upload assets
- `GET /files/assets/:filename` - Download asset

**Logging:**

- `POST /files/logs` - Forward client logs

### Echo API

Access WebSocket API documentation:

- **URL**: http://localhost:7777/docs
- **Authentication**: Required (username/password)

**Key Endpoints:**

**Authentication:**

- `POST /auth/token` - Generate WebSocket token

**Broadcasting:**

- `POST /:room/postcontent` - Inject content into room

**Health:**

- `GET /health` - Server health and statistics

### Render API

**Creative Rendering:**

- `GET /dynamics/:id` - Render creative HTML page
- `GET /dynamics/:id/components.min.js` - Component bundle
- `GET /dynamics/:id/libraries.min.js` - Library bundle
- `GET /dynamics/:id/assets.min.css` - Asset CSS bundle
- `GET /dynamics/:id/manager.min.js` - Manager script
- `GET /dynamics/:id/:filename.:ext` - Proxy asset

---

## Troubleshooting

### MongoDB Connection Issues

**Problem**: Services can't connect to MongoDB

**Solutions:**

1. Ensure MongoDB is running: `mongod --version`
2. Check connection string in `.env` files
3. For Docker: Use `mongodb://mongo:27017` instead of `localhost`
4. Check firewall settings

### CORS Errors

**Problem**: Browser shows CORS policy errors

**Solutions:**

1. Verify `allowedOrigins` in source.dynode config
2. Ensure builder URL is in the allowed origins list
3. Check that requests include proper origin headers
4. For development, ensure all services use correct ports

### Docker Networking Issues

**Problem**: Services can't communicate in Docker

**Solutions:**

1. Use internal service names (`http://source` not `http://localhost:3333`)
2. Verify all services are on the same Docker network
3. Check `APP_ENV=docker` is set
4. Review `config.ts` internal vs external origins

### Authentication Failures

**Problem**: Can't log in or token invalid

**Solutions:**

1. Check user exists in MongoDB `users_collection`
2. Verify JWT secret is configured
3. Check token hasn't expired (24h default)
4. For email verification, check logs for 6-digit code

### Build Failures

**Problem**: TypeScript compilation errors

**Solutions:**

1. Delete `node_modules` and reinstall: `npm ci`
2. Clear TypeScript cache: `rm -rf dist`
3. Check TypeScript version: `npx tsc --version`
4. Verify `tsconfig.json` is correct

### Port Already in Use

**Problem**: Can't start service, port in use

**Solutions:**

1. Find process using port: `lsof -i :3333` (Mac/Linux) or `netstat -ano | findstr :3333` (Windows)
2. Kill the process or use different port
3. Check if another instance is already running

---

## Contributing

### Code Structure Conventions

- Use TypeScript for all new backend code
- Follow existing file organization patterns
- Write meaningful commit messages
- Add JSDoc comments for public APIs

### Testing

- Test authentication flows
- Verify CRUD operations
- Test WebSocket connections
- Validate asset uploads

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and test thoroughly
3. Update documentation if needed
4. Submit pull request with description

---

## License

[Specify your license here]

---

## Contact

For questions, issues, or contributions, please contact the Dynode development team.

---

**Documentation Version:** 3.0  
**Last Updated:** February 6, 2026
