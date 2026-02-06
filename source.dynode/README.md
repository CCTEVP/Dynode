# Source.dynode - Core API Service

> **Core backend API and system of record for the Dynode ecosystem**

## Overview

Source.dynode is the central API service that provides authentication, data management, asset storage, and serves as the system of record for the entire Dynode platform. It exposes RESTful APIs for creative management, user authentication, and asset handling.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 5.1
- **Language**: TypeScript 5.8
- **Database**: MongoDB 5.0+ with Mongoose 8.0
- **Authentication**: JWT (jsonwebtoken 9.0) + bcrypt 6.0
- **Logging**: Winston 3.17 with daily rotate file
- **API Docs**: Swagger UI + OpenAPI 3.0

## Key Features

### Authentication

- **Email + Verification Code**: 6-digit code with 10-minute expiration
- **Password-based Login**: bcrypt hashed passwords with JWT tokens
- **JWT Tokens**: 24-hour expiration, includes user ID, username, and domains

### Data Management

- **Dual MongoDB Connections**: Separate databases for content and cache
- **Materialized Views**: Pre-computed aggregations for performance
- **CRUD Operations**: Full support for creatives, elements, components, assets, users
- **Resource Scraping**: Automatic extraction of components, libraries, and assets from creatives

### Asset Storage

- **Multer Integration**: Multi-file upload support
- **File System Storage**: Organized by asset type
- **Metadata Management**: Asset cataloging and retrieval

### Logging Aggregation

- **Centralized Logging**: Receives logs from builder and render services
- **Daily Rotation**: Automatic log file rotation
- **Structured Logging**: JSON format with timestamps and metadata

## Architecture

### Application Structure

```
source.dynode/
├── app.ts                  # Application entry point
├── config.ts               # Environment-based configuration
├── routes/
│   ├── auth.ts             # Authentication endpoints
│   ├── login.ts            # Password login
│   ├── data.ts             # CRUD operations
│   ├── files.ts            # Asset and log endpoints
│   └── docs.ts             # Swagger documentation
├── models/
│   ├── collections/        # MongoDB collections
│   └── views/              # Materialized views
├── services/
│   ├── logger.ts           # Winston logger
│   ├── register.ts         # Multer storage
│   └── scrapper.ts         # Resource extraction
└── middleware/
    └── auth.ts             # JWT authentication
```

### Dual MongoDB Architecture

**Content Database** (`dyna_content`):

- Primary data store for all business entities
- Collections: users_collection, assets_collection, components_collection, elements_collection
- Creative collections: creatives_assemblies, creatives_dynamics, creatives_interactives
- Materialized views for optimized reads

**Cache Database** (`dyna_sources`):

- Temporary buffer storage
- Collection: BufferCollection
- Used for transient data

### Configuration System

Environment-based configuration supports:

- `development` - Local development (HTTP, localhost)
- `production` - Production deployment (HTTPS, strict security)
- `staging` - Staging environment
- `test` - Automated testing
- `docker` - Docker Compose (internal networking)

## API Endpoints

### Authentication

**POST /auth/check-email**

- Initiate email verification
- Generates 6-digit code (10-minute expiration)
- Returns: `{success: boolean, message: string}`

**POST /auth/verify-code**

- Verify 6-digit code
- Returns JWT token on success
- Body: `{email: string, code: string}`
- Response: `{success: boolean, token: string}`

**GET /auth/me**

- Get current user profile
- Requires: JWT token in Authorization header
- Returns: User object with domains

**POST /login**

- Password-based authentication
- Body: `{username: string, password: string}`
- Returns: `{token: string}`

### Creatives

**GET /data/creatives**

- List all creatives
- Query params: `?type=dynamics&limit=50`

**GET /data/creatives/:id**

- Get creative by ID
- Query params: `?children=true` (include nested elements)

**PUT /data/creatives/:type/:id**

- Update creative
- Types: `assemblies`, `dynamics`, `interactives`
- Automatically triggers resource scraping

**DELETE /data/creatives/:type/:id**

- Delete creative

### Assets

**POST /files/assets**

- Upload assets (multipart/form-data)
- Supports multiple files
- Returns: Array of uploaded file metadata

**GET /files/assets/:filename**

- Download asset file
- Supports images, videos, fonts

### Logging

**POST /files/logs**

- Forward logs from other services
- Body: `{level: string, message: string, meta: object}`

### Documentation

**GET /docs**

- Swagger UI interface
- Interactive API documentation

## Setup & Installation

### Prerequisites

- Node.js 18 or higher
- MongoDB 5.0 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.dev .env

# Configure MongoDB connection
# Edit .env and set MONGO_URI
```

### Environment Variables

```env
# Application
NODE_ENV=development
APP_ENV=development
PORT_ENV=3333

# MongoDB
MONGO_URI=mongodb://localhost:27017/dyna_content
CACHE_MONGO_URI=mongodb://localhost:27017/dyna_sources

# JWT
JWT_SECRET=your_super_secret_key

# HTTPS (production)
HTTPS_ENABLED=false
PFX_PASSWORD=
```

### Running Locally

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

### Access Points

- **API**: http://localhost:3333
- **Swagger Docs**: http://localhost:3333/docs

## Development

### TypeScript Compilation

```bash
# Compile TypeScript
npm run build

# Watch mode
npm run dev
```

### Database Management

```bash
# Reset database (development only)
npm run db:reset
```

### Testing

```bash
# Run tests
npm test
```

## Docker Deployment

### Build Image

```bash
docker build -t source-dynode:latest .
```

### Run Container

```bash
docker run -d \
  -p 3333:443 \
  -e APP_ENV=docker \
  -e MONGO_URI=mongodb://mongo:27017/dyna_content \
  source-dynode:latest
```

### Docker Compose

```yaml
services:
  source:
    build: .
    ports:
      - "3333:443"
    environment:
      - APP_ENV=docker
      - MONGO_URI=mongodb://mongo:27017/dyna_content
    depends_on:
      - mongo
```

## Security Considerations

### Authentication

- JWT tokens expire after 24 hours
- Verification codes expire after 10 minutes
- Maximum 3 verification attempts
- Passwords hashed with bcrypt (salt rounds: 10)

### API Security

- CORS configured with allowed origins
- JWT middleware on protected routes
- Input validation with Ajv
- File upload size limits

### Production Checklist

- [ ] Set strong JWT_SECRET in environment
- [ ] Enable HTTPS with valid certificates
- [ ] Configure production MongoDB with authentication
- [ ] Set up proper CORS origins
- [ ] Enable rate limiting
- [ ] Configure log rotation

## Troubleshooting

### MongoDB Connection Failed

- Verify MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Ensure MongoDB is accessible on the specified port

### JWT Token Invalid

- Check JWT_SECRET is set correctly
- Verify token hasn't expired (24h default)
- Ensure Authorization header format: `Bearer <token>`

### File Upload Fails

- Check disk space
- Verify upload directory permissions
- Check file size limits in Multer config

## Contributing

See the main [Dynode README](file:///E:/Development/Web/NODE/Dynode/.docs/README.md) for contribution guidelines.

## License

[Specify license]

---

**Version**: 3.0  
**Last Updated**: February 6, 2026
