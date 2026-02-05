/**
 * Ant Design Theme Configuration
 *
 * This file provides centralized theme configuration for Ant Design components.
 * Ant Design v5 supports design token customization via ConfigProvider.
 *
 * Usage: Wrap your app with ConfigProvider in App.tsx
 */

import type { ThemeConfig } from "antd";
import { theme } from "antd";

const { darkAlgorithm, defaultAlgorithm } = theme;

/**
 * Light Theme Configuration
 * Based on Material Design color palette defined in colors.css
 */
export const lightTheme: ThemeConfig = {
  algorithm: defaultAlgorithm,
  token: {
    // ===== Seed Token (Primary Colors) =====
    colorPrimary: "#1890ff", // Ant Design default - can switch to #6200ee for Material Design
    colorSuccess: "#52c41a",
    colorWarning: "#faad14",
    colorError: "#ff4d4f",
    colorInfo: "#1890ff",
    colorLink: "#1890ff",

    // ===== Background Colors =====
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBgLayout: "#f5f5f5",
    colorBgSpotlight: "#ffffff",

    // ===== Text Colors =====
    colorText: "rgba(0, 0, 0, 0.88)",
    colorTextSecondary: "rgba(0, 0, 0, 0.65)",
    colorTextTertiary: "rgba(0, 0, 0, 0.45)",
    colorTextQuaternary: "rgba(0, 0, 0, 0.25)",

    // ===== Border Colors =====
    colorBorder: "#d9d9d9",
    colorBorderSecondary: "#f0f0f0",

    // ===== Fill Colors (for backgrounds and overlays) =====
    colorFill: "rgba(0, 0, 0, 0.15)",
    colorFillSecondary: "rgba(0, 0, 0, 0.06)",
    colorFillTertiary: "rgba(0, 0, 0, 0.04)",
    colorFillQuaternary: "rgba(0, 0, 0, 0.02)",

    // ===== Typography =====
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    lineHeight: 1.5715,

    // ===== Border Radius =====
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,

    // ===== Control Heights =====
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,

    // ===== Spacing =====
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

    // ===== Motion =====
    motionUnit: 0.1,
    motionBase: 0,
    motionEaseInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    motionEaseOut: "cubic-bezier(0.0, 0, 0.2, 1)",

    // ===== Z-Index =====
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },

  // ===== Component-Specific Overrides =====
  components: {
    Button: {
      primaryColor: "#fff",
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
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
    Card: {
      borderRadiusLG: 8,
      paddingLG: 24,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#e6f7ff",
      itemSelectedColor: "#1890ff",
      itemHoverBg: "#f5f5f5",
    },
    Dropdown: {
      controlItemBgHover: "#f5f5f5",
      controlItemBgActive: "#e6f7ff",
      colorText: "rgba(0, 0, 0, 0.88)",
      colorTextDisabled: "rgba(0, 0, 0, 0.25)",
    },
    Message: {
      contentBg: "#ffffff",
    },
    Modal: {
      borderRadiusLG: 8,
    },
    Tabs: {
      itemActiveColor: "#1890ff",
      itemSelectedColor: "#1890ff",
    },
  },
};

/**
 * Dark Theme Configuration
 * Based on Material Design dark mode palette
 */
export const darkTheme: ThemeConfig = {
  algorithm: darkAlgorithm,
  token: {
    // ===== Seed Token (Primary Colors) =====
    colorPrimary: "#177ddc", // Darker blue for better contrast in dark mode
    colorSuccess: "#49aa19",
    colorWarning: "#d89614",
    colorError: "#d32029",
    colorInfo: "#177ddc",
    colorLink: "#177ddc",

    // ===== Background Colors =====
    colorBgBase: "#141414",
    colorBgContainer: "#1f1f1f",
    colorBgElevated: "#262626",
    colorBgLayout: "#000000",
    colorBgSpotlight: "#424242",

    // ===== Text Colors =====
    colorText: "rgba(255, 255, 255, 0.85)",
    colorTextSecondary: "rgba(255, 255, 255, 0.65)",
    colorTextTertiary: "rgba(255, 255, 255, 0.45)",
    colorTextQuaternary: "rgba(255, 255, 255, 0.25)",

    // ===== Border Colors =====
    colorBorder: "#424242",
    colorBorderSecondary: "#303030",

    // ===== Fill Colors =====
    colorFill: "rgba(255, 255, 255, 0.18)",
    colorFillSecondary: "rgba(255, 255, 255, 0.12)",
    colorFillTertiary: "rgba(255, 255, 255, 0.08)",
    colorFillQuaternary: "rgba(255, 255, 255, 0.04)",

    // Typography remains the same
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontFamily: "system-ui, Avenir, Helvetica, Arial, sans-serif",
    lineHeight: 1.5715,

    // Other tokens remain the same as light theme
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    borderRadiusXS: 2,
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
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
  },

  components: {
    Button: {
      primaryColor: "#fff",
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
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
    Card: {
      borderRadiusLG: 8,
      paddingLG: 24,
    },
    Menu: {
      itemBg: "transparent",
      itemSelectedBg: "#111d2c",
      itemSelectedColor: "#177ddc",
      itemHoverBg: "#262626",
    },
    Dropdown: {
      controlItemBgHover: "#262626",
      controlItemBgActive: "#111d2c",
      colorText: "rgba(255, 255, 255, 0.85)",
      colorTextDisabled: "rgba(255, 255, 255, 0.25)",
    },
    Message: {
      contentBg: "#1f1f1f",
    },
    Modal: {
      borderRadiusLG: 8,
    },
    Tabs: {
      itemActiveColor: "#177ddc",
      itemSelectedColor: "#177ddc",
    },
  },
};

/**
 * Material Design Theme (Alternative)
 * Uses Material Design primary color (#6200ee)
 */
export const materialTheme: ThemeConfig = {
  ...lightTheme,
  token: {
    ...lightTheme.token,
    colorPrimary: "#6200ee",
    colorLink: "#6200ee",
    colorInfo: "#6200ee",
  },
  components: {
    ...lightTheme.components,
    Menu: {
      ...lightTheme.components?.Menu,
      itemSelectedBg: "#f3e5f5",
      itemSelectedColor: "#6200ee",
    },
    Tabs: {
      itemActiveColor: "#6200ee",
      itemSelectedColor: "#6200ee",
    },
  },
};

/**
 * Get theme based on mode
 */
export const getTheme = (mode: "light" | "dark" | "material"): ThemeConfig => {
  switch (mode) {
    case "dark":
      return darkTheme;
    case "material":
      return materialTheme;
    case "light":
    default:
      return lightTheme;
  }
};

export default lightTheme;
