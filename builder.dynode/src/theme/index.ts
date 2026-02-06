/**
 * Central Theme Configuration
 *
 * This is the main theme configuration file that coordinates all theming systems:
 * - CSS Variables (colors.css)
 * - Ant Design (ConfigProvider)
 * - ReactFlow (CSS variables)
 *
 * Import this file in App.tsx and use the exported functions to manage themes.
 */

import type { ThemeConfig } from "antd";

// ============================================================================
// Theme Mode Type
// ============================================================================
export type ThemeMode = "light" | "dark";

// ============================================================================
// Ant Design Theme Configuration
// ============================================================================

const baseThemeConfig = {
  token: {
    // Typography
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    lineHeight: 1.5715,

    // Border Radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // Control Heights
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Motion
    motionUnit: 0.1,
    motionBase: 0,
    motionEaseInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    motionEaseOut: "cubic-bezier(0.0, 0, 0.2, 1)",

    // Z-Index
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },

  components: {
    Button: {
      primaryColor: "#fff",
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
      colorPrimaryActive: "#096dd9",
      colorPrimaryHover: "#40a9ff",
    },
    Input: {
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
    },
    Select: {
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
      // Note: multipleItemBg and multipleItemBorderColor are set in light/dark themes
    },
    Card: {
      borderRadiusLG: 8,
      paddingLG: 24,
    },
    Modal: {
      borderRadiusLG: 8,
    },
    Form: {
      labelFontSize: 14,
      verticalLabelPadding: "0 0 8px",
    },
  },
};

export const lightTheme: ThemeConfig = {
  ...baseThemeConfig,
  token: {
    ...baseThemeConfig.token,
    // Primary Colors
    colorPrimary: "#1890ff",
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#B00020",
    colorInfo: "#1890ff",
    colorLink: "#1890ff",

    // Background Colors
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f5f5f5",
    colorBgSpotlight: "#ffffff",

    // Text Colors
    colorText: "rgba(0, 0, 0, 0.88)",
    colorTextSecondary: "rgba(0, 0, 0, 0.65)",
    colorTextTertiary: "rgba(0, 0, 0, 0.45)",
    colorTextQuaternary: "rgba(0, 0, 0, 0.25)",

    // Border Colors
    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#f0f0f0",

    // Fill Colors
    colorFill: "rgba(0, 0, 0, 0.15)",
    colorFillSecondary: "rgba(0, 0, 0, 0.06)",
    colorFillTertiary: "rgba(0, 0, 0, 0.04)",
    colorFillQuaternary: "rgba(0, 0, 0, 0.02)",

    // Asset Kind Colors (consistent across light/dark modes)
    // @ts-ignore - Custom token extensions
    colorAssetImage: "#52C41A",
    // @ts-ignore - Custom token extensions
    colorAssetVideo: "#F5222D",
    // @ts-ignore - Custom token extensions
    colorAssetFont: "#FA8C16",
    // @ts-ignore - Custom token extensions
    colorAssetOther: "#8C8C8C",
  },
  components: {
    ...baseThemeConfig.components,
    Select: {
      ...baseThemeConfig.components.Select,
      colorBgContainer: "#ffffff",
      colorText: "rgba(0, 0, 0, 0.88)",
      optionSelectedBg: "#e6f7ff",
      optionSelectedColor: "#1890ff",
      optionActiveBg: "#f5f5f5",
      multipleItemBg: "#f0f0f0",
      multipleItemBorderColor: "#d9d9d9",
    },
    Table: {
      headerBg: "#fafafa",
      headerColor: "rgba(0, 0, 0, 0.88)",
      rowHoverBg: "#f5f5f5",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#e6f7ff",
      itemSelectedColor: "#1890ff",
    },
    Message: {
      contentBg: "#ffffff",
    },
    Tabs: {
      itemActiveColor: "#1890ff",
      itemSelectedColor: "#1890ff",
    },
    Tooltip: {
      colorBgSpotlight: "rgba(0, 0, 0, 0.85)",
      colorTextLightSolid: "#ffffff",
    },
  },
};

