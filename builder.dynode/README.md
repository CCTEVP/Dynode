# Builder.dynode - Creative Management UI

> **React-based web interface for creative authoring and asset management**

## Overview

Builder.dynode is a modern React application that provides a comprehensive web-based interface for creating, editing, and managing dynamic advertising creatives. It features a drag-and-drop editor, asset management, and integrates with source.dynode for data persistence and echo.dynode for real-time updates.

## Technology Stack

- **Frontend**: React 19.1
- **Build Tool**: Vite 6.3
- **Language**: TypeScript 5.8
- **UI Library**: Ant Design 5.26
- **Routing**: React Router 7.6
- **State Management**: Zustand 5.0
- **Drag & Drop**: @dnd-kit 6.3/10.0, react-grid-layout 1.5
- **Flow Diagrams**: @xyflow/react 12.10
- **Logging**: Winston 3.17

## Key Features

### Creative Editor

- **Drag-and-Drop Interface**: Intuitive visual composition
- **Grid Layout**: Responsive grid-based positioning
- **Element Library**: Pre-built components and widgets
- **Real-time Preview**: Live creative preview
- **Version Control**: Creative history and rollback

### Asset Management

- **Multi-file Upload**: Drag-and-drop file upload
- **Asset Library**: Centralized asset repository
- **Metadata Management**: Asset cataloging and search
- **Preview Support**: Image, video, and font preview

### Authentication

- **Email Verification**: 6-digit code authentication
- **JWT Tokens**: Secure token-based sessions
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Domain Access**: Multi-domain user support

### User Experience

- **Lazy Loading**: Route-based code splitting
- **Theme Support**: Light and dark modes
- **Responsive Design**: Mobile-friendly layouts
- **Ant Design Components**: Consistent, polished UI

## Architecture

### Project Structure

```
builder.dynode/
├── src/
│   ├── App.tsx                 # Application root
│   ├── main.tsx                # Entry point
│   ├── pages/
│   │   ├── Home/               # Dashboard
│   │   ├── Creatives/          # Creative management
│   │   │   ├── Default.tsx     # List view
│   │   │   └── Edit.tsx        # Editor (FullLayout)
│   │   ├── Sources/            # Data sources
│   │   ├── Assets/             # Asset management
│   │   ├── Templates/          # Template library
│   │   ├── Community/          # Community features
│   │   └── Help/               # Documentation
│   ├── components/
│   │   ├── controls/           # Reusable controls
│   │   └── ...                 # Other components
│   ├── services/
│   │   ├── auth.ts             # Authentication API
│   │   ├── creative.ts         # Creative CRUD
│   │   ├── asset.ts            # Asset management
│   │   ├── source.ts           # Data sources
│   │   └── logger.ts           # Client logging
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Auth state
│   │   └── ThemeContext.tsx    # Theme state
│   ├── layouts/
│   │   ├── MainLayout.tsx      # Standard layout
│   │   └── FullLayout.tsx      # Immersive layout
│   └── theme.ts                # Ant Design theme
├── vite.config.ts              # Vite configuration
└── package.json
```

### Routing Strategy

**MainLayout Routes** (with sidebar):

- `/` - Home dashboard
- `/creatives` - Creative list
- `/sources` - Data sources
- `/assets` - Asset library
- `/templates` - Templates
- `/community` - Community
- `/help/*` - Documentation

**FullLayout Routes** (immersive):

- `/creatives/edit/:id` - Creative editor
- `/sources/:id` - Source editor
- `/assets/:id` - Asset editor

### Service Layer

**Service Pattern:**

```typescript
// services/creative.ts
export const creativeService = {
  async getAll(): Promise<Creative[]> {
    const response = await axios.get(`${API_URL}/data/creatives`);
    return response.data;
  },

  async getById(id: string): Promise<Creative> {
    const response = await axios.get(`${API_URL}/data/creatives/${id}`);
    return response.data;
  },

  async update(id: string, data: Partial<Creative>): Promise<Creative> {
    const response = await axios.put(
      `${API_URL}/data/creatives/dynamics/${id}`,
      data,
    );
    return response.data;
  },
};
```

