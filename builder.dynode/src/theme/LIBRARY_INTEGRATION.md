# Library Theme Configuration Guide

This guide explains how to properly configure themes for all graphic/UI libraries used in builder.dynode.

## Overview

The application uses several UI and visualization libraries, each with their own theming system:

1. **Ant Design (antd)** - Main UI component library
2. **ReactFlow (@xyflow/react)** - Flow diagram visualization
3. **CSS Variables** - Custom components and overrides

## 📦 Installed Libraries

From `package.json`:

```json
{
  "antd": "^5.26.7", // UI Components
  "@xyflow/react": "^12.10.0", // Flow Diagrams
  "@dnd-kit/core": "^6.3.1", // Drag & Drop
  "react-grid-layout": "^1.5.2", // Grid Layouts
  "react": "^19.1.0", // Framework
  "react-dom": "^19.1.0"
}
```

---

## 1. Ant Design Theme Configuration

### Current Implementation

The app currently uses `App` component from Ant Design but **does NOT** use `ConfigProvider` for theme customization.

### Recommended Implementation

**Step 1: Update App.tsx**

```tsx
import { Suspense, lazy } from "react";
import { ConfigProvider } from "antd"; // Add this import
import { lightTheme } from "./theme/antd.config"; // Add this import

function App() {
  return (
    <ConfigProvider theme={lightTheme}>
      {" "}
      {/* Wrap with ConfigProvider */}
      <AntApp message={{ maxCount: 3 }}>
        <AuthProvider>{/* Rest of your app */}</AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
```

**Step 2: Dynamic Theme Switching (Optional)**

```tsx
import { useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import { getTheme } from "./theme/antd.config";

function App() {
  const [theme, setTheme] = useState<"light" | "dark" | "material">("light");

  // Detect system preference
  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(darkModeQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, []);

  return (
    <ConfigProvider theme={getTheme(theme)}>
      <AntApp message={{ maxCount: 3 }}>{/* Rest of your app */}</AntApp>
    </ConfigProvider>
  );
}
```

### Key Features of Ant Design ConfigProvider

1. **Design Tokens**: Customizes colors, spacing, typography globally
2. **Component Overrides**: Per-component style customization
3. **Algorithm**: Built-in dark/compact algorithms
4. **CSS Variables**: Generates CSS variables automatically

### Available Theme Options

See `src/theme/antd.config.ts`:

- `lightTheme` - Standard light theme with Ant Design colors
- `darkTheme` - Dark mode theme
- `materialTheme` - Material Design primary color variant
- `getTheme(mode)` - Dynamic theme getter

---

## 2. ReactFlow Theme Configuration

### Current Implementation

ReactFlow is used in `src/pages/Help/Codebase/Default.tsx` but uses default styling with custom CSS overrides.

### Recommended Implementation

**Method 1: CSS Variables (Recommended)**

Add to your component or globally:

```tsx
import { useEffect } from "react";
import { applyReactFlowTheme } from "../../../theme/reactflow.config";

function CodebaseVisualization() {
  useEffect(() => {
    // Apply theme on mount
    applyReactFlowTheme("light"); // or 'dark' or 'material'
  }, []);

  return <ReactFlow /* ... */ />;
}
```

**Method 2: Inline Styles**

```tsx
import { getReactFlowTheme } from "../../../theme/reactflow.config";

function CodebaseVisualization() {
  const flowTheme = getReactFlowTheme("light");

  return (
    <div
      style={
        {
          "--xy-node-border": flowTheme.nodeBorder,
          "--xy-edge-stroke": flowTheme.edgeStroke,
          // ... other variables
        } as React.CSSProperties
      }
    >
      <ReactFlow /* ... */ />
    </div>
  );
}
```

**Method 3: CSS File Import**

Create `src/theme/reactflow-theme.css`:

```css
@import "./colors.css";

.react-flow {
  /* Light theme by default */
  --xy-node-border-selected: var(--ant-primary-color);
  --xy-edge-stroke-selected: var(--ant-primary-color);
  --xy-handle-background: var(--ant-primary-color);
}

[data-theme="dark"] .react-flow {
  /* Dark theme overrides */
  --xy-node-background: var(--color-surface);
  --xy-node-border: var(--color-border);
}
```

### Key ReactFlow Theme Variables

See `src/theme/reactflow.config.ts`:

- Node colors: `--xy-node-*`
- Edge colors: `--xy-edge-*`
- Handle colors: `--xy-handle-*`
- Control colors: `--xy-controls-*`
- Minimap colors: `--xy-minimap-*`

