# Design System Color Variables

This document explains the centralized color system for the builder.dynode application.

## Overview

All colors are defined as CSS variables in `src/theme/colors.css` following Material Design principles with automatic light/dark mode support.

## Color Categories

### Primary Colors

Used for primary actions, active states, and key UI elements.

- `--color-primary`: Main brand color (#6200EE light, #BB86FC dark)
- `--color-primary-variant`: Darker variant (#3700B3 both modes)
- `--color-primary-light`: Lighter variant for accents

### Secondary Colors

Used for secondary actions and complementary UI elements.

- `--color-secondary`: Main secondary color (#03DAC6 both modes)
- `--color-secondary-variant`: Variant (#018786 light, #03DAC6 dark)

### Surface & Background

- `--color-background`: Page background (#FFFFFF light, #121212 dark)
- `--color-surface`: Card/panel surfaces (#FFFFFF light, #121212 dark)
- `--color-surface-variant`: Elevated surfaces (#F5F5F5 light, #1E1E1E dark)

### Semantic Colors

- `--color-error`: Error states (#B00020 light, #CF6679 dark)
- `--color-success`: Success states (#4CAF50)
- `--color-warning`: Warning states (#FF9800)
- `--color-info`: Info states (#2196F3)

### Text Colors (On Colors)

- `--color-on-primary`: Text on primary backgrounds (#FFFFFF light, #000000 dark)
- `--color-on-secondary`: Text on secondary backgrounds (#000000 both)
- `--color-on-background`: Text on background (#000000 light, #FFFFFF dark)
- `--color-on-surface`: Text on surfaces (#000000 light, #FFFFFF dark)
- `--color-on-error`: Text on error backgrounds (#FFFFFF light, #000000 dark)

### Text Hierarchy

- `--color-text-primary`: Main text (87% opacity)
- `--color-text-secondary`: Secondary text (60% opacity)
- `--color-text-disabled`: Disabled text (38% opacity)
- `--color-text-hint`: Hint text (38% opacity)

### Gray Scale

From `--color-gray-50` (lightest) to `--color-gray-900` (darkest)

### Borders & Dividers

- `--color-border`: Standard borders (12% opacity)
- `--color-border-light`: Subtle borders (8% opacity)
- `--color-divider`: Divider lines (12% opacity)

### Interactive States

- `--color-hover`: Hover state overlay (4% opacity)
- `--color-focus`: Focus state (12% opacity with primary color)
- `--color-selected`: Selected state (8% opacity with primary color)
- `--color-pressed`: Pressed state (12% opacity)
- `--color-dragged`: Dragging state (8% opacity)

### Shadows

- `--shadow-color`: Standard shadow color (10% opacity light, 40% dark)
- `--shadow-color-strong`: Strong shadow (20% opacity light, 60% dark)

## Usage Examples

### In CSS Files

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border: 1px solid var(--color-border);
}

.my-button:hover {
  background-color: var(--color-primary-variant);
}

.my-card {
  background-color: var(--color-surface);
  box-shadow: 0 2px 8px var(--shadow-color);
}

.my-text {
  color: var(--color-text-primary);
}

.my-secondary-text {
  color: var(--color-text-secondary);
}
```

### In TSX Files (Inline Styles)

```tsx
<div style={{
  backgroundColor: 'var(--color-primary)',
  color: 'var(--color-on-primary)',
  border: '1px solid var(--color-border)'
}}>
  Primary Button
</div>

<span style={{ color: 'var(--color-text-secondary)' }}>
  Secondary text
</span>
```

### With Ant Design

The system includes Ant Design compatible colors:

- `--ant-primary-color`
- `--ant-success-color`
- `--ant-warning-color`
- `--ant-error-color`
- `--ant-info-color`
- `--ant-link-color`

## Theme Switching

### Automatic (Prefers Color Scheme)

The theme automatically adapts to system preferences using `@media (prefers-color-scheme: dark)`.

### Manual Theme Control

You can manually set the theme by adding a data attribute:

```html
<html data-theme="light">
  <html data-theme="dark"></html>
</html>
```

Or in React:

```tsx
document.documentElement.setAttribute("data-theme", "dark");
```

## Migration Guide

When migrating existing code to use CSS variables:

### Before

```css
.button {
  background-color: #6200ee;
  color: #ffffff;
}
```

### After

```css
.button {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}
```

### Common Replacements

- `#1890ff` → `var(--ant-primary-color)` or `var(--color-info)`
- `#52c41a` → `var(--ant-success-color)` or `var(--color-success)`
- `#ff4d4f` → `var(--ant-error-color)` or `var(--color-error)`
- `#ffffff` → `var(--color-surface)` or `var(--color-on-primary)`
- `#000000` → `var(--color-on-surface)` or `var(--color-text-primary)`
- `#f5f5f5` → `var(--color-surface-variant)` or `var(--color-gray-100)`
- `#999`, `#666` → `var(--color-text-secondary)`

## Benefits

1. **Consistency**: All colors centralized in one location
2. **Maintainability**: Easy to update brand colors globally
3. **Dark Mode**: Automatic support with proper contrast
4. **Accessibility**: Following Material Design ensures WCAG compliance
5. **Theme Switching**: Easy to add custom themes or user preferences
6. **Type Safety**: Can be integrated with TypeScript for type-safe color usage

## Future Enhancements

- TypeScript constants file for type-safe color access
- Theme builder UI for custom color schemes
- Color contrast checker for accessibility
- Per-component color overrides
- Animation color transitions
