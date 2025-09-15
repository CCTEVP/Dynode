import React from "react";
import type { TextWidget as TextWidgetType } from "./types";
import { BaseWidget } from "./BaseWidget";

interface TextWidgetProps {
  widget: TextWidgetType;
  // No children prop - TextWidget cannot be a parent
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
}

export const TextWidget: React.FC<TextWidgetProps> = ({
  widget,
  additionalProps = {},
}) => {
  return (
    <BaseWidget widget={widget} additionalProps={additionalProps}>
      {widget.value}
    </BaseWidget>
  );
};

export default TextWidget;
