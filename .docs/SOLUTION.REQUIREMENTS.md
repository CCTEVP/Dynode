# DN Dynamic Campaign Tools - Requirements Document

> **Version:** 2.0  
> **Date:** January 20, 2026  
> **Purpose:** Comprehensive requirements reference for optimization and feature development

## 1. System Overview

### 1.1 Project Description

**DN Dynamic Campaign Tools (Dynode)** is a comprehensive digital advertising platform designed for creating, managing, and deploying dynamic creative campaigns. The system consists of four interconnected microservices that provide data management, creative rendering, user interface capabilities, and real-time communication.

### 1.2 Architecture Pattern

- **Microservices Architecture**: Four distinct services with specific responsibilities
- **RESTful API Design**: Standard HTTP/HTTPS communication between services
- **WebSocket Communication**: Real-time bidirectional messaging via echo.dynode
- **Database-Driven**: MongoDB as primary data store with materialized views
- **Containerized Deployment**: Docker-based containerization with Docker Compose orchestration

### 1.3 Core Services

#### 1.3.1 Source Service (source.dynode)

- **Port**: 3333 (HTTPS), 3000 (HTTP in Docker)
- **Purpose**: Core backend API — data management, authentication, asset storage, and system of record
- **Technology Stack**: Node.js 18+, Express 5.1, TypeScript 5.8, MongoDB 5.0+/Mongoose 8.0, JWT, bcrypt 6.0, Winston 3.17, Ajv 8.17
- **Key Responsibilities**:
  - User authentication (JWT-based, email verification flow)
  - CRUD operations for creatives (assemblies, dynamics, interactives)
  - Element and component management with materialized views
  - Asset upload, storage, and metadata management via Multer
  - Resource scraping to extract components/libraries/assets from creatives
  - Centralized logging endpoint for all services
  - OpenAPI/Swagger documentation

#### 1.3.2 Render Service (render.dynode)

- **Port**: 5000 (HTTP), 5555 (HTTPS)
- **Purpose**: Dynamic creative rendering engine — on-demand asset bundling and creative delivery
- **Technology Stack**: Node.js 18+, Express 5.x, TypeScript 5.x, Axios, Terser, CleanCSS, Pug templates
- **Key Responsibilities**:
  - Fetches creative definitions from source.dynode
  - Bundles components, libraries, and assets on-the-fly
  - Minifies/optimizes JavaScript (Terser) and CSS (CleanCSS)
  - Generates HTML pages with embedded creative content
  - Proxies asset requests to source.dynode
  - Applies runtime behaviours to creatives
  - Forwards logs to source.dynode centralized logging

#### 1.3.3 Builder Service (builder.dynode)

- **Port**: 4000 (HTTP), 4444 (HTTPS)
- **Purpose**: React-based web UI for creative authoring, managers and operators
- **Technology Stack**: React 19.1, Vite 6.3, TypeScript 5.8, Ant Design 5.26, React Router 7.6, Zustand 5.0, @dnd-kit 6.3/10.0, @xyflow/react 12.10, react-grid-layout 1.5
- **Key Responsibilities**:
  - User authentication via source.dynode (email + code verification)
  - Creative listing, editing, and visual composition
  - Drag-and-drop grid-based creative editor
  - Asset upload and management interface
  - Template and community features
  - Help documentation and component reference
  - Client-side logging forwarded to source.dynode

#### 1.3.4 Echo Service (echo.dynode)

- **Port**: 7777 (HTTP/WebSocket), 8080 (Cloud Run default)
- **Purpose**: Real-time WebSocket broadcast server with room-based routing
- **Technology Stack**: Node.js 18+, ws 8.18, Swagger UI, HMAC-SHA256 authentication, Winston 3.11, ioredis 5.3, express-rate-limit 7.1
- **Key Responsibilities**:
  - Room-based WebSocket broadcasting (radio, chat, custom rooms)
  - HTTP POST injection for server-to-client push
  - Token-based authentication (HMAC-SHA256 signed tokens)
  - Modular room handlers with inheritance model (BaseRoomHandler)
  - Health monitoring and connection lifecycle management
  - Cloud Run-friendly deployment with heartbeat keepalive
  - Integration with digital signage players and live content updates
  - Documentation authentication for Swagger UI
  - Control channel support for management clients
  - Rate limiting and Redis integration

### 1.4 Service Synergy & Communication Patterns

The four services form a cohesive ecosystem where each service has distinct responsibilities while maintaining clear integration points:

