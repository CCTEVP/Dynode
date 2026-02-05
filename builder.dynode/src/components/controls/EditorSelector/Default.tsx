import React from "react";
import { useSelection } from "../../../contexts/SelectionContext";

const EditorSelector: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const { state } = useSelection();
  const [box, setBox] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  React.useEffect(() => {
    const sel = state.selected;
    if (!sel) {
      setBox(null);
      return;
    }

    try {
      let el: HTMLElement | null = null;
      if (sel.indexPath && Array.isArray(sel.indexPath)) {
        const idxStr = sel.indexPath.join("-");
        el = document.querySelector<HTMLElement>(
          `[data-index-path="${idxStr}"]`
        );
        if (!el) {
          const alt = Array.from(
            document.querySelectorAll<HTMLElement>("[data-index-path]")
          ).find(
            (n) => n.dataset.indexPath && n.dataset.indexPath.endsWith(idxStr)
          );
          if (alt) el = alt;
        }
      }
      if (!el && sel.uid) {
        el = document.querySelector<HTMLElement>(
          `[data-uid="${String(sel.uid)}"]`
        );
      }
      if (!el && sel.element) {
        const uid =
          (sel.element &&
            (sel.element.identifier ||
              sel.element._id?.$oid ||
              sel.element._id)) ||
          undefined;
        if (uid)
          el = document.querySelector<HTMLElement>(
            `[data-uid="${String(uid)}"]`
          );
      }

      if (!el) {
        setBox(null);
        return;
      }

      const r = el.getBoundingClientRect();
      const container =
        document.querySelector<HTMLElement>(".editor-container");
      if (!container) {
        setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
        return;
      }
      const cRect = container.getBoundingClientRect();
      const top = r.top - cRect.top + (container.scrollTop || 0);
      const left = r.left - cRect.left + (container.scrollLeft || 0);
      setBox({ top, left, width: r.width, height: r.height });
    } catch (e) {
      setBox(null);
    }
  }, [state.selected]);

  return (
    <div className="editor-selector" aria-hidden>
      {children}
      {box ? (
        <div
          className="selection-frame"
          style={{
            position: "absolute",
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
            border: "2px solid orange",
            boxSizing: "border-box",
            pointerEvents: "none",
            borderRadius: 4,
            zIndex: 3000,
          }}
        />
      ) : null}
    </div>
  );
};

export default EditorSelector;
