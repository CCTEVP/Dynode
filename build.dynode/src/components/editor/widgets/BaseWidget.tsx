import React from "react";
import type { Widget } from "./types";
import normalizeStyleObject from "../utils/styleUtils";

interface BaseWidgetProps {
  widget: Widget;
  children?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  widget,
  children,
  additionalProps = {},
}) => {
  // Normalize type to e.g. CardWidget -> card-widget
  const normalizedType = widget.type
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/g, "");

  // robust id extraction: support {_id: { $oid }} or string id
  const rawId = (widget as any)?._id;
  const idVal =
    rawId && typeof rawId === "object" && rawId.$oid
      ? rawId.$oid
      : typeof rawId === "string"
      ? rawId
      : widget.identifier || "unknown";
  const widgetId = `${normalizedType}-${idVal}`;

  const safeStyle = normalizeStyleObject(
    widget.styles as any
  ) as React.CSSProperties;

  return (
    <div
      id={widgetId}
      className={widget.classes}
      style={safeStyle}
      data-name={widget.identifier}
      {...additionalProps}
    >
      {children}
    </div>
  );
};

export default BaseWidget;
