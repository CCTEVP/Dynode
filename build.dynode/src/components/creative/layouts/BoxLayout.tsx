import React from "react";
import type { BoxLayout as BoxLayoutType } from "./types";
import { BaseLayout } from "./BaseLayout";

interface BoxLayoutProps {
  layout: BoxLayoutType;
  children?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const BoxLayout: React.FC<BoxLayoutProps> = ({
  layout,
  children,
  additionalProps = {},
}) => {
  return (
    <BaseLayout
      layout={layout}
      additionalProps={
        {
          // forward a data-value if present on layout.styles or other metadata
          ...((layout as any).value
            ? { "data-value": (layout as any).value }
            : {}),
          ...additionalProps,
        } as React.HTMLAttributes<HTMLDivElement>
      }
    >
      {children}
    </BaseLayout>
  );
};

export default BoxLayout;