#### 1.4.1 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DYNODE ECOSYSTEM                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────────┐                    ┌──────────────────┐              │
│   │  builder.dynode  │────Auth/CRUD──────▶│  source.dynode   │              │
│   │    (React UI)    │◀───Creatives/Assets│   (Core API)     │              │
│   │   Port: 4000     │                    │   Port: 3000     │              │
│   └────────┬─────────┘                    └────────┬─────────┘              │
│            │                                        │                        │
│            │ WebSocket                              │ REST API               │
│            │ Live Updates                           │ Data/Assets            │
│            ▼                                        ▼                        │
│   ┌──────────────────┐                    ┌──────────────────┐              │
│   │   echo.dynode    │                    │  render.dynode   │              │
│   │   (WebSocket)    │◀──HTTP Broadcast───│   (Renderer)     │              │
│   │   Port: 7777     │                    │   Port: 5000     │              │
│   └────────┬─────────┘                    └──────────────────┘              │
│            │                                                                 │
│            │ Real-time Push                                                  │
│            ▼                                                                 │
│   ┌──────────────────────────────────────────────────────────┐              │
│   │         Digital Signage Players / End Clients            │              │
│   └──────────────────────────────────────────────────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 1.4.2 Integration Patterns

| Integration         | Source → Target         | Protocol        | Purpose                                          |
| ------------------- | ----------------------- | --------------- | ------------------------------------------------ |
| Authentication      | builder → source        | HTTPS/JWT       | User login, email verification, token management |
| Creative CRUD       | builder → source        | HTTPS/REST      | Create, read, update, delete creatives           |
| Asset Management    | builder → source        | HTTPS/Multipart | Upload and manage media assets                   |
| Creative Fetch      | render → source         | HTTP/REST       | Retrieve creative definitions with children      |
| Asset Proxy         | render → source         | HTTP            | Serve fonts, images, videos to clients           |
| Centralized Logging | builder/render → source | HTTPS/POST      | Forward client and server logs                   |
| Live Updates        | builder/render → echo   | WebSocket       | Receive real-time content updates                |
| Broadcast Push      | echo → clients          | WebSocket       | Push radio content, notifications                |
| HTTP Injection      | servers → echo          | HTTP POST       | Trigger broadcasts from backend services         |

#### 1.4.3 Source.dynode (System of Record)

**Central Hub Responsibilities:**

- **Authentication Authority**: All services validate tokens against source.dynode
- **Data Store**: Single source of truth for creatives, elements, components, assets, users
- **Asset Repository**: Manages file storage and serves assets via `/files/assets`
- **API Gateway**: Exposes `/data/*` and `/files/*` endpoints consumed by all services
- **Log Aggregator**: Collects logs from builder and render services via `/files/logs`

**Key API Endpoints:**

- `POST /auth/check-email` → Email verification initiation
- `POST /auth/verify-code` → Code verification and JWT issuance
- `GET /auth/me` → Current user profile
- `POST /login` → Password-based authentication
- `GET /data/creatives` → List all creatives (with optional `?children=true`)
- `GET /data/creatives/:id` → Get single creative with elements
- `PUT /data/creatives/:type/:id` → Update creative (triggers resource scraping)
- `POST /files/assets` → Upload assets with metadata
- `POST /files/logs` → Receive forwarded logs from clients

#### 1.4.4 Render.dynode (Delivery Engine)

**Rendering Pipeline:**

1. Receives request for creative at `/dynamics/:id`
2. Fetches creative definition from source.dynode (`/data/creatives/:id`)
3. Applies runtime behaviours to creative data
4. Renders Pug template with creative content
5. Bundles resources on-demand:
   - `/dynamics/:id/components.min.js` → Concatenated component scripts
   - `/dynamics/:id/libraries.min.js` → Concatenated library scripts
   - `/dynamics/:id/assets.min.css` → Combined stylesheets with font-face rules
   - `/dynamics/:id/manager.min.js` → Creative manager script
6. Proxies asset requests to source.dynode for media files

**Bundler Capabilities:**

- Component script aggregation from `views/scripts/components/`
- Library script aggregation
- CSS minification via CleanCSS
- JavaScript minification via Terser
- Font-face rule generation from asset metadata
- Service worker cache list generation (configurable)

#### 1.4.5 Builder.dynode (Management Interface)

**User Interface Features:**

- **Protected Routes**: All routes wrapped in `ProtectedRoute` requiring authentication
- **Lazy Loading**: Code-split pages for optimal performance
- **Dual Layouts**: MainLayout (with navigation) and FullLayout (immersive editor)

**Service Layer:**

