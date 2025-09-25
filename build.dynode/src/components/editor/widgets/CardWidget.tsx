import React from "react";
import type { CardWidget as CardWidgetType } from "./types";
import { BaseWidget } from "./BaseWidget";

interface CardWidgetProps {
  widget: CardWidgetType;
  children?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
  creative?: any;
}

export const CardWidget: React.FC<CardWidgetProps> = ({
  widget,
  children,
  additionalProps = {},
}) => {
  return (
    <BaseWidget
      widget={widget}
      additionalProps={
        {
          "data-value": widget.value,
          "data-animation": widget.animation,
          className:
            widget.animation === "Roll" ? "card-roll-animation" : undefined,
          ...additionalProps,
        } as React.HTMLAttributes<HTMLDivElement>
      }
    >
      {/* center content like the target HTML */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {widget.animation === "Roll" ? (
          <div className="card-roll-container">
            <div className="card-roll-current">{children || widget.value}</div>
          </div>
        ) : (
          widget.value
        )}
      </div>
    </BaseWidget>
  );
};

export default CardWidget;
