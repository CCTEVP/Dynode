import React from "react";
import type { SlideLayout as SlideLayoutType } from "./types";
import { BaseLayout } from "./BaseLayout";

interface SlideLayoutProps {
  layout: SlideLayoutType;
  children?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const SlideLayout: React.FC<SlideLayoutProps> = ({
  layout,
  children,
  additionalProps = {},
}) => {
  return (
    <BaseLayout layout={layout} additionalProps={additionalProps}>
      {children}
    </BaseLayout>
  );
};

export default SlideLayout;