- `AuthService`: Handles email/code verification flow, token persistence
- `CreativeService`: CRUD operations against source.dynode API
- `DelivererService`: Content delivery coordination
- `LoggerService`: Client-side error forwarding to source.dynode

**Key Routes:**

- `/` → Home dashboard
- `/creatives` → Creative listing with search/filter
- `/creatives/edit/:id` → Grid-based creative editor
- `/assets/upload` → Asset upload interface
- `/templates` → Template library
- `/community` → Community features
- `/help`, `/help/components` → Documentation

#### 1.4.6 Echo.dynode (Real-time Layer)

**Room-Based Architecture:**

- **BaseRoomHandler**: Abstract class providing authentication, message processing, lifecycle hooks
- **Room Discovery**: Auto-discovery of handlers in `src/rooms/` directory
- **Inheritance Model**: Custom rooms extend base and override specific methods

**Built-in Rooms:**

- `radio`: Radio content broadcasting with advertiser tracking, content history, broadcast delay
- `chat`: Example chat room implementation

**Authentication Flow:**

1. Client requests token: `POST /auth/token` with `{clientId, room, expiresIn}`
2. Server signs HMAC-SHA256 token with room scope
3. Client connects: `ws://host/:room?token=TOKEN`
4. Handler verifies token matches room

**Broadcasting Mechanisms:**

- **WebSocket**: Client-to-client via room handler
- **HTTP POST**: Server-to-room via `POST /:room/postcontent`
- **Delayed Broadcast**: Configurable delay for radio content sync

## 2. Functional Requirements

### 2.1 User Management & Authentication

#### 2.1.1 User Authentication

- **JWT-based Authentication**: Secure token-based authentication system
- **Email Verification Flow**: 6-digit code verification for account access
- **Password-based Login**: Traditional username/password authentication with bcrypt hashing
- **Session Management**: Token persistence with configurable expiration

#### 2.1.2 User Roles & Permissions

- **User Registration**: Create new user accounts with email verification
- **Password Management**: Password reset and update capabilities
- **User Profile Management**: Edit user information and preferences
- **Authorization Middleware**: Route-level access control (currently disabled for data/files endpoints)

#### 2.1.3 Security Features

- **CORS Configuration**: Configurable allowed origins for cross-origin requests
- **SSL/TLS Support**: HTTPS endpoints with PFX certificate support
- **Token Validation**: Middleware for JWT token verification
- **Input Validation**: Request validation and sanitization

### 2.2 Creative Management

#### 2.2.1 Creative Types

The system supports three distinct creative types:

**Creative Assemblies**

- Static creative compositions
- Pre-defined layouts and arrangements
- Collection: `creatives_assemblies`

**Creative Dynamics**

- Dynamic content with real-time data binding
- Variable content based on external data sources
- Collection: `creatives_dynamics`

**Creative Interactives**

- Interactive elements and user engagement features
- Event-driven content modifications
- Collection: `creatives_interactives`

#### 2.2.2 Creative Data Structure

Each creative contains the following core properties:

- **Metadata**: Name, creation/update timestamps, format
- **Styling**: CSS style mappings and theme configurations
- **Hierarchy**: Parent-child relationships for nested structures
- **Status Tracking**: Multi-state status indicators
- **Change History**: Audit trail with user attribution and timestamps
- **Caching**: Performance optimization with configurable cache duration
- **Resources**: Components, libraries, and assets metadata

#### 2.2.3 Creative Operations

- **CRUD Operations**: Full create, read, update, delete functionality
- **Bulk Retrieval**: List all creatives with optional filtering
- **Detail Views**: Individual creative retrieval with optional child elements
- **Version Control**: Change tracking with old/new value comparison
- **Resource Scraping**: Automatic component and asset discovery during updates

### 2.3 Element Management

#### 2.3.1 Element Types & Modes

- **Assets Mode**: Elements with associated media files and resources
- **Binding Mode**: Elements with dynamic data connections
- **Default Collection**: Raw element data without specialized views

#### 2.3.2 Element Operations

- **Multi-View Support**: Different perspectives (assets, binding, collection) for same data
- **Materialized Views**: Pre-computed views for performance optimization
- **Relationship Management**: Parent-child element hierarchies

### 2.4 Asset Management

#### 2.4.1 File Upload & Storage

- **Multer Integration**: Multipart file upload handling
- **Storage Organization**: Categorized file storage by asset type
- **Metadata Extraction**: Automatic asset information inference
- **Database Integration**: Asset records in MongoDB with file system references

#### 2.4.2 Supported Asset Types