### State Management

**AuthContext:**

```typescript
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}
```

**ThemeContext:**

```typescript
interface ThemeContextType {
  themeMode: "light" | "dark";
  toggleTheme: () => void;
}
```

## Setup & Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Access to source.dynode API

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.dev .env

# Configure API endpoint
# Edit .env and set SOURCE_API_URL
```

### Environment Variables

```env
# API Configuration
VITE_SOURCE_API_URL=http://localhost:3333
VITE_ECHO_WS_URL=ws://localhost:7777

# Application
VITE_APP_ENV=development
```

### Running Locally

```bash
# Development mode (with HMR)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Access Points

- **Application**: http://localhost:4000
- **Vite Dev Server**: http://localhost:5173 (during development)

## Development

### Adding a New Page

1. Create page component in `src/pages/`:

```typescript
// src/pages/MyPage/Default.tsx
export default function MyPage() {
  return <div>My Page Content</div>;
}
```

2. Add lazy import in `App.tsx`:

```typescript
const MyPage = lazy(() => import("./pages/MyPage/Default"));
```

3. Add route:

```typescript
<Route path="/mypage" element={<MyPage />} />
```

### Creating a Service

```typescript
// src/services/myservice.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_SOURCE_API_URL;

export const myService = {
  async getData() {
    const response = await axios.get(`${API_URL}/data/mydata`);
    return response.data;
  },
};
```

### Using Ant Design Components

```typescript
import { Button, Card, Form, Input } from 'antd';

export default function MyComponent() {
  return (
    <Card title="My Card">
      <Form>
        <Form.Item label="Name">
          <Input />
        </Form.Item>
        <Button type="primary">Submit</Button>
      </Form>
    </Card>
  );
}
```

## Docker Deployment

### Build Image

```bash
docker build \
  --build-arg APP_ENV=production \
  --build-arg PFX_PASSWORD=YourPassword \
  -t builder-dynode:latest .
```

### Run Container

```bash
docker run -d \
  -p 4444:443 \
  -e APP_ENV=docker \
  builder-dynode:latest
```

### Docker Compose

```yaml
services:
  builder:
    build:
      context: .
      args:
        - APP_ENV=production
        - PFX_PASSWORD=${PFX_PASSWORD}
    ports:
      - "4444:443"
    environment:
      - APP_ENV=docker
    depends_on:
      - source
```

## Build Optimization

### Code Splitting

Routes are automatically code-split using React lazy loading:

```typescript
const Edit = lazy(() => import("./pages/Creatives/Edit"));
```

### Bundle Analysis

```bash
npm run build
# Check dist/stats.html for bundle visualization
```

### Performance Tips

- Use `React.memo` for expensive components
- Implement virtualization for long lists
- Lazy load heavy dependencies
- Use Ant Design tree-shaking

## Security Considerations

### Authentication

- JWT tokens stored in localStorage
- Automatic token refresh
- Protected routes with redirect
- Logout clears all auth state

### API Security

- All API calls include JWT token
- CORS configured on source.dynode
- No sensitive data in localStorage
- HTTPS in production

### Production Checklist

- [ ] Configure production API URLs
- [ ] Enable HTTPS
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure CSP headers
- [ ] Enable source maps for debugging
- [ ] Set up monitoring and analytics

## Troubleshooting

### API Connection Failed

- Verify source.dynode is running
- Check `VITE_SOURCE_API_URL` in `.env`
- Verify CORS configuration on source.dynode
- Check browser console for errors

### Authentication Issues

- Clear localStorage and try again
- Verify JWT token is valid
- Check token expiration (24h default)
- Ensure source.dynode `/auth` endpoints are accessible

### Build Errors

- Delete `node_modules` and reinstall: `npm ci`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all dependencies are installed

### Hot Module Replacement Not Working

- Restart dev server
- Check Vite configuration
- Verify file watchers aren't exhausted (Linux)

## Contributing

See the main [Dynode README](file:///E:/Development/Web/NODE/Dynode/.docs/README.md) for contribution guidelines.

## License

[Specify license]

---

**Version**: 3.0  
**Last Updated**: February 6, 2026
