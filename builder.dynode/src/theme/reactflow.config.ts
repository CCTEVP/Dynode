/**
 * ReactFlow Theme Configuration
 *
 * This file provides centralized theme configuration for ReactFlow (@xyflow/react).
 * ReactFlow uses CSS variables for theming which can be customized.
 *
 * Apply these styles globally or to specific ReactFlow containers.
 */

/**
 * Light Theme CSS Variables for ReactFlow
 */
export const reactFlowLightTheme = `
  /* ===== Node Styles ===== */
  --xy-node-color: rgba(0, 0, 0, 0.88);
  --xy-node-background: #ffffff;
  --xy-node-border: #d9d9d9;
  --xy-node-boxshadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* ===== Node Selected State ===== */
  --xy-node-border-selected: #1890ff;
  --xy-node-boxshadow-selected: 0 0 0 2px rgba(24, 144, 255, 0.2);
  
  /* ===== Node Hover State ===== */
  --xy-node-border-hover: #40a9ff;
  
  /* ===== Edge Styles ===== */
  --xy-edge-stroke: #b1b1b7;
  --xy-edge-stroke-width: 1;
  --xy-edge-stroke-selected: #1890ff;
  --xy-edge-stroke-width-selected: 2;
  
  /* ===== Handle Styles ===== */
  --xy-handle-background: #1890ff;
  --xy-handle-border: #ffffff;
  
  /* ===== Controls (Zoom, etc.) ===== */
  --xy-controls-button-background: #ffffff;
  --xy-controls-button-background-hover: #f5f5f5;
  --xy-controls-button-color: rgba(0, 0, 0, 0.88);
  --xy-controls-button-border-color: #d9d9d9;
  
  /* ===== Minimap ===== */
  --xy-minimap-background: #f5f5f5;
  --xy-minimap-mask: rgba(0, 0, 0, 0.1);
  --xy-minimap-node: #e0e0e0;
  
  /* ===== Background ===== */
  --xy-background-pattern-color: #e0e0e0;
  
  /* ===== Selection Box ===== */
  --xy-selection-background: rgba(24, 144, 255, 0.08);
  --xy-selection-border: #1890ff;
`;

/**
 * Dark Theme CSS Variables for ReactFlow
 */
export const reactFlowDarkTheme = `
  /* ===== Node Styles ===== */
  --xy-node-color: rgba(255, 255, 255, 0.85);
  --xy-node-background: #1f1f1f;
  --xy-node-border: #424242;
  --xy-node-boxshadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  
  /* ===== Node Selected State ===== */
  --xy-node-border-selected: #177ddc;
  --xy-node-boxshadow-selected: 0 0 0 2px rgba(23, 125, 220, 0.2);
  
  /* ===== Node Hover State ===== */
  --xy-node-border-hover: #3c9ae8;
  
  /* ===== Edge Styles ===== */
  --xy-edge-stroke: #555555;
  --xy-edge-stroke-width: 1;
  --xy-edge-stroke-selected: #177ddc;
  --xy-edge-stroke-width-selected: 2;
  
  /* ===== Handle Styles ===== */
  --xy-handle-background: #177ddc;
  --xy-handle-border: #1f1f1f;
  
  /* ===== Controls ===== */
  --xy-controls-button-background: #262626;
  --xy-controls-button-background-hover: #303030;
  --xy-controls-button-color: rgba(255, 255, 255, 0.85);
  --xy-controls-button-border-color: #424242;
  
  /* ===== Minimap ===== */
  --xy-minimap-background: #141414;
  --xy-minimap-mask: rgba(255, 255, 255, 0.1);
  --xy-minimap-node: #424242;
  
  /* ===== Background ===== */
  --xy-background-pattern-color: #2a2a2a;
  
  /* ===== Selection Box ===== */
  --xy-selection-background: rgba(23, 125, 220, 0.1);
  --xy-selection-border: #177ddc;
`;

/**
 * Material Design Theme CSS Variables for ReactFlow
 */
export const reactFlowMaterialTheme = `
  /* ===== Node Styles ===== */
  --xy-node-color: rgba(0, 0, 0, 0.88);
  --xy-node-background: #ffffff;
  --xy-node-border: #d9d9d9;
  --xy-node-boxshadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  /* ===== Node Selected State ===== */
  --xy-node-border-selected: #6200ee;
  --xy-node-boxshadow-selected: 0 0 0 2px rgba(98, 0, 238, 0.2);
  
  /* ===== Node Hover State ===== */
  --xy-node-border-hover: #7c3aed;
  
  /* ===== Edge Styles ===== */
  --xy-edge-stroke: #b1b1b7;
  --xy-edge-stroke-width: 1;
  --xy-edge-stroke-selected: #6200ee;
  --xy-edge-stroke-width-selected: 2;
  
  /* ===== Handle Styles ===== */
  --xy-handle-background: #6200ee;
  --xy-handle-border: #ffffff;
  
  /* ===== Controls ===== */
  --xy-controls-button-background: #ffffff;
  --xy-controls-button-background-hover: #f5f5f5;
  --xy-controls-button-color: rgba(0, 0, 0, 0.88);
  --xy-controls-button-border-color: #d9d9d9;
  
  /* ===== Minimap ===== */
  --xy-minimap-background: #f5f5f5;
  --xy-minimap-mask: rgba(0, 0, 0, 0.1);
  --xy-minimap-node: #e0e0e0;
  
  /* ===== Background ===== */
  --xy-background-pattern-color: #e0e0e0;
  
  /* ===== Selection Box ===== */
  --xy-selection-background: rgba(98, 0, 238, 0.08);
  --xy-selection-border: #6200ee;
`;

/**
 * Apply ReactFlow theme by injecting CSS variables
 */
export const applyReactFlowTheme = (
  theme: "light" | "dark" | "material" = "light",
): void => {
  const root = document.documentElement;
  const themeVariables =
    theme === "dark"
      ? reactFlowDarkTheme
      : theme === "material"
        ? reactFlowMaterialTheme
        : reactFlowLightTheme;

  // Parse and apply CSS variables
  const lines = themeVariables.split("\n").filter((line) => line.includes(":"));
  lines.forEach((line) => {
    const [property, value] = line.split(":").map((s) => s.trim());
    if (property && value) {
      root.style.setProperty(property, value.replace(";", ""));
    }
  });
};

/**
 * Get ReactFlow theme object for programmatic use
 */
export const getReactFlowTheme = (
  theme: "light" | "dark" | "material" = "light",
) => {
  const isDark = theme === "dark";
  const isMaterial = theme === "material";
  const primaryColor = isMaterial ? "#6200ee" : isDark ? "#177ddc" : "#1890ff";

  return {
    nodeColor: isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.88)",
    nodeBackground: isDark ? "#1f1f1f" : "#ffffff",
    nodeBorder: isDark ? "#424242" : "#d9d9d9",
    nodeBoxShadow: isDark
      ? "0 2px 8px rgba(0, 0, 0, 0.4)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)",
    nodeBorderSelected: primaryColor,
    edgeStroke: isDark ? "#555555" : "#b1b1b7",
    edgeStrokeSelected: primaryColor,
    handleBackground: primaryColor,
    controlsBackground: isDark ? "#262626" : "#ffffff",
    minimapBackground: isDark ? "#141414" : "#f5f5f5",
    backgroundPattern: isDark ? "#2a2a2a" : "#e0e0e0",
  };
};

export default {
  light: reactFlowLightTheme,
  dark: reactFlowDarkTheme,
  material: reactFlowMaterialTheme,
  apply: applyReactFlowTheme,
  get: getReactFlowTheme,
};