- **Images**: Various formats with metadata extraction
- **Videos**: Video file support with duration and format information
- **Documents**: PDF and other document types
- **Fonts**: Font file management for typography
- **Scripts**: JavaScript files and libraries

#### 2.4.3 Asset Operations

- **Upload Processing**: Multi-file upload with progress tracking
- **Asset Cataloging**: Searchable asset database with metadata
- **Asset Association**: Link assets to creative elements and components

### 2.5 Component System

#### 2.5.1 Component Architecture

- **Reusable Components**: Modular creative building blocks
- **Component Library**: Centralized repository of available components
- **Component Metadata**: Type, version, dependencies, and configuration data

#### 2.5.2 Component Operations

- **Component Registration**: Add new components to library
- **Component Retrieval**: List and search available components
- **Dependency Management**: Track component relationships and requirements
- **Component Bundling**: Render-time component assembly

### 2.6 Rendering System

#### 2.6.1 Dynamic Rendering

- **On-Demand Rendering**: Real-time creative assembly based on requests
- **Asset Bundling**: Combine components, libraries, and assets into deliverable format
- **Template Processing**: Apply data to dynamic templates
- **CSS/JS Optimization**: Minification and optimization of client assets

#### 2.6.2 Rendering Features

- **Multi-Format Output**: Support for various creative formats and dimensions
- **Responsive Design**: Adaptive layouts for different screen sizes
- **Performance Optimization**: Caching and efficient resource loading
- **Debug Mode**: Development tools for creative debugging

### 2.7 Data Management

#### 2.7.1 Database Architecture

- **MongoDB Integration**: Primary data store with Mongoose ODM
- **Schema Design**: Flexible schemas with inheritance and composition
- **Materialized Views**: Pre-computed aggregations for performance
- **Collection Strategy**: Separate collections for different entity types

#### 2.7.2 Data Relationships

- **Hierarchical Data**: Parent-child relationships for nested structures
- **Reference Management**: Foreign key relationships between entities
- **Embedded Documents**: Denormalized data for performance optimization

### 2.8 Real-time Communication (echo.dynode)

#### 2.8.1 WebSocket Broadcasting

- **Room-Based Routing**: Clients connect to specific rooms; messages scoped to room
- **Message Enrichment**: Automatic metadata injection (timestamp, sender info)
- **Broadcast Delay**: Configurable delay for synchronized content delivery
- **Content History**: Recent messages cached for late-joining clients

#### 2.8.2 Room Handler System

- **BaseRoomHandler**: Abstract base class with lifecycle hooks
  - `verifyAuth(authPayload, req, clientAddress)`: Custom authentication logic per room
  - `onJoin(socket, req, clientAddress, authPayload)`: Connection lifecycle events (join)
  - `onLeave(socket, clientAddress, code, reason)`: Connection lifecycle events (leave)
  - `onControlJoin(socket, req, clientAddress)`: Control channel join handler
  - `onControlLeave(socket, clientAddress, code, reason)`: Control channel leave handler
  - `onMessage(payload, socket, clientAddress)`: Message processing and transformation
  - `onHttpPost(payload)`: HTTP-triggered broadcast handling
  - `validateMessage(payload, socket)`: Payload validation for WebSocket messages
  - `validateHttpPost(payload)`: Payload validation for HTTP POST
  - `getWelcomeMessage(socket)`: Custom welcome for new clients
  - `getRoomStats(clients)`: Room statistics for health endpoint
  - `onHeartbeat()`: Periodic maintenance hook
  - `getRoutes()`: Custom HTTP routes for room
  - `getControlPayload(context)`: Control channel payload generation
  - `getBroadcastDelay(context)`: Dynamic broadcast delay calculation
- **Auto-Discovery**: Room handlers automatically registered from `src/rooms/` directory
- **Inheritance Model**: Custom rooms override only needed methods

#### 2.8.3 Authentication & Security

- **HMAC-SHA256 Tokens**: Signed tokens with room scope and expiration
- **Token Generation**: `POST /auth/token` endpoint for token issuance
- **Per-Room Verification**: Each room can implement custom auth logic
- **Origin Allowlist**: Configurable WebSocket origin restrictions
- **Payload Size Limits**: Independent limits for WebSocket and HTTP POST

#### 2.8.4 Connection Management

- **Heartbeat Keepalive**: Configurable ping/pong interval (default 30s)
- **Idle Timeout**: Optional per-connection idle timeout
- **Max Connection Age**: Optional maximum connection lifetime
- **Graceful Shutdown**: SIGTERM handling with close code 4002

#### 2.8.5 Built-in Rooms

