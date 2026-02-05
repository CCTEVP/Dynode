import React from "react";
import { useSelection } from "../../../contexts/SelectionContext";
import { useCreativeContext } from "../../../contexts/CreativeContext";

interface Props {
  selectedSceneIndex: number;
  setSelectedSceneIndex: (n: number) => void;
  selectedElementPath: string[] | null;
  selectedElement: any | null;
  setSelectedElementPath: (p: string[] | null) => void;
  setSelectedElement: (e: any | null) => void;
  setSelectedElementDraft: (d: any | null) => void;
}

const SyncSelectionToLocal: React.FC<Props> = ({
  selectedSceneIndex,
  setSelectedSceneIndex,
  selectedElementPath,
  selectedElement,
  setSelectedElementPath,
  setSelectedElement,
  setSelectedElementDraft,
}) => {
  const { creative } = useCreativeContext();
  const { state } = useSelection();
  const selKey = React.useMemo(() => {
    const s = state && (state as any).selected;
    if (!s) return "";
    if (Array.isArray(s.indexPath)) return `i:${s.indexPath.join(",")}`;
    if (s.uid) return `u:${String(s.uid)}`;
    if (s.element) {
      const el = s.element as any;
      const uid = el && (el.identifier || (el._id && (el._id.$oid || el._id)));
      if (uid) return `e:${String(uid)}`;
      try {
        return `j:${JSON.stringify(el)}`;
      } catch (e) {
        return `e:unknown`;
      }
    }
    return "";
  }, [state]);

  React.useEffect(() => {
    try {
      const sel = state.selected;
      if (!sel) {
        setSelectedElementPath(null);
        setSelectedElement(null);
        setSelectedElementDraft(null);
        return;
      }

      const sceneEl = (creative as any)?.elements?.[selectedSceneIndex];
      const rootKey = sceneEl ? Object.keys(sceneEl)[0] : undefined;
      const rootData = rootKey ? sceneEl[rootKey] : undefined;
      const rootSegment =
        (rootData && (rootData._id?.$oid || rootData.identifier)) ||
        rootKey ||
        String(selectedSceneIndex);

      let incomingPath: string[] | undefined;
      let element: any = sel.element || null;

      try {
        const selUid = sel && sel.uid ? String(sel.uid) : null;
        if (selUid && creative && Array.isArray((creative as any).elements)) {
          for (let si = 0; si < (creative as any).elements.length; si++) {
            const s = (creative as any).elements[si];
            const k = s ? Object.keys(s)[0] : null;
            const d = k ? s[k] : null;
            const ids: string[] = [];
            if (d) {
              if (d._id) ids.push(String(d._id.$oid || d._id));
              if (d.identifier) ids.push(String(d.identifier));
            }
            if (k) ids.push(String(k));
            if (ids.includes(selUid)) {
              incomingPath = [];
              element = element || s;
              try {
                setSelectedSceneIndex(si);
              } catch (e) {}
              break;
            }
          }
        }
      } catch (e) {}

      if (sel.indexPath && Array.isArray(sel.indexPath) && creative) {
        try {
          const rawIdxs: number[] = sel.indexPath.map((n: any) => Number(n));
          let idxs: number[] = rawIdxs.slice();
          try {
            const idxStr = idxs.join("-");
            const foundDom = document.querySelector(
              `[data-index-path="${idxStr}"]`
            ) as HTMLElement | null;
            if (!foundDom) {
              if (idxs.length > 1) {
                const withoutFirst = idxs.slice(1);
                const alt = document.querySelector(
                  `[data-index-path="${withoutFirst.join("-")}"]`
                ) as HTMLElement | null;
                if (alt) idxs = withoutFirst;
              }
              if (
                idxs.length &&
                creative &&
                Array.isArray((creative as any).elements)
              ) {
                const withScene = [selectedSceneIndex, ...idxs];
                const alt2 = document.querySelector(
                  `[data-index-path="${withScene.join("-")}"]`
                ) as HTMLElement | null;
                if (alt2) idxs = withScene;
              }
            }
          } catch {}

          let sceneIdx = selectedSceneIndex;
          if (idxs.length === 1) {
            try {
              const possibleSceneIdx = idxs[0];
              if (
                possibleSceneIdx !== undefined &&
                (creative as any).elements &&
                possibleSceneIdx >= 0 &&
                possibleSceneIdx < (creative as any).elements.length
              ) {
                const scene = (creative as any).elements[possibleSceneIdx];
                incomingPath = [];
                element = element || scene;
                sceneIdx = possibleSceneIdx;
              }
            } catch {}
          }
          if (idxs.length > 1) {
            if (
              idxs[0] !== undefined &&
              idxs[0] >= 0 &&
              idxs[0] < (creative as any).elements.length
            ) {
              sceneIdx = idxs[0];
            }
          }

          const scene = (creative as any).elements[sceneIdx];
          const sceneKey = scene ? Object.keys(scene)[0] : null;
          let currentContents = sceneKey ? scene[sceneKey]?.contents || [] : [];
          const parentPath: string[] = [];
          let foundElement: any = null;
          const offset = idxs[0] === sceneIdx ? 1 : 0;
          for (let i = offset; i < idxs.length; i++) {
            const id = idxs[i];
            if (
              !Array.isArray(currentContents) ||
              currentContents.length <= id
            ) {
              foundElement = null;
              break;
            }
            const node = currentContents[id];
            const key = Object.keys(node)[0];
            const payload = node[key];
            const seg =
              (payload && (payload._id?.$oid || payload.identifier)) ||
              key ||
              String(id);
            parentPath.push(seg);
            foundElement = node;
            currentContents =
              payload && payload.contents ? payload.contents : [];
          }
          if (foundElement) {
            incomingPath = parentPath;
            element = element || foundElement;
          }
        } catch (err) {
          // ignore
        }
      }

      if (!incomingPath && sel.uid && creative) {
        try {
          const uidStr = String(sel.uid);
          let target = document.querySelector(
            `[data-item-id="${uidStr}"]`
          ) as HTMLElement | null;
          if (!target)
            target =
              document.getElementById(`item-${uidStr}`) ||
              document.getElementById(uidStr);
          if (!target) {
            try {
              target = document.querySelector(
                `[id$="-${uidStr}"]`
              ) as HTMLElement | null;
            } catch (e) {
              target = null;
            }
          }
          if (target && target.dataset && target.dataset.indexPath) {
            const idxs = target.dataset.indexPath
              .split("-")
              .map((s) => Number(s));
            try {
              let sceneIdx = selectedSceneIndex;
              if (idxs.length > 1) {
                if (
                  idxs[0] !== undefined &&
                  idxs[0] >= 0 &&
                  idxs[0] < (creative as any).elements.length
                ) {
                  sceneIdx = idxs[0];
                }
              }
              const scene = (creative as any).elements[sceneIdx];
              const sceneKey = scene ? Object.keys(scene)[0] : null;
              let currentContents = sceneKey
                ? scene[sceneKey]?.contents || []
                : [];
              const parentPath: string[] = [];
              let foundElement: any = null;
              const offset = idxs[0] === sceneIdx ? 1 : 0;
              for (let i = offset; i < idxs.length; i++) {
                const id = idxs[i];
                if (
                  !Array.isArray(currentContents) ||
                  currentContents.length <= id
                ) {
                  foundElement = null;
                  break;
                }
                const node = currentContents[id];
                const key = Object.keys(node)[0];
                const payload = node[key];
                const seg =
                  (payload && (payload._id?.$oid || payload.identifier)) ||
                  key ||
                  String(id);
                parentPath.push(seg);
                foundElement = node;
                currentContents =
                  payload && payload.contents ? payload.contents : [];
              }
              if (foundElement) {
                incomingPath = parentPath;
                element = element || foundElement;
              }
            } catch (err) {}
          } else {
            const idVal = uidStr;
            const scene = (creative as any)?.elements?.[selectedSceneIndex];
            const sceneKey = scene ? Object.keys(scene)[0] : null;
            const rootContents = sceneKey ? scene[sceneKey]?.contents : [];
            const findInContents = (contents: any[]): any | null => {
              if (!Array.isArray(contents)) return null;
              for (const node of contents) {
                const k = Object.keys(node)[0];
                const payload = node[k];
                if (!payload) continue;
                const candidateId =
                  (payload._id && (payload._id.$oid || payload._id)) ||
                  payload.identifier ||
                  payload.id;
                if (candidateId && String(candidateId) === String(idVal)) {
                  return { path: [String(candidateId)], element: node };
                }
                if (payload.contents && Array.isArray(payload.contents)) {
                  const res = findInContents(payload.contents);
                  if (res)
                    return {
                      path: [String(candidateId), ...res.path],
                      element: res.element,
                    };
                }
              }
              return null;
            };
            const found = findInContents(rootContents || []);
            if (found) {
              incomingPath = found.path;
              element = element || found.element;
            }
          }
        } catch (err) {}
      }

      if (!incomingPath && sel.element) {
        const el = sel.element;
        if (el._id && (el._id.$oid || el._id))
          incomingPath = [String(el._id.$oid || el._id)];
        else if (el.identifier) incomingPath = [String(el.identifier)];
      }

      const fullPath = incomingPath
        ? incomingPath[0] === rootSegment
          ? incomingPath
          : [rootSegment, ...incomingPath]
        : [rootSegment];

      const pathChanged =
        !selectedElementPath ||
        selectedElementPath.length !== fullPath.length ||
        fullPath.some(
          (seg: any, i: number) =>
            String(seg) !== String(selectedElementPath?.[i])
        );
      if (pathChanged) setSelectedElementPath(fullPath);

      const getUid = (el: any) =>
        el && ((el._id && (el._id.$oid || el._id)) || el.identifier)
          ? String((el._id && (el._id.$oid || el._id)) || el.identifier)
          : null;
      const newUid = getUid(element || null);
      const curUid = getUid(selectedElement || null);
      if (newUid !== curUid) setSelectedElement(element || null);

      if (newUid !== curUid) {
        try {
          setSelectedElementDraft(
            element ? JSON.parse(JSON.stringify(element)) : null
          );
        } catch (err) {
          setSelectedElementDraft(element || null);
        }
      }
    } catch (err) {}
  }, [creative, selectedSceneIndex, selKey]);

  return null;
};

export default SyncSelectionToLocal;
