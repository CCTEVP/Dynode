import React from "react";
import type { Creative } from "../../types/creative";
import normalizeStyleObject from "./utils/styleUtils";

import { SlideLayout, BoxLayout } from "./layouts";
import {
  CardWidget,
  TextWidget,
  ImageWidget,
  VideoWidget,
  CountdownWidget,
} from "./widgets";

interface CreativeRendererProps {
  creative: Creative;
  onMove?: (widgetId: string, destLayoutId: string) => void;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}

// Recursively render a node (layout or widget). The creative JSON uses wrapper objects
// like { "SlideLayout": { ... } } so we need to find the single key and use its value.
const getNode = (element: any) => {
  if (!element) return null;
  const keys = Object.keys(element);
  if (keys.length === 0) return null;
  const key = keys[0];
  return { typeKey: key, payload: element[key] };
};

const renderContents = (
  contents: any[],
  creative: Creative,
  handlers?: {
    onMove?: (w: string, d: string) => void;
    onSelect?: (id: string) => void;
    selectedId?: string | null;
  }
) => {
  if (!Array.isArray(contents)) return null;
  return contents.map((child, index) => {
    const node = getNode(child);
    if (!node) return null;

    const { typeKey, payload } = node;

    // compute DOM id used by BaseWidget/BaseLayout (normalized-type-<idVal>)
    let domId: string | undefined = undefined;
    if (payload) {
      const normalizedType = String(payload.type)
        .replace(/([A-Z])/g, "-$1")
        .toLowerCase()
        .replace(/^-/g, "");
      const rawId = (payload as any)?._id;
      const idVal =
        rawId && typeof rawId === "object" && rawId.$oid
          ? rawId.$oid
          : typeof rawId === "string"
          ? rawId
          : payload.identifier || "unknown";
      domId = `${normalizedType}-${idVal}`;
    }

    // Layouts
    if (typeKey === "SlideLayout") {
      const key = payload?._id?.$oid ?? payload?.identifier ?? `slide-${index}`;
      return (
        <SlideLayout
          key={key}
          layout={payload}
          additionalProps={
            {
              onDragOver: (e: React.DragEvent) => e.preventDefault(),
              onDrop: (e: React.DragEvent) => {
                const id = e.dataTransfer.getData("text/plain");
                if (id && handlers?.onMove)
                  handlers.onMove(id, payload._id.$oid);
              },
            } as any
          }
        >
          {renderContents(payload.contents, creative, handlers)}
        </SlideLayout>
      );
    }

    if (typeKey === "BoxLayout") {
      const key = payload?._id?.$oid ?? payload?.identifier ?? `box-${index}`;
      return (
        <BoxLayout
          key={key}
          layout={payload}
          additionalProps={
            {
              onDragOver: (e: React.DragEvent) => e.preventDefault(),
              onDrop: (e: React.DragEvent) => {
                const id = e.dataTransfer.getData("text/plain");
                if (id && handlers?.onMove)
                  handlers.onMove(id, payload._id.$oid);
              },
            } as any
          }
        >
          {renderContents(payload.contents, creative, handlers)}
        </BoxLayout>
      );
    }

    if (typeKey === "GridLayout") {
      // Reuse BoxLayout for now if GridLayout component not implemented
      const key = payload?._id?.$oid ?? payload?.identifier ?? `grid-${index}`;
      return (
        <BoxLayout key={key} layout={payload}>
          {renderContents(payload.contents, creative)}
        </BoxLayout>
      );
    }

    // Widgets
    if (typeKey === "CardWidget") {
      const key = payload?._id?.$oid ?? payload?.identifier ?? `card-${index}`;
      return (
        <CardWidget
          key={key}
          widget={payload}
          additionalProps={
            {
              draggable: true,
              onDragStart: (e: React.DragEvent) => {
                const id = payload._id.$oid;
                e.dataTransfer.setData("text/plain", id);
                // add dragging class
                const target = e.currentTarget as HTMLElement;
                target.classList.add("dragging");
                try {
                  // create drag image from element snapshot
                  const clone = target.cloneNode(true) as HTMLElement;
                  clone.style.position = "absolute";
                  clone.style.top = "-9999px";
                  clone.style.left = "-9999px";
                  document.body.appendChild(clone);
                  e.dataTransfer.setDragImage(
                    clone,
                    clone.offsetWidth / 2,
                    clone.offsetHeight / 2
                  );
                  setTimeout(() => document.body.removeChild(clone), 0);
                } catch (err) {
                  /* ignore */
                }
              },
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                if (domId) handlers?.onSelect?.(domId);
              },
              onDoubleClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                // find first descendant element with an id inside this widget and select it
                const el = e.currentTarget as HTMLElement;
                const child = el.querySelector("[id]");
                if (child && child.id) handlers?.onSelect?.(child.id);
              },
              "data-selected":
                handlers?.selectedId === domId ? "true" : undefined,
              onDragEnd: (e: React.DragEvent) => {
                const target = e.currentTarget as HTMLElement;
                target.classList.remove("dragging");
              },
            } as any
          }
        />
      );
    }

    if (typeKey === "TextWidget") {
      const key = payload?._id?.$oid ?? payload?.identifier ?? `text-${index}`;
      return (
        <TextWidget
          key={key}
          widget={payload}
          additionalProps={
            {
              draggable: true,
              onDragStart: (e: React.DragEvent) => {
                const id = payload._id.$oid;
                e.dataTransfer.setData("text/plain", id);
                const target = e.currentTarget as HTMLElement;
                target.classList.add("dragging");
                try {
                  const clone = target.cloneNode(true) as HTMLElement;
                  clone.style.position = "absolute";
                  clone.style.top = "-9999px";
                  clone.style.left = "-9999px";
                  document.body.appendChild(clone);
                  e.dataTransfer.setDragImage(
                    clone,
                    clone.offsetWidth / 2,
                    clone.offsetHeight / 2
                  );
                  setTimeout(() => document.body.removeChild(clone), 0);
                } catch (err) {}
              },
              onDragEnd: (e: React.DragEvent) => {
                const target = e.currentTarget as HTMLElement;
                target.classList.remove("dragging");
              },
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                if (domId) handlers?.onSelect?.(domId);
              },
              onDoubleClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                const el = e.currentTarget as HTMLElement;
                const child = el.querySelector("[id]");
                if (child && child.id) handlers?.onSelect?.(child.id);
              },
              "data-selected":
                handlers?.selectedId === domId ? "true" : undefined,
            } as any
          }
        />
      );
    }

    if (typeKey === "ImageWidget") {
      const key = payload?._id?.$oid ?? payload?.identifier ?? `img-${index}`;
      return (
        <ImageWidget
          key={key}
          widget={payload}
          creative={creative}
          additionalProps={
            {
              draggable: true,
              onDragStart: (e: React.DragEvent) => {
                const id = payload._id.$oid;
                e.dataTransfer.setData("text/plain", id);
                const target = e.currentTarget as HTMLElement;
                target.classList.add("dragging");
                try {
                  const clone = target.cloneNode(true) as HTMLElement;
                  clone.style.position = "absolute";
                  clone.style.top = "-9999px";
                  clone.style.left = "-9999px";
                  document.body.appendChild(clone);
                  e.dataTransfer.setDragImage(
                    clone,
                    clone.offsetWidth / 2,
                    clone.offsetHeight / 2
                  );
                  setTimeout(() => document.body.removeChild(clone), 0);
                } catch (err) {}
              },
              onDragEnd: (e: React.DragEvent) => {
                const target = e.currentTarget as HTMLElement;
                target.classList.remove("dragging");
              },
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                if (domId) handlers?.onSelect?.(domId);
              },
              onDoubleClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                const el = e.currentTarget as HTMLElement;
                const child = el.querySelector("[id]");
                if (child && child.id) handlers?.onSelect?.(child.id);
              },
              "data-selected":
                handlers?.selectedId === domId ? "true" : undefined,
            } as any
          }
        />
      );
    }

    if (typeKey === "VideoWidget") {
      const key = payload?._id?.$oid ?? payload?.identifier ?? `video-${index}`;
      return (
        <VideoWidget
          key={key}
          widget={payload}
          creative={creative}
          additionalProps={
            {
              draggable: true,
              onDragStart: (e: React.DragEvent) =>
                e.dataTransfer.setData("text/plain", payload._id.$oid),
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                if (domId) handlers?.onSelect?.(domId);
              },
              onDoubleClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                const el = e.currentTarget as HTMLElement;
                const child = el.querySelector("[id]");
                if (child && child.id) handlers?.onSelect?.(child.id);
              },
              "data-selected":
                handlers?.selectedId === domId ? "true" : undefined,
            } as any
          }
        />
      );
    }

    if (typeKey === "CountdownWidget") {
      const key =
        payload?._id?.$oid ?? payload?.identifier ?? `countdown-${index}`;
      const parentId =
        domId ?? payload?._id?.$oid ?? payload?.identifier ?? key;
      // Override onSelect for children so clicking inside the countdown selects the parent widget
      const childHandlers = handlers
        ? {
            ...handlers,
            onSelect: (_childId?: string) => {
              handlers.onSelect?.(parentId);
            },
          }
        : handlers;

      return (
        <CountdownWidget
          key={key}
          widget={payload}
          additionalProps={
            {
              // ensure clicks anywhere inside the countdown select the parent widget
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                handlers?.onSelect?.(parentId);
              },
              // prevent children from being clickable/selectable separately
              onMouseDown: (e: React.MouseEvent) => {
                e.stopPropagation();
              },
              "data-selected":
                handlers?.selectedId === domId ? "true" : undefined,
            } as any
          }
        >
          {renderContents(payload.contents, creative, childHandlers)}
        </CountdownWidget>
      );
    }

    // Unknown node — render nothing
    return null;
  });
};

export const CreativeRenderer: React.FC<CreativeRendererProps> = ({
  creative,
  onMove,
  onSelect,
  selectedId,
}) => {
  if (!creative) return null;

  const mainStyle = (normalizeStyleObject(
    creative.styles as any
  ) as React.CSSProperties) || {
    width: "1080px",
    height: "1920px",
    position: "relative",
  };

  return (
    <main id="app" role="main" style={mainStyle}>
      <div id="dynamic-creative-container" style={mainStyle}>
        {renderContents(creative.elements, creative, {
          onMove,
          onSelect,
          selectedId,
        })}
      </div>
    </main>
  );
};

export default CreativeRenderer;