**Radio Room (`/radio`):**

- Radio content broadcasting for digital signage
- Advertiser tracking and content metadata
- Content history for late joiners
- Configurable broadcast delay (`RADIO_POST_BROADCAST_DELAY_SECONDS`)
- Control channel support for management clients

**Chat Room (`/chat`):**

- Example implementation for real-time messaging
- Demonstrates room handler patterns

#### 2.8.6 HTTP Push API

- **POST /:room/postcontent**: Inject content into room broadcast
- **Authentication Required**: Bearer token validation
- **Custom Validation**: Per-room payload validation
- **Response**: Confirmation with client broadcast count

## 3. Technical Requirements

### 3.1 Development Environment

#### 3.1.1 Programming Languages & Frameworks

- **Backend**: Node.js with TypeScript, Express.js framework
- **Frontend**: React 19 with TypeScript, Vite build system
- **Database**: MongoDB with Mongoose ODM
- **Styling**: CSS-in-JS, Ant Design component library

#### 3.1.2 Development Tools

- **Build System**: TypeScript compiler, Vite bundler
- **Code Quality**: ESLint for linting, TypeScript for type safety
- **Process Management**: ts-node-dev for development, PM2 for production
- **Testing**: Puppeteer for automated browser testing

#### 3.1.3 Dependencies & Libraries

**Source Service (source.dynode) Dependencies:**

```json
{
  "runtime": [
    "express@^5.1.0",
    "mongoose@^8.0.0",
    "jsonwebtoken@^9.0.2",
    "bcrypt@^6.0.0",
    "multer@^2.0.1",
    "winston@^3.17.0",
    "winston-daily-rotate-file@^5.0.0",
    "cors@^2.8.5",
    "swagger-ui-express@^5.0.1",
    "swagger-jsdoc@^6.2.8",
    "dotenv@^16.5.0",
    "cookie-parser@~1.4.4",
    "debug@~2.6.9",
    "morgan@~1.9.1",
    "pug@2.0.0-beta11",
    "ajv@^8.17.1",
    "http-errors@~1.6.3"
  ],
  "development": [
    "typescript@^5.8.3",
    "ts-node-dev@^2.0.0",
    "@types/node@^24.0.0",
    "@types/bcrypt@^5.0.2",
    "@types/cors@^2.8.19",
    "@types/express@^5.0.3",
    "@types/jsonwebtoken@^9.0.9",
    "@types/multer@^2.0.0",
    "@types/swagger-jsdoc@^6.0.4",
    "@types/swagger-ui-express@^4.1.8",
    "cpx@^1.5.0"
  ]
}
```

**Render Service (render.dynode) Dependencies:**

```json
{
  "runtime": [
    "express@^5.1.0",
    "axios@^1.10.0",
    "terser@^5.43.1",
    "clean-css@^5.3.3",
    "winston@^3.17.0",
    "winston-daily-rotate-file@^5.0.0",
    "dotenv@^16.5.0",
    "pug@2.0.0-beta11",
    "bcrypt@^6.0.0",
    "cookie-parser@~1.4.4",
    "debug@~2.6.9",
    "jsonwebtoken@^9.0.2",
    "morgan@~1.9.1",
    "lru-cache@^11.2.4",
    "http-errors@~1.6.3"
  ],
  "development": [
    "typescript@^5.8.3",
    "ts-node-dev@^2.0.0",
    "@types/node@^24.0.0",
    "@types/bcrypt@^5.0.2",
    "@types/clean-css@^4.2.11",
    "@types/express@^5.0.3",
    "@types/jsonwebtoken@^9.0.9",
    "@types/swagger-jsdoc@^6.0.4",
    "@types/swagger-ui-express@^4.1.8",
    "cpx@^1.5.0"
  ]
}
```

**Builder Service (builder.dynode) Dependencies:**

```json
{
  "runtime": [
    "react@^19.1.0",
    "react-dom@^19.1.0",
    "antd@^5.26.7",
    "react-router-dom@^7.6.3",
    "zustand@^5.0.8",
    "@dnd-kit/core@^6.3.1",
    "@dnd-kit/sortable@^10.0.0",
    "react-grid-layout@^1.5.2",
    "winston@^3.17.0",
    "winston-daily-rotate-file@^5.0.0",
    "@types/dagre@^0.7.53",
    "@xyflow/react@^12.10.0",
    "dagre@^0.8.5"
  ],
  "development": [
    "vite@^6.3.5",
    "typescript@~5.8.3",
    "@vitejs/plugin-react@^4.4.1",
    "rollup-plugin-visualizer@^6.0.3",
    "lightningcss@^1.31.1",
    "@eslint/js@^9.25.0",
    "@types/mongoose@^5.11.96",
    "@types/node@^24.0.8",
    "@types/react@^19.1.9",
    "@types/react-dom@^19.1.7",
    "@types/react-grid-layout@^1.3.5",
    "@types/react-router-dom@^5.3.3",
    "eslint@^9.25.0",
    "eslint-plugin-react-hooks@^5.2.0",
    "eslint-plugin-react-refresh@^0.4.19",
    "globals@^16.0.0",
    "typescript-eslint@^8.30.1"
  ]
}
```

