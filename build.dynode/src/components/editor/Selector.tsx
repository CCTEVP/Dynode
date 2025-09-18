import React, { useEffect, useRef, useState } from "react";

type SelectedProps = {
  id?: string;
  tagName?: string;
  className?: string;
  dataset?: Record<string, string>;
  inlineStyle?: string | null;
};

const isSelectableId = (id?: string) => !!id && id.length > 0;

const getIndexPathForNode = (node: HTMLElement): number[] | undefined => {
  const attr = node.getAttribute("data-index-path") || node.dataset.indexPath;
  if (!attr) return undefined;
  const parts = String(attr)
    .split(/[-,\s]+/)
    .filter(Boolean);
  const nums = parts
    .map((p) => parseInt(p, 10))
    .filter((n) => !Number.isNaN(n));
  return nums.length ? nums : undefined;
};

interface Props {
  containerId: string;
  onSelectionChange?: (node: HTMLElement, props: SelectedProps) => void;
}

const Selector: React.FC<Props> = ({ containerId, onSelectionChange }) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const fixedOverlayRef = useRef<HTMLElement | null>(null);
  const hoverOverlayRef = useRef<HTMLElement | null>(null);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const propsRef = useRef<SelectedProps | null>(null);

  const unwrapCurrent = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (wrapper.parentElement) wrapper.parentElement.removeChild(wrapper);
    wrapperRef.current = null;
    if (fixedOverlayRef.current) {
      try {
        fixedOverlayRef.current.style.display = "none";
      } catch (err) {
        /* ignore */
      }
    }
  };

  const positionFixedOverlay = (node: HTMLElement | null) => {
    try {
      const fixed = fixedOverlayRef.current;
      if (!fixed || !node) return;
      const r = node.getBoundingClientRect();
      fixed.style.left = `${Math.max(0, r.left)}px`;
      fixed.style.top = `${Math.max(0, r.top)}px`;
      fixed.style.width = `${Math.max(0, r.width)}px`;
      fixed.style.height = `${Math.max(0, r.height)}px`;
      fixed.style.display = "block";
    } catch (err) {
      console.debug("Selector: positionFixedOverlay error", err);
    }
  };

  const wrapNode = (node: HTMLElement) => {
    unwrapCurrent();
    const container = containerRef.current;
    if (!container) return;
    const wrapper = document.createElement("div");
    wrapper.id = "selector";
    wrapper.style.position = "absolute";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "1900";
    wrapper.style.boxSizing = "border-box";
    wrapper.style.borderRadius = "2px";
    wrapper.style.border = "3px solid orange";
    wrapper.setAttribute("data-selector-overlay", "true");

    const nodeRect = node.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const left =
      nodeRect.left - containerRect.left + (container.scrollLeft || 0);
    const top = nodeRect.top - containerRect.top + (container.scrollTop || 0);
    wrapper.style.left = `${left}px`;
    wrapper.style.top = `${top}px`;
    wrapper.style.width = `${Math.max(0, nodeRect.width)}px`;
    wrapper.style.height = `${Math.max(0, nodeRect.height)}px`;
    container.appendChild(wrapper);
    wrapper.setAttribute("data-selected-element", node.id || "");
    wrapperRef.current = wrapper;
    // also position the fixed orange overlay for a persistent selection frame
    try {
      positionFixedOverlay(node);
    } catch (err) {
      /* ignore */
    }
  };

  useEffect(() => {
    let teardownFn: (() => void) | null = null;
    let intervalId: number | null = null;

    const initForContainer = (container: HTMLElement) => {
      containerRef.current = container;

      try {
        const fixed = document.createElement("div");
        fixed.className = "selector-frame-fixed";
        fixed.style.position = "fixed";
        fixed.style.display = "none";
        fixed.style.pointerEvents = "none";
        fixed.style.boxSizing = "border-box";
        fixed.style.border = "3px solid orange";
        fixed.style.zIndex = "1900";
        document.body.appendChild(fixed);
        fixedOverlayRef.current = fixed;
      } catch (err) {
        console.debug("Selector init fixed overlay error", err);
        fixedOverlayRef.current = null;
      }

      try {
        const hover = document.createElement("div");
        hover.className = "selector-frame-hover";
        hover.style.position = "absolute";
        hover.style.display = "none";
        hover.style.pointerEvents = "none";
        hover.style.boxSizing = "border-box";
        hover.style.border = "2px dotted skyblue";
        hover.style.borderRadius = "2px";
        hover.style.zIndex = "2000";
        hover.setAttribute("data-selector-hover", "true");
        container.appendChild(hover);
        hoverOverlayRef.current = hover;
      } catch (err) {
        console.debug("Selector init hover overlay error", err);
        hoverOverlayRef.current = null;
      }

      try {
        if (!document.getElementById("selector-styles")) {
          const style = document.createElement("style");
          style.id = "selector-styles";
          style.textContent = `.selector-frame-fixed { box-sizing: border-box; pointer-events: none; border-radius: 2px; }`;
          document.head.appendChild(style);
        }
      } catch (err) {
        console.debug("Selector init style inject error", err);
      }

      const onClickCapture = (e: MouseEvent) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const containerEl = containerRef.current;
        if (!containerEl) return;

        if (!containerEl.contains(target)) return;

        const elAtPoint = document.elementFromPoint(
          e.clientX,
          e.clientY
        ) as HTMLElement | null;
        if (!elAtPoint) return;

        // initial selection when nothing selected: choose immediate child under container
        if (!selectedEl) {
          let node: HTMLElement | null = target;
          while (
            node &&
            node !== containerEl &&
            node.parentElement !== containerEl
          ) {
            node = node.parentElement;
          }
          if (!node || node === containerEl) return;
          if (!isSelectableId(node.id)) return;
          setSelectedEl(node);
          wrapNode(node);
          const dsMap = (node.dataset || {}) as DOMStringMap;
          const ds: Record<string, string> = {};
          Object.keys(dsMap).forEach(
            (k) => (ds[k] = dsMap[k] === undefined ? "" : String(dsMap[k]))
          );
          const sp: SelectedProps = {
            id: node.id,
            tagName: node.tagName,
            className: node.className,
            dataset: ds,
            inlineStyle: node.getAttribute("style"),
          };
          propsRef.current = sp;
          onSelectionChange?.(node, sp);
          if (hoverOverlayRef.current)
            hoverOverlayRef.current.style.display = "none";
          try {
            const indexPath = getIndexPathForNode(node);
            window.dispatchEvent(
              new CustomEvent("creative:selection", {
                detail: { ...sp, indexPath },
              })
            );
          } catch (err) {
            console.debug("Selector: click dispatch error", err);
          }
          console.debug("Selector: click selected", node.id);
          return;
        }

        // clicked outside selected element: climb to nearest selectable ancestor
        if (!selectedEl.contains(elAtPoint)) {
          let alt: HTMLElement | null = elAtPoint;
          while (alt && alt !== containerEl && !isSelectableId(alt.id)) {
            alt = alt.parentElement as HTMLElement | null;
          }
          if (alt && alt !== containerEl && isSelectableId(alt.id)) {
            unwrapCurrent();
            wrapNode(alt);
            setSelectedEl(alt);
            const dsAltMap = (alt.dataset || {}) as DOMStringMap;
            const dsAlt: Record<string, string> = {};
            Object.keys(dsAltMap).forEach(
              (k) =>
                (dsAlt[k] =
                  dsAltMap[k] === undefined ? "" : String(dsAltMap[k]))
            );
            const spAlt: SelectedProps = {
              id: alt.id,
              tagName: alt.tagName,
              className: alt.className,
              dataset: dsAlt,
              inlineStyle: alt.getAttribute("style"),
            };
            propsRef.current = spAlt;
            onSelectionChange?.(alt, spAlt);
            if (hoverOverlayRef.current)
              hoverOverlayRef.current.style.display = "none";
            try {
              const indexPath = getIndexPathForNode(alt);
              window.dispatchEvent(
                new CustomEvent("creative:selection", {
                  detail: { ...spAlt, indexPath },
                })
              );
            } catch (err) {
              console.debug("Selector: climb dispatch error", err);
            }
            console.debug("Selector: climbed to other selectable", alt.id);
          }
          return;
        }

        // clicked inside selectedEl: attempt to descend to a nested selectable element under the pointer
        try {
          const list = document.elementsFromPoint(
            e.clientX,
            e.clientY
          ) as Element[];
          let picked: HTMLElement | null = null;
          for (const el of list) {
            const h = el as HTMLElement;
            if (!h) continue;
            if (!selectedEl.contains(h)) continue;
            if (isSelectableId(h.id) && h !== selectedEl) {
              picked = h;
              break;
            }
          }
          if (!picked) {
            const selectableDesc = Array.from(
              selectedEl.querySelectorAll<HTMLElement>("[id]")
            ).filter((el) => isSelectableId(el.id));
            let deepest: HTMLElement | null = null;
            let bestDepth = -1;
            for (const s of selectableDesc) {
              const r = s.getBoundingClientRect();
              if (
                e.clientX >= r.left &&
                e.clientX <= r.right &&
                e.clientY >= r.top &&
                e.clientY <= r.bottom
              ) {
                let d = 0;
                let p: HTMLElement | null = s;
                while (p && p !== selectedEl) {
                  d++;
                  p = p.parentElement as HTMLElement | null;
                }
                if (d > bestDepth) {
                  bestDepth = d;
                  deepest = s;
                }
              }
            }
            if (deepest) picked = deepest;
          }
          if (!picked) return;

          unwrapCurrent();
          wrapNode(picked);
          setSelectedEl(picked);
          if (hoverOverlayRef.current)
            hoverOverlayRef.current.style.display = "none";
          const ds2Map = (picked.dataset || {}) as DOMStringMap;
          const ds2: Record<string, string> = {};
          Object.keys(ds2Map).forEach(
            (k) => (ds2[k] = ds2Map[k] === undefined ? "" : String(ds2Map[k]))
          );
          const sp: SelectedProps = {
            id: picked.id,
            tagName: picked.tagName,
            className: picked.className,
            dataset: ds2,
            inlineStyle: picked.getAttribute("style"),
          };
          propsRef.current = sp;
          onSelectionChange?.(picked, sp);
          try {
            const indexPath = getIndexPathForNode(picked);
            window.dispatchEvent(
              new CustomEvent("creative:selection", {
                detail: { ...sp, indexPath },
              })
            );
          } catch (err) {
            console.debug("Selector: descend dispatch error", err);
          }
          console.debug("Selector: descended to", picked.id);
        } catch (err) {
          console.debug("Selector: descend elementsFromPoint error", err);
        }
      };

      container.addEventListener("click", onClickCapture, true);

      const onPointerMove = (ev: PointerEvent) => {
        try {
          const p = ev as PointerEvent;
          const containerEl = containerRef.current;
          if (!containerEl) return;
          const x = p.clientX;
          const y = p.clientY;
          if (!containerEl.contains(p.target as Node)) {
            if (hoverOverlayRef.current)
              hoverOverlayRef.current.style.display = "none";
            return;
          }

          const list = document.elementsFromPoint(x, y) as Element[];
          let candidate: HTMLElement | null = null;
          for (const el of list) {
            const h = el as HTMLElement;
            if (!h) continue;
            if (!containerEl.contains(h)) continue;
            if (isSelectableId(h.id)) {
              candidate = h;
              break;
            }
          }

          if (!candidate || (selectedEl && candidate === selectedEl)) {
            if (hoverOverlayRef.current)
              hoverOverlayRef.current.style.display = "none";
            return;
          }

          const nodeRect = candidate.getBoundingClientRect();
          const containerRect = containerEl.getBoundingClientRect();
          const left =
            nodeRect.left - containerRect.left + (containerEl.scrollLeft || 0);
          const top =
            nodeRect.top - containerRect.top + (containerEl.scrollTop || 0);
          if (hoverOverlayRef.current) {
            const hEl = hoverOverlayRef.current;
            hEl.style.left = `${left}px`;
            hEl.style.top = `${top}px`;
            hEl.style.width = `${Math.max(0, nodeRect.width)}px`;
            hEl.style.height = `${Math.max(0, nodeRect.height)}px`;
            hEl.style.display = "block";
          }
        } catch (err) {
          console.debug("Selector: pointermove error", err);
        }
      };

      const onPointerLeave = () => {
        if (hoverOverlayRef.current)
          hoverOverlayRef.current.style.display = "none";
      };

      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerleave", onPointerLeave);

      return () => {
        container.removeEventListener("click", onClickCapture, true);
        container.removeEventListener(
          "pointermove",
          onPointerMove as EventListener
        );
        container.removeEventListener(
          "pointerleave",
          onPointerLeave as EventListener
        );
        if (fixedOverlayRef.current && fixedOverlayRef.current.parentElement) {
          fixedOverlayRef.current.parentElement.removeChild(
            fixedOverlayRef.current
          );
          fixedOverlayRef.current = null;
        }
        if (hoverOverlayRef.current && hoverOverlayRef.current.parentElement) {
          hoverOverlayRef.current.parentElement.removeChild(
            hoverOverlayRef.current
          );
          hoverOverlayRef.current = null;
        }
        unwrapCurrent();
        containerRef.current = null;
      };
    };

    const found = document.getElementById(containerId) as HTMLElement | null;
    if (found) {
      teardownFn = initForContainer(found);
    } else {
      intervalId = window.setInterval(() => {
        const c = document.getElementById(containerId) as HTMLElement | null;
        if (c) {
          if (intervalId) {
            window.clearInterval(intervalId);
            intervalId = null;
          }
          teardownFn = initForContainer(c);
        }
      }, 250);
    }

    return () => {
      if (intervalId) window.clearInterval(intervalId);
      if (teardownFn) teardownFn();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, onSelectionChange, selectedEl]);

  // Listen for external selection events
  useEffect(() => {
    const handler = (ev: Event) => {
      const cEv = ev as CustomEvent;
      const detail = (cEv && (cEv.detail as Record<string, unknown>)) || {};
      let candidate: HTMLElement | null = null;
      try {
        if (typeof detail.id === "string" && detail.id) {
          candidate = document.getElementById(
            String(detail.id)
          ) as HTMLElement | null;
        }
        if (!candidate && detail.indexPath && Array.isArray(detail.indexPath)) {
          const idxNeedle = (detail.indexPath as unknown[]).join("-");
          const byData = document.querySelector(
            `[data-index-path="${idxNeedle}"]`
          ) as HTMLElement | null;
          if (byData) candidate = byData;
        }
      } catch (err) {
        console.debug("Selector: external select handler error", err);
      }
      if (candidate) {
        try {
          unwrapCurrent();
          wrapNode(candidate);
          setSelectedEl(candidate);
          const dsMap = (candidate.dataset || {}) as DOMStringMap;
          const ds: Record<string, string> = {};
          Object.keys(dsMap).forEach(
            (k) => (ds[k] = dsMap[k] === undefined ? "" : String(dsMap[k]))
          );
          const sp: SelectedProps = {
            id: candidate.id,
            tagName: candidate.tagName,
            className: candidate.className,
            dataset: ds,
            inlineStyle: candidate.getAttribute("style"),
          };
          propsRef.current = sp;
          onSelectionChange?.(candidate, sp);
        } catch (err) {
          console.debug("Selector: external select failed", err);
        }
      }
    };

    window.addEventListener("creative:select", handler as EventListener);
    window.addEventListener("creative:selection", handler as EventListener);
    return () => {
      window.removeEventListener("creative:select", handler as EventListener);
      window.removeEventListener(
        "creative:selection",
        handler as EventListener
      );
    };
  }, [onSelectionChange]);

  return null;
};

export default Selector;
