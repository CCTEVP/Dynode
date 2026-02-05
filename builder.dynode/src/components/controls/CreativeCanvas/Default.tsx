import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Default.css";

interface CreativeCanvasProps {
  children: React.ReactNode;
  defaultMargin?: number;
}

const MIN_SCALE = 0.25;
const MAX_SCALE = 3.0;

export const CreativeCanvas: React.FC<CreativeCanvasProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number>(1);
  const isUserControlled = useRef<boolean>(false);
  const isPanningRef = useRef<boolean>(false);
  const isSpacePressedRef = useRef<boolean>(false);
  const panStartRef = useRef<{
    x: number;
    y: number;
    scrollLeft: number;
    scrollTop: number;
  }>({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const { defaultMargin = 0.08 } = {} as CreativeCanvasProps;
  const [pad, setPad] = useState<{ x: number; y: number }>({ x: 160, y: 80 });

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
      isPanningRef.current = true;
      panStartRef.current = {
        x: ev.clientX,
        y: ev.clientY,
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
      };
      container.classList.add("panning");
      try {
        document.body.style.cursor = "grabbing";
      } catch {}
      document.addEventListener("mousemove", onMouseMove as any);
      document.addEventListener("mouseup", onMouseUp as any);
    };

    const onMouseDown = (ev: MouseEvent) => {
      if (ev.button === 1) {
        ev.preventDefault();
        startPanning(ev);
      } else if (ev.button === 0 && isSpacePressedRef.current) {
        ev.preventDefault();
        startPanning(ev);
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.code === "Space" && !ev.repeat && !isInputFocused()) {
        isSpacePressedRef.current = true;
        container.classList.add("pan-ready");
        ev.preventDefault();
      }
    };

    const onKeyUp = (ev: KeyboardEvent) => {
      if (ev.code === "Space") {
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

  // internal zoom helpers removed with HUD

  // zoom handlers are internal; external HUD removed

  const computeDefaultScale = useCallback(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    const availW = Math.max(20, cW * (1 - defaultMargin * 2));
    const availH = Math.max(20, cH * (1 - defaultMargin * 2));

    const iW = inner.offsetWidth || inner.scrollWidth || 1;
    const iH = inner.offsetHeight || inner.scrollHeight || 1;

    const scaleX = availW / iW;
    const scaleY = availH / iH;
    const target = clamp(Math.min(scaleX, scaleY));
    if (!isUserControlled.current) {
      setScale(target);
    }
  }, [clamp, defaultMargin]);

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    computeDefaultScale();

    const ro1 = new ResizeObserver(() => computeDefaultScale());
    const ro2 = new ResizeObserver(() => computeDefaultScale());
    ro1.observe(container);
    ro2.observe(inner);

    const computePad = () => {
      try {
        const cW = container.clientWidth || 800;
        const cH = container.clientHeight || 600;
        const padX = Math.round(Math.max(80, Math.min(600, cW * 0.15)));
        const padY = Math.round(Math.max(24, Math.min(300, cH * 0.06)));
        setPad({ x: padX, y: padY });
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

  const [computedPad, setComputedPad] = useState<{
    top: number;
    bottom: number;
  }>({ top: pad.y, bottom: pad.y });

  useEffect(() => {
    const container = containerRef.current;
    const inner = innerRef.current;
    if (!container || !inner) return;

    const iH = inner.offsetHeight || inner.scrollHeight || 0;
    const scaledH = iH * scale;
    const dispPadY = Math.round(
      Math.max(8, Math.min(300, pad.y / Math.max(1, scale)))
    );
    const containerH = container.clientHeight;

    if (scaledH < Math.max(0, containerH - dispPadY * 2)) {
      const extra = Math.round(Math.max(dispPadY, (containerH - scaledH) / 2));
      setComputedPad({ top: extra, bottom: extra });
    } else {
      setComputedPad({ top: dispPadY, bottom: dispPadY });
    }
  }, [scale, pad]);

  const dispPad = (() => {
    const x = Math.round(
      Math.max(8, Math.min(600, pad.x / Math.max(1, scale)))
    );
    const y = Math.round(
      Math.max(8, Math.min(300, pad.y / Math.max(1, scale)))
    );
    return { x, y };
  })();

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
          style={{
            padding: `${computedPad.top}px ${dispPad.x}px ${computedPad.bottom}px`,
          }}
        >
          <div
            className="creative-canvas-inner"
            ref={innerRef}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            {children}
          </div>
        </div>
      </div>

      {/* HUD removed: left/center/right HUD panels are no longer rendered here */}
    </div>
  );
};

export default CreativeCanvas;