**Echo Service (echo.dynode) Dependencies:**

```json
{
  "runtime": [
    "ws@^8.18.0",
    "dotenv@^17.2.3",
    "swagger-ui-express@^5.0.1",
    "swagger-jsdoc@^6.2.8",
    "winston@^3.11.0",
    "ioredis@^5.3.2",
    "express-rate-limit@^7.1.5"
  ],
  "development": ["nodemon@^3.1.4", "eslint@^8.57.0"]
}
```

### 3.2 Infrastructure Requirements

#### 3.2.1 Containerization

- **Docker**: Individual Dockerfiles for each service
- **Docker Compose**: Multi-service orchestration with networking
- **Volume Management**: Persistent storage for assets and logs
- **Secrets Management**: Secure handling of certificates and passwords

#### 3.2.2 Networking & Ports

```yaml
services:
  source: 3000:80 (HTTP), 3333:443 (HTTPS) # Core Data API service
  builder: 4000:80 (HTTP), 4444:443 (HTTPS) # React UI application
  render: 5000:80 (HTTP), 5555:443 (HTTPS) # Creative rendering service
  echo: 7777:80 (HTTP/WebSocket) # Real-time broadcast service
  mongo: 32768:27017 # MongoDB database
```

#### 3.2.3 SSL/TLS Configuration

- **Certificate Management**: PFX certificate support for HTTPS endpoints
- **Development Mode**: HTTP endpoints for local development
- **Production Mode**: HTTPS-only with certificate validation

### 3.3 Performance Requirements

#### 3.3.1 Response Times

- **API Endpoints**: < 200ms for simple queries, < 2s for complex operations
- **Creative Rendering**: < 5s for standard creatives, < 15s for complex assemblies
- **Asset Upload**: Progress indication for files > 10MB
- **UI Responsiveness**: < 100ms for user interactions

#### 3.3.2 Scalability

- **Concurrent Users**: Support for 100+ concurrent creative editors
- **Data Volume**: Handle 10,000+ creatives with associated assets
- **Asset Storage**: Efficient storage and retrieval of large media files

#### 3.3.3 Caching Strategy

- **Browser Caching**: Client-side asset caching with cache-busting
- **Database Caching**: Materialized views for frequently accessed data
- **CDN Integration**: (Future requirement) Content delivery network support

### 3.4 Security Requirements

#### 3.4.1 Authentication Security

- **JWT Security**: Secure token generation with expiration
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure token storage and renewal

#### 3.4.2 Data Security

- **Input Validation**: Sanitization of all user inputs
- **SQL Injection Prevention**: Parameterized queries and ODM usage
- **File Upload Security**: File type validation and size limits

#### 3.4.3 Network Security

- **CORS Policy**: Strict origin validation for cross-origin requests
- **HTTPS Enforcement**: SSL/TLS for all production communications
- **API Security**: Rate limiting and request validation

## 4. User Interface Requirements

### 4.1 Web Application Structure

#### 4.1.1 Layout System

- **Main Layout**: Standard application layout with navigation and content areas
- **Full Layout**: Immersive layout for creative editing without distractions
- **Responsive Design**: Adaptive layouts for desktop, tablet, and mobile devices

#### 4.1.2 Navigation & Routing

```
/                    → Home dashboard
/creatives           → Creative management listing
/creatives/edit/:id  → Creative editor (FullLayout)
/sources             → Data sources listing
/sources/:id         → Source editor (FullLayout)
/assets              → Asset management listing
/assets/:id          → Asset editor (FullLayout)
/templates           → Template library
/community           → Community features
/help                → Documentation and help
/help/components     → Component documentation
/help/design         → Design guide
/help/codebase       → Codebase documentation
```

**Layout Strategy:**

- **MainLayout**: Used for list views and documentation (includes sidebar navigation)
- **FullLayout**: Used for editor views (immersive, minimal chrome)

#### 4.1.3 User Experience Features