export const darkTheme: ThemeConfig = {
  ...baseThemeConfig,
  token: {
    ...baseThemeConfig.token,
    // Primary Colors
    colorPrimary: "#177ddc",
    colorSuccess: "#49aa19",
    colorWarning: "#d89614",
    colorError: "#CF6679",
    colorInfo: "#177ddc",
    colorLink: "#177ddc",

    // Background Colors
    colorBgBase: "#141414",
    colorBgContainer: "#1f1f1f",
    colorBgElevated: "#262626",
    colorBgLayout: "#000000",
    colorBgSpotlight: "#424242",

    // Text Colors
    colorText: "rgba(255, 255, 255, 0.85)",
    colorTextSecondary: "rgba(255, 255, 255, 0.65)",
    colorTextTertiary: "rgba(255, 255, 255, 0.45)",
    colorTextQuaternary: "rgba(255, 255, 255, 0.25)",

    // Border Colors
    colorBorder: "#424242",
    colorBorderSecondary: "#303030",

    // Fill Colors
    colorFill: "rgba(255, 255, 255, 0.18)",

    // Asset Kind Colors (consistent across light/dark modes)
    // @ts-ignore - Custom token extensions
    colorAssetImage: "#52C41A",
    // @ts-ignore - Custom token extensions
    colorAssetVideo: "#F5222D",
    // @ts-ignore - Custom token extensions
    colorAssetFont: "#FA8C16",
    // @ts-ignore - Custom token extensions
    colorAssetOther: "#8C8C8C",
    colorFillSecondary: "rgba(255, 255, 255, 0.12)",
    colorFillTertiary: "rgba(255, 255, 255, 0.08)",
    colorFillQuaternary: "rgba(255, 255, 255, 0.04)",
  },
  components: {
    ...baseThemeConfig.components,
    Select: {
      ...baseThemeConfig.components.Select,
      colorBgContainer: "#1f1f1f",
      colorText: "rgba(255, 255, 255, 0.85)",
      optionSelectedBg: "#111d2c",
      optionSelectedColor: "#177ddc",
      optionActiveBg: "#262626",
      multipleItemBg: "#262626",
      multipleItemBorderColor: "#434343",
    },
    Table: {
      headerBg: "#1f1f1f",
      headerColor: "rgba(255, 255, 255, 0.85)",
      rowHoverBg: "#262626",
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#111d2c",
      itemSelectedColor: "#177ddc",
    },
    Message: {
      contentBg: "#1f1f1f",
    },
    Tabs: {
      itemActiveColor: "#177ddc",
      itemSelectedColor: "#177ddc",
    },
    Tooltip: {
      colorBgSpotlight: "rgba(0, 0, 0, 0.85)",
      colorTextLightSolid: "#ffffff",
    },
  },
};

// ============================================================================
// ReactFlow Theme Configuration
// ============================================================================

