import React, { useEffect, useMemo, useState } from "react";
import type { CountdownWidget as CountdownWidgetType } from "./types";
import { BaseWidget } from "./BaseWidget";

interface CountdownWidgetProps {
  widget: CountdownWidgetType;
  children?: React.ReactNode;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
}

function computeParts(targetIso?: string) {
  if (!targetIso) return null;
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  let diff = Math.max(0, target - now);

  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  diff -= days * 24 * 60 * 60 * 1000;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  diff -= hours * 60 * 60 * 1000;
  const minutes = Math.floor(diff / (60 * 1000));
  diff -= minutes * 60 * 1000;
  const seconds = Math.floor(diff / 1000);

  return { days, hours, minutes, seconds };
}

export const CountdownWidget: React.FC<CountdownWidgetProps> = ({
  widget,
  children,
  additionalProps = {},
}) => {
  const target = widget.targetDateTime?.default;
  const [nowTick, setNowTick] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = useMemo(() => computeParts(target), [target, nowTick]);

  // Clone children and forward data-value where appropriate.
  const renderedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child) || !parts) return child;

    const cprops: any = child.props;
    const name = cprops["data-name"] || cprops.name || cprops.id;
    // If child has a box/card representing a part, set data-value
    // We infer mapping by looking at the child's id or data-name including 'days','hours','minutes','seconds'
    const lower = String(name || "").toLowerCase();
    let value: number | null = null;
    if (lower.includes("day")) value = parts.days;
    else if (lower.includes("hour")) value = parts.hours;
    else if (lower.includes("min")) value = parts.minutes;
    else if (lower.includes("sec")) value = parts.seconds;

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
          "data-targetdatetime": widget.targetDateTime?.default,
          ...additionalProps,
        } as any
      }
    >
      {renderedChildren}
    </BaseWidget>
  );
};

export default CountdownWidget;