- **Lazy Loading**: Code-splitting for optimal performance
- **Loading States**: Spinner indicators for async operations
- **Error Handling**: User-friendly error messages and recovery options
- **Breadcrumbs**: Navigation context for deep page structures

### 4.2 Creative Editor Interface

#### 4.2.1 Editor Features

- **Drag & Drop**: Component placement and arrangement
- **Grid Layout**: React Grid Layout for precise positioning
- **Property Panels**: Real-time property editing for selected elements
- **Preview Mode**: Live preview of creative output

#### 4.2.2 Asset Integration

- **Asset Browser**: Visual asset selection and management
- **Drag & Drop Upload**: Intuitive file upload workflow
- **Asset Preview**: Thumbnail and metadata display

#### 4.2.3 Collaboration Features

- **Change Tracking**: Visual indication of modifications
- **User Attribution**: Track who made specific changes
- **Concurrent Editing**: (Future requirement) Real-time collaborative editing

### 4.3 Administrative Interface

#### 4.3.1 User Management

- **User Listing**: Display all registered users with roles
- **User Creation**: Admin interface for adding new users
- **Permission Management**: Role and access control configuration

#### 4.3.2 System Monitoring

- **Log Viewer**: Real-time log monitoring and filtering
- **Performance Metrics**: System health and usage statistics
- **Asset Usage**: Storage utilization and cleanup tools

## 5. Integration Requirements

### 5.1 External System Integration

#### 5.1.1 API Integration

- **RESTful APIs**: Standard HTTP APIs for external system integration
- **Webhook Support**: (Future requirement) Event-driven notifications
- **Third-party Services**: Integration points for external creative services

#### 5.1.2 Data Export/Import

- **Creative Export**: JSON/XML export for backup and migration
- **Asset Migration**: Bulk asset import/export capabilities
- **Data Synchronization**: (Future requirement) Multi-environment sync

### 5.2 Development Integration

#### 5.2.1 Version Control

- **Git Integration**: Source code management with proper .gitignore
- **Branch Strategy**: Feature branches with merge workflows
- **Documentation**: Inline code documentation and README files

#### 5.2.2 CI/CD Pipeline (Future Requirement)

- **Automated Testing**: Unit and integration test execution
- **Build Automation**: Automated builds and deployments
- **Environment Management**: Dev, staging, production environments

## 6. Operational Requirements

### 6.1 Monitoring & Logging

#### 6.1.1 Application Logging

- **Winston Logger**: Structured logging with multiple transports
- **Daily Rotation**: Automatic log file rotation and archival
- **Log Levels**: Debug, info, warn, error severity levels
- **Client Logging**: Browser-side error reporting to server

#### 6.1.2 System Monitoring

- **Health Checks**: Service availability and dependency monitoring
- **Performance Monitoring**: Response time and resource usage tracking
- **Error Tracking**: Exception monitoring and alerting
- **Echo Health Endpoint**: `GET /health` returns uptime, client count, room statistics

### 6.1.3 Log Management

```
source.dynode/logs/     → Core API service logs (Winston + daily rotate)
render.dynode/          → Forwards logs to source.dynode /files/logs
builder.dynode/         → Client-side error logs forwarded to source.dynode
echo.dynode/            → Console logging (Cloud Run-friendly JSON format)
```

**Centralized Logging Pattern:**

- source.dynode acts as log aggregator via `POST /files/logs`
- render.dynode and builder.dynode forward logs to source
- echo.dynode uses structured console output for cloud logging

### 6.2 Backup & Recovery

#### 6.2.1 Data Backup

- **Database Backup**: Regular MongoDB backups with point-in-time recovery
- **Asset Backup**: File system backup for uploaded media
- **Configuration Backup**: Environment and configuration file preservation

#### 6.2.2 Disaster Recovery

- **Service Recovery**: Container restart and health check procedures
- **Data Recovery**: Database restoration from backup procedures
- **Business Continuity**: Minimal downtime recovery strategies

### 6.3 Maintenance Procedures

#### 6.3.1 Database Maintenance

- **Index Optimization**: Regular index analysis and optimization
- **Data Cleanup**: Archival of old creatives and temporary files
- **Performance Tuning**: Query optimization and schema refinement

#### 6.3.2 System Updates

- **Dependency Updates**: Regular security and feature updates
- **Service Updates**: Coordinated multi-service deployment procedures
- **Configuration Management**: Environment-specific configuration handling

## 7. Quality Attributes

### 7.1 Reliability

