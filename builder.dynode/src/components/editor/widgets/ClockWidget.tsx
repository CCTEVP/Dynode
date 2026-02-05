import React, { useEffect, useMemo, useState } from "react";
import type { ClockWidget as ClockWidgetType } from "./types";
import { BaseWidget } from "./BaseWidget";

interface ClockWidgetProps {
  widget: ClockWidgetType;
  children?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
}

function computeTimeParts(timeZone?: string) {
  if (!timeZone) return null;

  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hours = parseInt(
      parts.find((p) => p.type === "hour")?.value || "0",
      10
    );
    const minutes = parseInt(
      parts.find((p) => p.type === "minute")?.value || "0",
      10
    );
    const seconds = parseInt(
      parts.find((p) => p.type === "second")?.value || "0",
      10
    );

    return { hours, minutes, seconds };
  } catch (error) {
    console.error("Invalid timezone:", timeZone, error);
    return null;
  }
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({
  widget,
  children,
  additionalProps = {},
}) => {
  const timeZone = widget.timeZone;
  const [nowTick, setNowTick] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = useMemo(() => computeTimeParts(timeZone), [timeZone, nowTick]);

  // Clone children and forward data-value where appropriate.
  const renderedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || !parts) return child;

    const cprops: any = child.props;
    const name = cprops["data-name"] || cprops.name || cprops.id;
    // If child has a box/card representing a time part, set data-value
    // We infer mapping by looking at the child's id or data-name including 'hours','minutes','seconds'
    const partName = String(name || "").toLowerCase();
    let value: number | null = null;
    if (partName.includes("hour")) value = parts.hours;
    else if (partName.includes("min")) value = parts.minutes;
    else if (partName.includes("sec")) value = parts.seconds;

    if (value === null) return child;

    const cloned = React.cloneElement(child, {
      ...(cprops || {}),
      "data-value": String(value).padStart(2, "0"),
    } as any);
    return cloned;
  });

  return (
    <BaseWidget
      widget={widget}
      additionalProps={
        {
          "data-timezone": widget.timeZone,
          ...additionalProps,
        } as any
      }
    >
      {renderedChildren}
    </BaseWidget>
  );
};

export default ClockWidget;
