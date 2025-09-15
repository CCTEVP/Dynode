import React, { useEffect, useRef, useState } from "react";

interface SelectedProps {
  id?: string;
  tagName?: string;
  className?: string;
  dataset?: Record<string, string>;
  inlineStyle?: string | null;
}

interface SelectorProps {
  containerId?: string; // DOM id of creative container (default: dynamic-creative-container)
  onSelectionChange?: (
    el: HTMLElement | null,
    props: SelectedProps | null
  ) => void;
}

const Selector: React.FC<SelectorProps> = ({
  containerId = "dynamic-creative-container",
  onSelectionChange,
}) => {
  const containerRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const hoverRef = useRef<HTMLDivElement | null>(null);
  const [selectedEl, setSelectedEl] = useState<HTMLElement | null>(null);
  const propsRef = useRef<SelectedProps | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  const isSelectableId = (id?: string | null) => {
    if (!id) return false;
    // expect ids like: <type>-widget-<id> or <type>-layout-<id>
    return /-(widget|layout)-[A-Za-z0-9]+$/i.test(id);
  };

  useEffect(() => {
    let raf = 0;
    let intervalId: number | null = null;
    let teardownFn: (() => void) | null = null;

    const initForContainer = (container: HTMLElement) => {
      containerRef.current = container;
      // helper: find scale factors on ancestor transforms
      const getAncestorScale = (startEl: HTMLElement | null) => {
        let cur = startEl?.parentElement || null;
        while (cur && cur !== document.documentElement) {
          const s = window.getComputedStyle(cur).transform;
          if (s && s !== "none") {
            const m = s.match(/matrix\(([-0-9., ]+)\)/);
            if (m) {
              const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
              if (parts.length >= 6 && !Number.isNaN(parts[0])) {
                return { sx: parts[0], sy: parts[3] };
              }
            }
            const scaleMatch = s.match(
              /scale\(([-0-9.]+)(?:,\s*([-0-9.]+))?\)/
            );
            if (scaleMatch) {
              const sx = parseFloat(scaleMatch[1]);
              const sy = scaleMatch[2] ? parseFloat(scaleMatch[2]) : sx;
              return { sx, sy };
            }
          }
          cur = cur.parentElement;
        }
        return { sx: 1, sy: 1 };
      };

      const updateWrapperPosition = () => {
        if (!overlayRef.current) return;
        if (!selectedEl) {
          overlayRef.current.style.display = "none";
          overlayRef.current.setAttribute("data-selected-element", "");
        } else {
          const nodeRect = selectedEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const scale = getAncestorScale(container);
          const invScaleX = scale.sx ? 1 / scale.sx : 1;
          const invScaleY = scale.sy ? 1 / scale.sy : 1;
          const left =
            (nodeRect.left - containerRect.left) * invScaleX +
            (container.scrollLeft || 0);
          const top =
            (nodeRect.top - containerRect.top) * invScaleY +
            (container.scrollTop || 0);
          const width = nodeRect.width * invScaleX;
          const height = nodeRect.height * invScaleY;
          overlayRef.current.style.display = "block";
          overlayRef.current.style.left = `${left}px`;
          overlayRef.current.style.top = `${top}px`;
          overlayRef.current.style.width = `${Math.max(0, width)}px`;
          overlayRef.current.style.height = `${Math.max(0, height)}px`;
          overlayRef.current.setAttribute(
            "data-selected-element",
            selectedEl.id || ""
          );
        }
        // keep hover overlay hidden when selecting (we'll still update it separately)
        if (hoverRef.current && !selectedEl) {
          // let hover be visible only when nothing is selected? keep it always updated below via mouse handlers
        }
        if (wrapperRef.current) {
          if (!selectedEl) {
            wrapperRef.current.style.display = "none";
          } else {
            wrapperRef.current.style.display = "block";
          }
        }
      };

      const tick = () => {
        updateWrapperPosition();
        raf = requestAnimationFrame(tick);
      };

      raf = requestAnimationFrame(tick);

      const onScroll = () => {
        updateWrapperPosition();
      };

      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onScroll);

      // Click handler (capture) - select nearest selectable ancestor inside container
      const onClickCapture = (ev: Event) => {
        const e = ev as MouseEvent;
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (!container.contains(target)) return;
        // ignore clicks on the wrapper itself
        if (wrapperRef.current && wrapperRef.current.contains(target)) return;

        // Single-click selects the immediate child of the creative container that contains the click
        let node: HTMLElement | null = target;
        // climb until we reach a direct child of container (parent === container)
        while (node && node !== container && node.parentElement !== container) {
          node = node.parentElement;
        }
        // if we hit the container itself, nothing to select
        if (!node || node === container) return;
        // only select if the immediate child has a selectable id
        if (!isSelectableId(node.id)) {
          // nothing selectable at first-child level
          return;
        }

        // stop other handlers from interfering
        try {
          e.stopPropagation();
          e.preventDefault();
          (e as any).stopImmediatePropagation?.();
        } catch (err) {}

        const ds: Record<string, string> = {};
        Object.keys(node.dataset || {}).forEach((k) => {
          const v = (node.dataset as any)[k];
          ds[k] = v === undefined ? "" : String(v);
        });

        const sp: SelectedProps = {
          id: node.id,
          tagName: node.tagName,
          className: node.className,
          dataset: ds,
          inlineStyle: node.getAttribute("style"),
        };
        // debounce single-click selection so dblclick can override
        if (clickTimeoutRef.current) {
          window.clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }
        clickTimeoutRef.current = window.setTimeout(() => {
          setSelectedEl(node);
          // wrap the node in the selector wrapper
          wrapNode(node);
          propsRef.current = sp;
          onSelectionChange?.(node, sp);
          // emit global event for other parts (properties panel)
          try {
            window.dispatchEvent(
              new CustomEvent("creative:selection", { detail: sp })
            );
          } catch (err) {}
          console.debug("Selector: single-click selected", node.id);
          clickTimeoutRef.current = null;
        }, 220);
      };

      // Double-click capture - if double-click on an already selected element, descend to child under pointer
      const onDblClickCapture = (ev: Event) => {
        const e = ev as MouseEvent;
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (!container.contains(target)) return;

        try {
          e.stopPropagation();
          e.preventDefault();
          (e as any).stopImmediatePropagation?.();
        } catch (err) {}

        // cancel any pending single-click selection so dblclick won't be followed by it
        if (clickTimeoutRef.current) {
          window.clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
        }

        // If nothing selected, behave like single-click: select immediate child of container under pointer
        if (!selectedEl) {
          let node: HTMLElement | null = target;
          const containerEl = containerRef.current;
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
          const ds: Record<string, string> = {};
          Object.keys(node.dataset || {}).forEach((k) => {
            const v = (node.dataset as any)[k];
            ds[k] = v === undefined ? "" : String(v);
          });
          const sp: SelectedProps = {
            id: node.id,
            tagName: node.tagName,
            className: node.className,
            dataset: ds,
            inlineStyle: node.getAttribute("style"),
          };
          propsRef.current = sp;
          onSelectionChange?.(node, sp);
          try {
            window.dispatchEvent(
              new CustomEvent("creative:selection", { detail: sp })
            );
          } catch (err) {}
          console.debug("Selector: dblclick (none selected) selected", node.id);
          return;
        }

        // Find the deepest element under the pointer
        const elAtPoint = document.elementFromPoint(
          e.clientX,
          e.clientY
        ) as HTMLElement | null;
        if (!elAtPoint) return;
        console.debug(
          "Selector:dblclick elAtPoint",
          elAtPoint,
          "id",
          elAtPoint.id,
          "classes",
          elAtPoint.className
        );
        // Prefer the topmost selectable element under the pointer using elementsFromPoint.
        try {
          const list = document.elementsFromPoint(
            e.clientX,
            e.clientY
          ) as Element[];
          for (const el of list) {
            const h = el as HTMLElement;
            if (!h) continue;
            if (!container.contains(h)) continue;
            if (isSelectableId(h.id)) {
              // select this element immediately
              unwrapCurrent();
              wrapNode(h);
              setSelectedEl(h);
              const dsTop: Record<string, string> = {};
              Object.keys(h.dataset || {}).forEach((k) => {
                const v = (h.dataset as any)[k];
                dsTop[k] = v === undefined ? "" : String(v);
              });
              const spTop: SelectedProps = {
                id: h.id,
                tagName: h.tagName,
                className: h.className,
                dataset: dsTop,
                inlineStyle: h.getAttribute("style"),
              };
              propsRef.current = spTop;
              onSelectionChange?.(h, spTop);
              console.debug(
                "Selector:dblclick picked topmost selectable",
                h.id
              );
              return;
            }
          }
        } catch (err) {
          // elementsFromPoint may not be available in some older environments; ignore.
        }
        // ensure it's inside the currently selected element
        if (!selectedEl.contains(elAtPoint)) {
          // If click sits on another selectable element elsewhere, attempt to climb to it
          let alt: HTMLElement | null = elAtPoint as HTMLElement | null;
          const containerEl = containerRef.current;
          while (alt && alt !== containerEl && !isSelectableId(alt.id)) {
            alt = alt.parentElement as HTMLElement | null;
          }
          if (alt && alt !== containerEl && isSelectableId(alt.id)) {
            // select this other selectable ancestor
            unwrapCurrent();
            wrapNode(alt);
            setSelectedEl(alt);
            const dsAlt: Record<string, string> = {};
            Object.keys(alt.dataset || {}).forEach((k) => {
              const v = (alt.dataset as any)[k];
              dsAlt[k] = v === undefined ? "" : String(v);
            });
            const spAlt: SelectedProps = {
              id: alt.id,
              tagName: alt.tagName,
              className: alt.className,
              dataset: dsAlt,
              inlineStyle: alt.getAttribute("style"),
            };
            propsRef.current = spAlt;
            onSelectionChange?.(alt, spAlt);
            console.debug(
              "Selector:dblclick climbed to other selectable ancestor",
              alt.id
            );
          }
          return;
        }
        // ignore clicks on wrapper
        if (wrapperRef.current && wrapperRef.current.contains(elAtPoint))
          return;

        if (elAtPoint === selectedEl) return;

        // find nearest selectable ancestor with an id, starting from elAtPoint and stopping at selectedEl
        let candidate: HTMLElement | null = elAtPoint;
        while (
          candidate &&
          candidate !== selectedEl &&
          !isSelectableId(candidate.id)
        ) {
          candidate = candidate.parentElement;
        }
        if (!candidate || candidate === selectedEl) {
          // fallback: search selectable descendants of selectedEl
          const selectableDesc = Array.from(
            selectedEl.querySelectorAll<HTMLElement>("[id]")
          ).filter((el) => isSelectableId(el.id));
          let picked: HTMLElement | null = null;
          // prefer descendants whose rect contains the click point
          for (const s of selectableDesc) {
            const r = s.getBoundingClientRect();
            if (
              e.clientX >= r.left &&
              e.clientX <= r.right &&
              e.clientY >= r.top &&
              e.clientY <= r.bottom
            ) {
              if (!picked) picked = s;
              else {
                const depth = (el: HTMLElement) => {
                  let d = 0;
                  let p: HTMLElement | null = el;
                  while (p && p !== selectedEl) {
                    d++;
                    p = p.parentElement;
                  }
                  return d;
                };
                if (depth(s) > depth(picked)) picked = s;
              }
            }
          }
          // if none contains the point, pick the closest descendant center within a threshold
          if (!picked && selectableDesc.length) {
            let best: { el: HTMLElement; dist: number } | null = null;
            for (const s of selectableDesc) {
              const r = s.getBoundingClientRect();
              const cx = r.left + r.width / 2;
              const cy = r.top + r.height / 2;
              const dx = cx - e.clientX;
              const dy = cy - e.clientY;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (!best || dist < best.dist) best = { el: s, dist };
            }
            if (best && best.dist <= 64) {
              picked = best.el;
              console.debug(
                "Selector:dblclick picked closest descendant",
                picked.id,
                "dist",
                best.dist
              );
            }
          }
          if (!picked) {
            console.debug(
              "Selector:dblclick no candidate found via climb or descendants"
            );
            return;
          }
          candidate = picked;
        }

        // rewrap to the new candidate (descend one selectable level)
        unwrapCurrent();
        wrapNode(candidate);
        setSelectedEl(candidate);
        const ds2: Record<string, string> = {};
        Object.keys(candidate.dataset || {}).forEach((k) => {
          const v = (candidate.dataset as any)[k];
          ds2[k] = v === undefined ? "" : String(v);
        });
        const sp: SelectedProps = {
          id: candidate.id,
          tagName: candidate.tagName,
          className: candidate.className,
          dataset: ds2,
          inlineStyle: candidate.getAttribute("style"),
        };
        propsRef.current = sp;
        onSelectionChange?.(candidate, sp);
        try {
          window.dispatchEvent(
            new CustomEvent("creative:selection", { detail: sp })
          );
        } catch (err) {}
      };

      // Add listeners in capture phase to intercept before React synthetic handlers
      container.addEventListener("click", onClickCapture, true);
      container.addEventListener("dblclick", onDblClickCapture, true);

      // create an overlay div (absolute, appended into the container) to draw a constant-size border and handles
      const overlay = document.createElement("div");
      overlay.className = "selector-frame";
      overlay.style.position = "absolute"; // absolute within container so it's clipped
      overlay.style.display = "none";
      overlay.style.pointerEvents = "none";
      overlay.setAttribute("data-selected-element", "");
      // create 8 handle elements: nw, ne, sw, se, n, s, w, e
      const handles = ["nw", "ne", "sw", "se", "n", "s", "w", "e"];
      handles.forEach((h) => {
        const el = document.createElement("div");
        el.className = `sel-handle ${h}`;
        overlay.appendChild(el);
      });
      // append the overlay inside the creative container so it is clipped by the canvas
      container.appendChild(overlay);
      overlayRef.current = overlay;

      // return cleanup function for this init
      return () => {
        if (raf) cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onScroll);
        container.removeEventListener("click", onClickCapture, true);
        container.removeEventListener("dblclick", onDblClickCapture, true);
        if (overlayRef.current && overlayRef.current.parentElement) {
          overlayRef.current.parentElement.removeChild(overlayRef.current);
        }
        // cleanup wrapper if present
        unwrapCurrent();
        containerRef.current = null;
        wrapperRef.current = null;
      };
    };

    // attempt immediate init, otherwise poll briefly until container appears
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
  }, [containerId, onSelectionChange, selectedEl]);

  // helper to unwrap current selection if wrapper exists
  const unwrapCurrent = () => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (wrapper.parentElement) wrapper.parentElement.removeChild(wrapper);
    console.debug("Selector: removed wrapper", wrapper);
    wrapperRef.current = null;
    // clear overlay attr too
    if (overlayRef.current)
      overlayRef.current.setAttribute("data-selected-element", "");
  };

  // helper to wrap a node in a wrapper with id 'selector'
  const wrapNode = (node: HTMLElement) => {
    // unwrap existing
    unwrapCurrent();
    const container = containerRef.current;
    if (!container) return;
    const wrapper = document.createElement("div");
    wrapper.id = "selector";
    wrapper.className = "selector-wrapper";
    wrapper.style.position = "absolute";
    wrapper.style.pointerEvents = "none";
    // ensure wrapper is visible in devtools and above canvas children
    wrapper.style.zIndex = "90001";
    wrapper.setAttribute("data-selector-overlay", "true");
    // compute bounding rect relative to container
    const nodeRect = node.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // find nearest ancestor with a transform (scale) and extract scaleX/scaleY
    const getAncestorScale = (startEl: HTMLElement | null) => {
      let cur = startEl?.parentElement || null;
      while (cur && cur !== document.documentElement) {
        const s = window.getComputedStyle(cur).transform;
        if (s && s !== "none") {
          const m = s.match(/matrix\(([-0-9., ]+)\)/);
          if (m) {
            const parts = m[1].split(",").map((p) => parseFloat(p.trim()));
            if (parts.length >= 6 && !Number.isNaN(parts[0])) {
              return { sx: parts[0], sy: parts[3] };
            }
          }
          const scaleMatch = s.match(/scale\(([-0-9.]+)(?:,\s*([-0-9.]+))?\)/);
          if (scaleMatch) {
            const sx = parseFloat(scaleMatch[1]);
            const sy = scaleMatch[2] ? parseFloat(scaleMatch[2]) : sx;
            return { sx, sy };
          }
        }
        cur = cur.parentElement;
      }
      return { sx: 1, sy: 1 };
    };

    const scale = getAncestorScale(container);
    const invScaleX = scale.sx ? 1 / scale.sx : 1;
    const invScaleY = scale.sy ? 1 / scale.sy : 1;

    const left =
      (nodeRect.left - containerRect.left) * invScaleX +
      (container.scrollLeft || 0);
    const top =
      (nodeRect.top - containerRect.top) * invScaleY +
      (container.scrollTop || 0);
    const width = nodeRect.width * invScaleX;
    const height = nodeRect.height * invScaleY;
    wrapper.style.left = `${left}px`;
    wrapper.style.top = `${top}px`;
    wrapper.style.width = `${Math.max(0, width)}px`;
    wrapper.style.height = `${Math.max(0, height)}px`;
    // append inside the container so it's visible in the container subtree in DevTools
    container.appendChild(wrapper);
    console.debug("Selector: appended wrapper", wrapper, "for node", node);
    wrapper.setAttribute("data-selected-element", node.id || "");
    wrapperRef.current = wrapper;
  };

  // expose simple API via ref on window for debugging (optional)
  useEffect(() => {
    (window as any).__selector__ = {
      getSelected: () => selectedEl,
      getProps: () => propsRef.current,
      getOverlay: () => overlayRef.current,
    };
  }, [selectedEl]);

  return null;
};

export default Selector;
