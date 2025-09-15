import React, { useCallback, useEffect, useRef, useState } from "react";
import "./creative-canvas.css";

interface CreativeCanvasProps {
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
  /** fraction of container to leave as margin on each side (0.0 - 0.4). Default 0.08 = 8% */
  defaultMargin?: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3.0;

export const CreativeCanvas: React.FC<CreativeCanvasProps> = ({
  children,
  leftPanel,
  rightPanel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const isUserControlled = useRef<boolean>(false);
  // Panning state refs
  const isPanningRef = useRef<boolean>(false);
  const isSpacePressedRef = useRef<boolean>(false);
  const panStartRef = useRef<{
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  }>({
    x: 0,
    y: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });
  const { defaultMargin = 0.08 } = {} as CreativeCanvasProps;
  const [padPx, setPadPx] = useState<number>(160);

  const clamp = useCallback(
    (v: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, v)),
    []
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          isUserControlled.current = true;
          setScale((s) => clamp(+(s + 0.1).toFixed(2)));
        }
        if (e.key === "-") {
          e.preventDefault();
          isUserControlled.current = true;
          setScale((s) => clamp(+(s - 0.1).toFixed(2)));
        }
        if (e.key === "0") {
          e.preventDefault();
          isUserControlled.current = true;
          setScale(1);
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [clamp]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (ev: WheelEvent) => {
      // Only handle zoom when ctrlKey is pressed
      if (!ev.ctrlKey) return;
      ev.preventDefault();

      const delta = ev.deltaY || ev.detail || 0;
      const change = delta > 0 ? -0.08 : 0.08;
      isUserControlled.current = true;
      setScale((s) => clamp(+(s + change).toFixed(2)));
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [clamp]);

  // Panning: support middle-mouse drag, or hold Space + drag (left mouse)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isInputFocused = () => {
      const active = document.activeElement as HTMLElement | null;
      if (!active) return false;
      const tag = active.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        active.isContentEditable
      );
    };

    const stopPanning = () => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;
      container.classList.remove("panning");
      document.removeEventListener("mousemove", onMouseMove as any);
      document.removeEventListener("mouseup", onMouseUp as any);
      try {
        document.body.style.cursor = "";
      } catch {}
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!isPanningRef.current) return;
      const start = panStartRef.current;
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      container.scrollLeft = start.scrollLeft - dx;
      container.scrollTop = start.scrollTop - dy;
    };

    const onMouseUp = () => {
      stopPanning();
    };

    const startPanning = (ev: MouseEvent) => {
      // begin panning
      isPanningRef.current = true;
      panStartRef.current = {
        x: ev.clientX,
        y: ev.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
      container.classList.add("panning");
      // set grabbing cursor on the whole document while panning
      try {
        document.body.style.cursor = "grabbing";
      } catch {}
      document.addEventListener("mousemove", onMouseMove as any);
      document.addEventListener("mouseup", onMouseUp as any);
    };

    const onMouseDown = (ev: MouseEvent) => {
      // Middle button (1) or space-primed left button (0)
      if (ev.button === 1) {
        ev.preventDefault(); // prevent default autoscroll
        startPanning(ev);
      } else if (ev.button === 0 && isSpacePressedRef.current) {
        // left button + space held
        ev.preventDefault();
        startPanning(ev);
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.code === "Space" && !ev.repeat && !isInputFocused()) {
        isSpacePressedRef.current = true;
        container.classList.add("pan-ready");
        // prevent page from scrolling when space is pressed and focus is not in an input
        ev.preventDefault();
      }
    };

    const onKeyUp = (ev: KeyboardEvent) => {
      if (ev.code === "Space") {
        // if we're currently panning, stop when space is released
        if (isPanningRef.current) stopPanning();
        isSpacePressedRef.current = false;
        container.classList.remove("pan-ready");
      }
    };

    container.addEventListener("mousedown", onMouseDown as any);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      container.removeEventListener("mousedown", onMouseDown as any);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      stopPanning();
    };
  }, []);

  const zoomIn = () => setScale((s) => clamp(+(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => clamp(+(s - 0.1).toFixed(2)));
  const reset = () => setScale(1);

  // mark user when using buttons
  const handleZoomIn = () => {
    isUserControlled.current = true;
    zoomIn();
  };
  const handleZoomOut = () => {
    isUserControlled.current = true;
    zoomOut();
  };
  const handleReset = () => {
    isUserControlled.current = true;
    reset();
  };

  // Compute a default fit scale that makes the inner content fully visible with margin
  const computeDefaultScale = useCallback(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    // leave margin percent of width/height on each side
    const availW = Math.max(20, cW * (1 - defaultMargin * 2));
    const availH = Math.max(20, cH * (1 - defaultMargin * 2));

    // inner offsetWidth/Height are unscaled sizes
    const iW = inner.offsetWidth || inner.scrollWidth || 1;
    const iH = inner.offsetHeight || inner.scrollHeight || 1;

    const scaleX = availW / iW;
    const scaleY = availH / iH;
    const target = clamp(Math.min(scaleX, scaleY));
    // Only apply if user hasn't interacted yet
    if (!isUserControlled.current) {
      setScale(target);
    }
  }, [clamp, defaultMargin]);

  // Observe resizes on container and inner to recompute default scale
  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    computeDefaultScale();

    const ro1 = new ResizeObserver(() => computeDefaultScale());
    const ro2 = new ResizeObserver(() => computeDefaultScale());
    ro1.observe(container);
    ro2.observe(inner);

    // Also recompute padding so scrolling space scales with container
    const computePad = () => {
      try {
        const cW = container.clientWidth || 800;
        // 15% of width, min 80px, max 600px
        const p = Math.round(Math.max(80, Math.min(600, cW * 0.15)));
        setPadPx(p);
      } catch (err) {}
    };
    computePad();
    const ro3 = new ResizeObserver(() => computePad());
    ro3.observe(container);

    window.addEventListener("resize", computeDefaultScale);
    return () => {
      ro1.disconnect();
      ro2.disconnect();
      ro3.disconnect();
      window.removeEventListener("resize", computeDefaultScale);
    };
  }, [computeDefaultScale]);

  return (
    <div
      className="creative-canvas-wrapper"
      style={{ height: "100%", width: "100%" }}
    >
      <div
        className="creative-canvas-outer"
        tabIndex={0}
        ref={containerRef}
        aria-label="Creative canvas"
      >
        <div
          className="creative-canvas-scroll"
          ref={scrollRef}
          style={{ padding: padPx }}
        >
          <div
            className="creative-canvas-inner"
            ref={innerRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <div className="creative-canvas-hud" role="status" aria-live="polite">
        <div className="hud-left">{leftPanel}</div>
        <div className="hud-center">
          <div className="hud-center-icons">
            <button onClick={handleZoomOut} aria-label="Zoom out">
              -
            </button>
            <div>{Math.round(scale * 100)}%</div>
            <button onClick={handleReset} aria-label="Reset zoom">
              0
            </button>
            <button onClick={handleZoomIn} aria-label="Zoom in">
              +
            </button>
          </div>
        </div>
        <div className="hud-right">{rightPanel}</div>
      </div>
    </div>
  );
};

export default CreativeCanvas;