- **Uptime Target**: 99.5% availability during business hours
- **Error Recovery**: Graceful degradation during partial failures
- **Data Consistency**: ACID compliance for critical operations

### 7.2 Maintainability

- **Code Quality**: TypeScript for type safety and code clarity
- **Documentation**: Comprehensive API documentation with OpenAPI/Swagger
- **Testing**: Automated testing with Puppeteer for UI workflows

### 7.3 Usability

- **Intuitive Interface**: User-friendly design following modern UX principles
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design
- **Performance**: Responsive UI with minimal loading times

### 7.4 Scalability

- **Horizontal Scaling**: Container-based scaling for increased load
- **Database Scaling**: MongoDB sharding and replication support
- **CDN Ready**: Architecture prepared for content distribution networks

## 8. Constraints & Assumptions

### 8.1 Technical Constraints

- **Browser Support**: Modern browsers with ES2020 support (Chrome 88+, Firefox 85+, Safari 14+)
- **Node.js Version**: Node.js 18+ required for all services
- **MongoDB Version**: MongoDB 5.0+ for advanced aggregation features
- **SSL Certificates**: PFX format certificates required for HTTPS

### 8.2 Business Constraints

- **Development Team**: TypeScript/React expertise required for modifications
- **Deployment**: Docker and container orchestration knowledge needed
- **Data Privacy**: Compliance with data protection regulations

### 8.3 Assumptions

- **Network Connectivity**: Reliable high-speed internet for asset operations
- **Storage Capacity**: Sufficient disk space for creative assets and logs
- **Development Environment**: VS Code or compatible IDE with TypeScript support

## 9. Future Enhancement Opportunities

### 9.1 Feature Enhancements

- **Real-time Collaboration**: Multi-user editing with conflict resolution via echo.dynode
- **Version Branching**: Git-like versioning for creative projects
- **Template Marketplace**: Community-driven template sharing
- **Advanced Analytics**: Usage metrics and performance analytics
- **Mobile App**: Native mobile application for creative management
- **Live Preview Sync**: Real-time preview updates across builder and render via WebSocket

### 9.2 Technical Improvements

- **Microservice Orchestration**: Kubernetes deployment for enterprise scale
- **API Gateway**: Centralized API management and rate limiting
- **Event Sourcing**: Event-driven architecture for audit and replay
- **GraphQL API**: More efficient data fetching for complex queries
- **Progressive Web App**: Offline capabilities and app-like experience

### 9.3 Integration Enhancements

- **Third-party Integrations**: Adobe Creative Suite, Figma, Canva connectors
- **Marketing Platforms**: Direct integration with ad platforms (Google, Facebook)
- **Analytics Integration**: Google Analytics, Adobe Analytics embedding
- **CDN Integration**: CloudFlare, AWS CloudFront for global delivery
- **SSO Integration**: Enterprise single sign-on (SAML, OAuth)

### 9.4 Performance Optimizations

- **Edge Computing**: Regional deployment for global performance
- **Caching Layer**: Redis for session and query caching
- **Database Optimization**: Read replicas and connection pooling
- **Asset Optimization**: Automatic image/video compression and format conversion
- **Code Splitting**: More granular lazy loading for improved initial load times

---

## 10. Appendices

### 10.1 Glossary

**Creative Assembly**: A static creative composition with predefined layouts  
**Creative Dynamic**: A creative with variable content based on external data  
**Creative Interactive**: A creative with user interaction capabilities  
**Element**: Individual building blocks that make up creatives  
**Component**: Reusable creative components stored in the system library  
**Asset**: Media files (images, videos, documents) used in creatives  
**Materialized View**: Pre-computed database views for performance optimization  
**Room**: A WebSocket channel in echo.dynode for scoped broadcasting  
**Room Handler**: A class that manages lifecycle and message processing for a room  
**Broadcast Delay**: Configurable delay before messages are sent to room clients  
**HTTP Injection**: Server-side triggering of WebSocket broadcasts via HTTP POST  
**Bundler**: Render service component that assembles and optimizes creative resources  
**Resource Scraping**: Automatic extraction of components/libraries/assets from creative data

### 10.2 References

- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [ws WebSocket Library](https://github.com/websockets/ws)
- [Vite Build Tool](https://vitejs.dev/)
- [Ant Design Component Library](https://ant.design/)

### 10.3 Contact Information

For questions about this requirements document or the DN Dynamic Campaign Tools system, please refer to the development team and project documentation in the repository.

---

_This requirements document serves as a comprehensive reference for understanding, optimizing, and extending the DN Dynamic Campaign Tools system. It should be updated as the system evolves and new requirements are identified._
