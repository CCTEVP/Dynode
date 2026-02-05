import React from "react";
import type { GridLayout as GridLayoutType } from "./types";
import { BaseLayout } from "./BaseLayout";

interface GridLayoutProps {
  layout: GridLayoutType;
  children?: React.ReactNode;
}

export const GridLayout: React.FC<GridLayoutProps> = ({ layout, children }) => {
  // Generate grid-specific styles as strings
  const gridTemplateColumns =
    typeof layout.columns === "number"
      ? `repeat(${layout.columns}, 1fr)`
      : layout.columns;

  const gridTemplateRows =
    typeof layout.rows === "number"
      ? `repeat(${layout.rows}, 1fr)`
      : layout.rows;

  // Merge with existing styles (all as strings for LayoutStyles compatibility)
  const mergedStyles = {
    ...layout.styles,
    display: "grid",
    gridTemplateColumns,
    gridTemplateRows,
    ...(layout.gap && { gap: layout.gap }),
  };

  return (
    <BaseLayout layout={{ ...layout, styles: mergedStyles }}>
      {children}
    </BaseLayout>
  );
};

export default GridLayout;