---

## 3. CSS Variables Integration

### Current Implementation

Created centralized color system in `src/theme/colors.css`.

### Usage in Components

**Option 1: Direct CSS Variables**

```css
.my-component {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid var(--color-border);
}
```

**Option 2: Inline Styles**

```tsx
<div
  style={{
    backgroundColor: "var(--color-primary)",
    color: "var(--color-on-primary)",
  }}
>
  Content
</div>
```

**Option 3: Bridge with Ant Design**

```css
:root {
  /* Use Ant Design colors in custom components */
  --my-custom-primary: var(--ant-primary-color);
}
```

---

## 4. Other Libraries

### @dnd-kit (Drag & Drop)

**Configuration**: Uses inline styles, no theme system.

**Recommendation**: Apply colors via CSS variables:

```css
.draggable-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.draggable-item:hover {
  background: var(--color-hover);
}
```

### react-grid-layout

**Configuration**: CSS-based styling only.

**Recommendation**: Override default styles:

```css
.react-grid-layout {
  background: var(--color-background);
}

.react-grid-item {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.react-grid-item.react-draggable-dragging {
  opacity: 0.8;
  box-shadow: 0 4px 16px var(--shadow-color-strong);
}
```

---

## 5. Recommended Implementation Order

### Phase 1: Ant Design (High Impact)

1. ✅ Create `antd.config.ts` theme files
2. ⏳ Wrap App with `ConfigProvider`
3. ⏳ Test all Ant Design components
4. ⏳ Verify dark mode support

### Phase 2: ReactFlow (Medium Impact)

1. ✅ Create `reactflow.config.ts` theme files
2. ⏳ Apply to Codebase visualization page
3. ⏳ Test node/edge styling
4. ⏳ Verify minimap and controls

### Phase 3: CSS Variables (Ongoing)

1. ✅ Created centralized `colors.css`
2. ⏳ Migrate hardcoded colors progressively
3. ⏳ Update component styles
4. ⏳ Test across all pages

### Phase 4: Other Libraries (Low Priority)

1. ⏳ Add CSS overrides for react-grid-layout
2. ⏳ Style @dnd-kit drag overlays
3. ⏳ Document custom styling patterns

---

## 6. Complete Integration Example

**src/App.tsx (Recommended)**

```tsx
import { Suspense, lazy, useState, useEffect } from "react";
import { ConfigProvider } from "antd";
import { getTheme } from "./theme/antd.config";
import { applyReactFlowTheme } from "./theme/reactflow.config";

function App() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  // Sync with system preference
  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setThemeMode(darkModeQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      const mode = e.matches ? "dark" : "light";
      setThemeMode(mode);
      document.documentElement.setAttribute("data-theme", mode);
      applyReactFlowTheme(mode);
    };

    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, []);

  // Apply on mount
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    applyReactFlowTheme(themeMode);
  }, [themeMode]);

  return (
    <ConfigProvider theme={getTheme(themeMode)}>
      <AntApp message={{ maxCount: 3 }}>
        <AuthProvider>{/* Your app content */}</AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
```

---

## 7. Testing Checklist

After implementing theme configuration:

- [ ] Ant Design components render with correct colors
- [ ] ReactFlow diagrams use themed colors
- [ ] Dark mode switches correctly
- [ ] Custom CSS variables work
- [ ] No visual regressions
- [ ] Toast messages appear correctly
- [ ] Modal dialogs styled properly
- [ ] Tables have correct row hover colors
- [ ] Forms have proper focus states
- [ ] Icons use consistent colors

---

## 8. Resources

### Ant Design

- [ConfigProvider Documentation](https://ant.design/components/config-provider)
- [Theme Customization](https://ant.design/docs/react/customize-theme)
- [Design Tokens](https://ant.design/docs/react/customize-theme#seedtoken)

### ReactFlow

- [Theming Documentation](https://reactflow.dev/learn/advanced-use/theming)
- [CSS Variables Reference](https://reactflow.dev/learn/advanced-use/theming#css-variables)

### Material Design

- [Color System](https://m3.material.io/styles/color/system/overview)
- [Dark Theme](https://m3.material.io/styles/color/dynamic/user-generated)

---

## Summary

**Best Practices:**

1. Use `ConfigProvider` for Ant Design theming
2. Apply ReactFlow themes via CSS variables
3. Maintain CSS variable system for custom components
4. Sync all three systems with a single theme mode state
5. Test thoroughly in both light and dark modes