const reactFlowThemes = {
  light: {
    "--xy-node-color": "rgba(0, 0, 0, 0.88)",
    "--xy-node-background": "#ffffff",
    "--xy-node-border": "#d9d9d9",
    "--xy-node-boxshadow": "0 2px 8px rgba(0, 0, 0, 0.1)",
    "--xy-node-border-selected": "#1890ff",
    "--xy-node-boxshadow-selected": "0 0 0 2px rgba(24, 144, 255, 0.2)",
    "--xy-node-border-hover": "#40a9ff",
    "--xy-edge-stroke": "#b1b1b7",
    "--xy-edge-stroke-width": "1",
    "--xy-edge-stroke-selected": "#1890ff",
    "--xy-edge-stroke-width-selected": "2",
    "--xy-handle-background": "#1890ff",
    "--xy-handle-border": "#ffffff",
    "--xy-controls-button-background": "#ffffff",
    "--xy-controls-button-background-hover": "#f5f5f5",
    "--xy-controls-button-color": "rgba(0, 0, 0, 0.88)",
    "--xy-controls-button-border-color": "#d9d9d9",
    "--xy-minimap-background": "#f5f5f5",
    "--xy-minimap-mask": "rgba(0, 0, 0, 0.1)",
    "--xy-minimap-node": "#e0e0e0",
    "--xy-background-pattern-color": "#e0e0e0",
    "--xy-selection-background": "rgba(24, 144, 255, 0.08)",
    "--xy-selection-border": "#1890ff",
  },
  dark: {
    "--xy-node-color": "rgba(255, 255, 255, 0.85)",
    "--xy-node-background": "#1f1f1f",
    "--xy-node-border": "#424242",
    "--xy-node-boxshadow": "0 2px 8px rgba(0, 0, 0, 0.4)",
    "--xy-node-border-selected": "#177ddc",
    "--xy-node-boxshadow-selected": "0 0 0 2px rgba(23, 125, 220, 0.2)",
    "--xy-node-border-hover": "#3c9ae8",
    "--xy-edge-stroke": "#555555",
    "--xy-edge-stroke-width": "1",
    "--xy-edge-stroke-selected": "#177ddc",
    "--xy-edge-stroke-width-selected": "2",
    "--xy-handle-background": "#177ddc",
    "--xy-handle-border": "#1f1f1f",
    "--xy-controls-button-background": "#262626",
    "--xy-controls-button-background-hover": "#303030",
    "--xy-controls-button-color": "rgba(255, 255, 255, 0.85)",
    "--xy-controls-button-border-color": "#424242",
    "--xy-minimap-background": "#141414",
    "--xy-minimap-mask": "rgba(255, 255, 255, 0.1)",
    "--xy-minimap-node": "#424242",
    "--xy-background-pattern-color": "#2a2a2a",
    "--xy-selection-background": "rgba(23, 125, 220, 0.1)",
    "--xy-selection-border": "#177ddc",
  },
};

// ============================================================================
// Theme Management Functions
// ============================================================================

/**
 * Get Ant Design theme configuration for the specified mode
 */
export const getAntdTheme = (mode: ThemeMode): ThemeConfig => {
  return mode === "dark" ? darkTheme : lightTheme;
};

/**
 * Apply ReactFlow theme by setting CSS variables on document root
 */
const applyReactFlowTheme = (mode: ThemeMode): void => {
  const root = document.documentElement;
  const theme = reactFlowThemes[mode];

  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

/**
 * Apply CSS data-theme attribute for colors.css
 */
const applyCSSTheme = (mode: ThemeMode): void => {
  document.documentElement.setAttribute("data-theme", mode);
};

/**
 * Apply all theme configurations (Ant Design, ReactFlow, CSS Variables)
 * This is the main function to call when switching themes
 */
export const applyTheme = (mode: ThemeMode): void => {
  applyCSSTheme(mode);
  applyReactFlowTheme(mode);
  // Note: Ant Design theme is applied via ConfigProvider in App.tsx
};

/**
 * Get current theme mode from system preference or localStorage
 * Defaults to light theme
 */
export const getInitialThemeMode = (): ThemeMode => {
  // Check localStorage first
  const stored = localStorage.getItem("theme-mode");
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  // Default to light theme (not system preference)
  return "light";
};

/**
 * Save theme mode to localStorage
 */
export const saveThemeMode = (mode: ThemeMode): void => {
  localStorage.setItem("theme-mode", mode);
};

/**
 * Initialize theme system
 * Call this once when the app loads
 */
export const initializeTheme = (mode: ThemeMode): void => {
  applyTheme(mode);
  saveThemeMode(mode);
};

/**
 * Setup system theme preference listener
 * Returns cleanup function
 */
export const setupThemeListener = (
  callback: (mode: ThemeMode) => void,
): (() => void) => {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    const mode: ThemeMode = e.matches ? "dark" : "light";
    callback(mode);
  };

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
};

// ============================================================================
// Exports
// ============================================================================

export default {
  getAntdTheme,
  applyTheme,
  getInitialThemeMode,
  saveThemeMode,
  initializeTheme,
  setupThemeListener,
};
