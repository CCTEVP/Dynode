import React from "react";
import type { Layout } from "./types";
import normalizeStyleObject from "../utils/styleUtils";

interface BaseLayoutProps {
  layout: Layout;
  children?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({
  layout,
  children,
  additionalProps = {},
}) => {
  // Generate the ID in the expected format: {type}-{identifier}-{_id}
  // normalize type to e.g. SlideLayout -> slide-layout
  const normalizedType = layout.type
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/g, "")
    .replace(/-layout$/, "-layout");
  const rawId = (layout as any)?._id;
  const idVal =
    rawId && typeof rawId === "object" && rawId.$oid
      ? rawId.$oid
      : typeof rawId === "string"
      ? rawId
      : layout.identifier || "unknown";
  const layoutId = `${normalizedType}-${idVal}`;

  const safeStyle = normalizeStyleObject(
    layout.styles as any
  ) as React.CSSProperties;

  return (
    <div
      id={layoutId}
      data-name={layout.identifier}
      style={safeStyle}
      {...additionalProps}
    >
      {children}
    </div>
  );
};

export default BaseLayout;
