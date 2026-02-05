import React, { useRef, useState, useEffect } from "react";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
  /** enable resizable behavior */
  resizable?: boolean;
  /** allowed directions: any of 'left' | 'right' | 'bottom' */
  allowed?: Array<"left" | "right" | "bottom">;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
};

const Panel: React.FC<PanelProps> = ({
  className = "",
  children,
  style,
  resizable = false,
  allowed = [],
  minWidth = 280,
  maxWidth = 350,
  minHeight = 120,
  ...rest
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inlineStyle, setInlineStyle] = useState<React.CSSProperties | null>(
    null
  );

  useEffect(() => {
    // Initialize from passed style width/height if present
    if (style && !inlineStyle) {
      const s = {} as React.CSSProperties;
      if ((style as any).width) s.width = (style as any).width;
      if ((style as any).height) s.height = (style as any).height;
      if (Object.keys(s).length) setInlineStyle(s);
    }
  }, [style, inlineStyle]);

  useEffect(() => {
    return () => {
      // noop cleanup placeholder
    };
  }, []);

  const startResize = (
    e: React.MouseEvent,
    handle: "left" | "right" | "bottom"
  ) => {
    if (!resizable || !ref.current) return;
    e.preventDefault();
    e.stopPropagation();
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = rect.width;
    const startH = rect.height;

    const onMove = (ev: MouseEvent) => {
      let newW = startW;
      let newH = startH;
      if (handle === "right") {
        const dx = ev.clientX - startX;
        newW = startW + dx;
        if (typeof maxWidth === "number") newW = Math.min(maxWidth, newW);
        newW = Math.max(minWidth, newW);
      } else if (handle === "left") {
        const dx = ev.clientX - startX;
        newW = startW - dx;
        if (typeof maxWidth === "number") newW = Math.min(maxWidth, newW);
        newW = Math.max(minWidth, newW);
      } else if (handle === "bottom") {
        const dy = ev.clientY - startY;
        newH = Math.max(minHeight, startH + dy);
      }
      setInlineStyle((prev) => {
        const next: React.CSSProperties = { ...(prev || {}) };
        if (handle === "right" || handle === "left") next.width = newW + "px";
        if (handle === "bottom") next.height = newH + "px";
        return next;
      });
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const showHandle = (dir: string) => resizable && allowed.includes(dir as any);

  return (
    <div
      ref={ref}
      className={`panel ${className} ${resizable ? "resizable" : ""}`}
      style={{ ...(style as any), ...(inlineStyle || {}) }}
      {...rest}
    >
      {children}
      {showHandle("right") && (
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={(e) => startResize(e, "right")}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 8,
            height: "100%",
            cursor: "ew-resize",
            zIndex: 10000,
          }}
        />
      )}
      {showHandle("left") && (
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={(e) => startResize(e, "left")}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 8,
            height: "100%",
            cursor: "ew-resize",
            zIndex: 10000,
          }}
        />
      )}
      {showHandle("bottom") && (
        <div
          role="separator"
          aria-orientation="horizontal"
          onMouseDown={(e) => startResize(e, "bottom")}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: 8,
            cursor: "ns-resize",
            zIndex: 10000,
          }}
        />
      )}
    </div>
  );
};

export default Panel;
