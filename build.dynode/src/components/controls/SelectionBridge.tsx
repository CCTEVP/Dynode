import React from "react";
import { useSelection } from "../../contexts/SelectionContext";

const SelectionBridge: React.FC = () => {
  const { selectByIndexPath, selectByUid } = useSelection();
  React.useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail || {};
        console.debug("SelectionBridge: received event detail", detail);
        if (!detail) return;
        if (detail.indexPath && Array.isArray(detail.indexPath)) {
          let idxs = detail.indexPath.map((n: any) => Number(n));
          try {
            const idxStr = idxs.join("-");
            const dom = document.querySelector(
              `[data-index-path="${idxStr}"]`
            ) as HTMLElement | null;
            if (!dom) {
              const alt = Array.from(
                document.querySelectorAll<HTMLElement>("[data-index-path]")
              ).find(
                (n) =>
                  n.dataset.indexPath && n.dataset.indexPath.endsWith(idxStr)
              );
              if (alt && alt.dataset.indexPath) {
                idxs = alt.dataset.indexPath.split("-").map((s) => Number(s));
              }
            } else if (dom.dataset && dom.dataset.indexPath) {
              idxs = String(dom.dataset.indexPath)
                .split("-")
                .map((s) => Number(s));
            }
          } catch (err) {
            // ignore DOM lookup errors
          }
          selectByIndexPath(idxs, {
            source: "selector",
            element: detail.element,
          });
          return;
        }

        if (detail.id) {
          try {
            const rawId = String(detail.id);
            let node = document.getElementById(rawId) as HTMLElement | null;
            if (!node)
              node = document.querySelector(
                `[data-item-id="${rawId}"]`
              ) as HTMLElement | null;
            if (!node) node = document.getElementById(`item-${rawId}`);

            let uid = rawId;
            if (node) {
              const did = node.dataset && node.dataset.itemId;
              if (did) uid = String(did);
              else if (node.id) {
                const parts = node.id.split("-");
                uid = parts[parts.length - 1] || uid;
              }
            } else {
              const parts = rawId.split("-");
              if (parts.length > 1) uid = parts[parts.length - 1];
            }

            selectByUid(String(uid), {
              source: "selector",
              element: detail.element,
            });
          } catch (e) {
            const domId = String(detail.id);
            const idVal = domId.split("-").pop() || domId;
            selectByUid(String(idVal), {
              source: "selector",
              element: detail.element,
            });
          }
          return;
        }

        if (detail.element) {
          const el = detail.element;
          const uid =
            (el && (el.identifier || (el._id && (el._id.$oid || el._id)))) ||
            undefined;
          if (uid)
            selectByUid(String(uid), { source: "selector", element: el });
        }
      } catch (e) {}
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
  }, [selectByIndexPath, selectByUid]);
  return null;
};

export default SelectionBridge;
