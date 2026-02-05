# Centralized Theme System

## Overview

All theme configuration is now centralized in [`index.ts`](index.ts). This file manages:

- **Ant Design themes** (via ConfigProvider)
- **ReactFlow themes** (via CSS variables)
- **CSS variable themes** (colors.css)
- **Theme switching logic**
- **System preference detection**
- **LocalStorage persistence**

## Quick Start

### Using the Theme System

The theme system is **already configured** in [`App.tsx`](../App.tsx). It automatically:

- Detects system theme preference (light/dark)
- Loads saved theme from localStorage
- Applies all themes on app initialization
- Synchronizes Ant Design, ReactFlow, and CSS variables

### Switching Themes Programmatically

A global theme switcher is exposed on the window object:

```javascript
// From browser console or anywhere in your app
window.__setTheme("dark"); // Switch to dark theme
window.__setTheme("light"); // Switch to light theme
```

### Creating a Theme Toggle Button

```tsx
import { useState } from "react";
import { Switch } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";

function ThemeToggle() {
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme-mode") === "dark",
  );

  const handleToggle = (checked: boolean) => {
    const mode = checked ? "dark" : "light";
    setIsDark(checked);
    (window as any).__setTheme(mode);
  };

  return (
    <Switch
      checked={isDark}
      onChange={handleToggle}
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
    />
  );
}
```

## Architecture

### Single Source of Truth

```
src/theme/index.ts (MAIN FILE)
├── Theme Type Definitions
├── Ant Design Configurations (light/dark)
├── ReactFlow Configurations (light/dark)
├── Theme Management Functions
└── Exports
```

### What's Included

#### Ant Design Theme (ConfigProvider)

- Complete token configuration (colors, spacing, typography, motion)
- Component-specific overrides (Button, Table, Menu, Input, etc.)
- Light and dark mode variants

#### ReactFlow Theme (CSS Variables)

- Node styling (borders, backgrounds, shadows)
- Edge styling (colors, widths)
- Control button styling
- Minimap styling
- Selection styling

#### CSS Variables (colors.css)

- Material Design color palette
- Semantic colors (primary, success, warning, error)
- Surface and background colors
- Text hierarchy colors
- Interactive state colors

### Functions Available

```typescript
// Get Ant Design theme configuration
getAntdTheme(mode: 'light' | 'dark'): ThemeConfig

// Apply all themes (ReactFlow + CSS variables)
applyTheme(mode: 'light' | 'dark'): void

// Get initial theme from localStorage or system
getInitialThemeMode(): 'light' | 'dark'

// Save theme mode to localStorage
saveThemeMode(mode: 'light' | 'dark'): void

// Initialize entire theme system
initializeTheme(mode: 'light' | 'dark'): void

// Listen to system theme changes
setupThemeListener(callback: (mode) => void): () => void
```

## Current Implementation

### App.tsx

```tsx
import { ConfigProvider } from "antd";
import {
  getAntdTheme,
  initializeTheme,
  applyTheme,
  getInitialThemeMode,
} from "./theme";

function App() {
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme(themeMode);
  }, []);

  // Apply theme when mode changes
  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  // Expose theme switcher globally
  useEffect(() => {
    window.__setTheme = setThemeMode;
  }, []);

  return (
    <ConfigProvider theme={getAntdTheme(themeMode)}>
      <AntApp>{/* Your app */}</AntApp>
    </ConfigProvider>
  );
}
```

## Benefits

### ✅ Single Configuration Point

- All theme settings in one file
- Easy to find and modify
- No duplicate definitions

### ✅ Automatic Synchronization

- Ant Design, ReactFlow, and CSS variables stay in sync
- One function call updates everything
- Consistent theming across the entire app

### ✅ Type Safety

- Full TypeScript support
- IntelliSense for all theme properties
- Compile-time error checking

### ✅ System Integration

- Respects user's OS theme preference
- Persists theme choice in localStorage
- Can listen to system theme changes

### ✅ Easy to Extend

- Add new color tokens in one place
- Create additional theme variants (e.g., high contrast)
- Component overrides clearly organized

## Adding New Colors

To add a new color to the system:

1. **Add to CSS variables** in `colors.css`:

```css
:root {
  --color-custom: #your-color;
}
```

2. **Add to Ant Design token** in `index.ts`:

```typescript
const lightTheme = {
  token: {
    colorCustom: "#your-color",
    // ...
  },
};
```

3. **Use throughout the app**:

```tsx
// CSS
.my-element {
  color: var(--color-custom);
}

// Ant Design components automatically use theme
<Button type="primary">Themed Button</Button>
```

## Testing Themes

### Quick Test (Browser Console)

```javascript
// Test dark theme
window.__setTheme("dark");

// Test light theme
window.__setTheme("light");
```

### Visual Verification Checklist

- [ ] Buttons show correct colors
- [ ] Forms and inputs are themed
- [ ] Tables have themed headers and rows
- [ ] Menu items show selection color
- [ ] ReactFlow diagrams use theme colors
- [ ] Text hierarchy is visible
- [ ] Borders and shadows are appropriate
- [ ] Toast notifications are themed
- [ ] Modal dialogs are themed

## Migration from Old Files

The following files are **deprecated** but kept for reference:

- `antd.config.ts` - Now integrated into `index.ts`
- `reactflow.config.ts` - Now integrated into `index.ts`

All imports should now use:

```typescript
import { getAntdTheme, applyTheme } from "./theme";
// NOT from './theme/antd.config' or './theme/reactflow.config'
```

## Troubleshooting

### Theme Not Applying

1. Check browser console for errors
2. Verify `<ConfigProvider>` wraps your app in App.tsx
3. Ensure `colors.css` is imported in `index.css`
4. Clear localStorage: `localStorage.clear()`

### Colors Look Wrong

1. Check that all three theme systems are initialized
2. Verify data-theme attribute on `<html>` element
3. Inspect CSS variables in DevTools
4. Check that components use theme tokens, not hardcoded colors

### Theme Not Persisting

1. Check localStorage in DevTools
2. Verify `saveThemeMode()` is being called
3. Check that `getInitialThemeMode()` runs on app load

## Future Enhancements

Potential additions to the theme system:

- [ ] Additional theme variants (high contrast, colorblind-friendly)
- [ ] Custom brand color themes
- [ ] Theme animation transitions
- [ ] Theme preview panel
- [ ] Per-user theme settings (saved to backend)
- [ ] Theme export/import functionality
