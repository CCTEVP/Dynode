import React, { useState } from "react";
import { useSelection } from "../../contexts/SelectionContext";
import {
  AppstoreOutlined,
  BorderOutlined,
  LayoutOutlined,
  PictureOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
  RightOutlined,
  DownOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

interface ElementListProps {
  elements: any[];
  onSelect?: (path: string[], el: any, indexPath?: number[]) => void;
  selectedPath?: string[] | null;
  selectedElement?: any | null;
}

const getComponentIcon = (c: string) => {
  const hint = (c || "").toLowerCase();
  if (hint.includes("slidelayout")) return <AppstoreOutlined />;
  if (hint.includes("boxlayout")) return <BorderOutlined />;
  if (hint.includes("layout")) return <LayoutOutlined />;
  if (hint.includes("imagewidget") || hint.includes("image"))
    return <PictureOutlined />;
  if (hint.includes("videowidget") || hint.includes("video"))
    return <VideoCameraOutlined />;
  if (hint.includes("textwidget") || hint.includes("text"))
    return <FileTextOutlined />;
  if (hint.includes("cardwidget") || hint.includes("card"))
    return <IdcardOutlined />;
  if (hint.includes("countdownwidget") || hint.includes("countdown"))
    return <ClockCircleOutlined />;
  return <AppstoreOutlined />;
};

const ElementRow: React.FC<{
  el: any;
  depth: number;
  index: number;
  indexPath: number[];
  onSelect?: (path: string[], el: any, indexPath?: number[]) => void;
  path: string[];
  selectedPath?: string[] | null;
  selectedElement?: any | null;
}> = ({
  el,
  depth,
  index,
  indexPath,
  onSelect,
  path,
  selectedPath,
  selectedElement,
}) => {
  const widgetType = Object.keys(el)[0];
  const data = el[widgetType];
  const labelText =
    data?.name || data?.identifier || widgetType || `item-${index}`;
  const label = `${labelText} (${widgetType})`;

  const hasChildren = Array.isArray(data?.contents) && data.contents.length > 0;
  const [visible, setVisible] = useState(true);
  const [locked, setLocked] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(true);

  const rowId = `item-${
    (data && (data._id?.$oid || data.identifier)) ||
    widgetType ||
    indexPath.join("-")
  }`;

  // determine if this row should be marked selected (exact or ancestor match)
  const isSelected = (() => {
    if (!selectedPath || !selectedPath.length) return false;
    const sel = selectedPath.join("/");
    const p = path.join("/");
    if (sel === p) return true;
    if (selectedPath.length >= path.length) {
      const head = selectedPath.slice(0, path.length).join("/");
      if (head === p) return true;
    }
    return false;
  })();

  // debug: log selection matching for troubleshooting
  try {
    console.debug("ElementRow:", { rowId, path, selectedPath, isSelected });
  } catch {
    // ignore
  }

  // If not matched by path, try matching by selectedElement id/identifier as a fallback
  const getWrapperId = (node: any) => {
    if (!node) return undefined;
    // node might be wrapper like { BoxLayout: { _id: { $oid: '...' }, identifier: 'days' } }
    if (typeof node === "object") {
      const keys = Object.keys(node || {});
      if (keys.length === 1) {
        const payload = node[keys[0]];
        if (!payload) return undefined;
        if (payload._id && (payload._id.$oid || payload._id))
          return String(payload._id.$oid || payload._id);
        if (payload.identifier) return String(payload.identifier);
      }
      // if node looks like a payload itself
      if (node._id && (node._id.$oid || node._id))
        return String(node._id.$oid || node._id);
      if (node.identifier) return String(node.identifier);
    }
    return undefined;
  };

  const selId = getWrapperId((selectedElement as any) || null);
  const rowIdVal =
    (data && (data._id?.$oid || data.identifier)) ||
    widgetType ||
    indexPath.join("-");
  const selectedById = selId ? String(selId) === String(rowIdVal) : false;

  const finalIsSelected = isSelected || selectedById;

  return (
    <div
      className={`layer-node ${hasChildren ? "has-children" : "no-children"}`}
    >
      <div
        id={rowId}
        className={`layer-row ${finalIsSelected ? "selected" : ""}`}
        data-depth={depth}
        data-icon={widgetType}
        data-selected={finalIsSelected ? "true" : undefined}
        style={{
          paddingLeft: depth * 25,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          background: finalIsSelected ? "rgba(98, 78, 255, 0.15)" : undefined,
          transition: "background 120ms ease-in-out",
        }}
        onClick={() => onSelect && onSelect(path, el, indexPath)}
      >
        {/* collapse placeholder / button (fixed 10px width) */}
        <div
          style={{
            width: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {hasChildren ? (
            <button
              className="collapse-toggle"
              aria-label={expanded ? "collapse" : "expand"}
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((s) => !s);
              }}
            >
              {expanded ? (
                <DownOutlined style={{ fontSize: 12 }} />
              ) : (
                <RightOutlined style={{ fontSize: 12 }} />
              )}
            </button>
          ) : (
            <span className="collapse-placeholder" />
          )}
        </div>

        {/* icon (15px width) */}
        <div
          style={{ width: 15, marginLeft: 6, marginRight: 8 }}
          className="layer-icon"
        >
          {getComponentIcon(widgetType)}
        </div>

        {/* label */}
        <div
          className="layer-label"
          title={label}
          style={{
            flex: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>

        {/* actions: eye, lock */}
        <div
          className="layer-actions"
          style={{
            display: "flex",
            gap: 6,
            marginLeft: 8,
            alignItems: "center",
          }}
        >
          <button
            aria-label={visible ? "hide" : "show"}
            onClick={() => setVisible((v) => !v)}
            className="action-btn"
          >
            {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
          </button>
          <button
            aria-label={locked ? "unlock" : "lock"}
            onClick={() => setLocked((s) => !s)}
            className="action-btn"
          >
            {locked ? <LockOutlined /> : <UnlockOutlined />}
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="layer-children">
          {data.contents.map((c: any, i: number) => {
            const childWidget = Object.keys(c)[0];
            const childData = c[childWidget];
            const childSegment =
              (childData && (childData._id?.$oid || childData.identifier)) ||
              childWidget ||
              `${i}`;
            return (
              <ElementRow
                key={i}
                el={c}
                depth={depth + 1}
                index={i}
                indexPath={[...indexPath, i]}
                onSelect={onSelect}
                path={[...path, childSegment]}
                selectedPath={selectedPath}
                selectedElement={selectedElement}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

const ElementList: React.FC<ElementListProps> = ({
  elements,
  onSelect,
  selectedPath,
  selectedElement,
}) => {
  // prefer context selection when available
  let ctxSelectedPath: string[] | null | undefined = undefined;
  let ctxSelectedElement: any | null | undefined = undefined;
  try {
    const ctx = useSelection();
    if (ctx && ctx.state && ctx.state.selected) {
      ctxSelectedElement = ctx.state.selected.element || null;
      if (
        ctx.state.selected.indexPath &&
        Array.isArray(ctx.state.selected.indexPath) &&
        Array.isArray(elements)
      ) {
        try {
          const idxs: number[] = ctx.state.selected.indexPath.map((n: any) =>
            Number(n)
          );
          let sceneIdx = idxs.length ? idxs[0] : 0;
          if (sceneIdx < 0 || sceneIdx >= elements.length) sceneIdx = 0;
          const scene = elements[sceneIdx];
          const rootWidget = Object.keys(scene)[0];
          const rootData = scene[rootWidget];
          const rootSegment =
            (rootData && (rootData._id?.$oid || rootData.identifier)) ||
            rootWidget ||
            String(sceneIdx);

          let currentContents = rootData ? rootData.contents || [] : [];
          const parentPath: string[] = [rootSegment];
          const offset = idxs[0] === sceneIdx ? 1 : 0;
          let valid = true;
          for (let i = offset; i < idxs.length; i++) {
            const id = idxs[i];
            if (
              !Array.isArray(currentContents) ||
              currentContents.length <= id
            ) {
              valid = false;
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
            currentContents =
              payload && payload.contents ? payload.contents : [];
          }
          if (valid) ctxSelectedPath = parentPath;
        } catch (err) {
          ctxSelectedPath = undefined;
        }
      } else if (ctx.state.selected.uid) {
        // uid-based selection cannot produce a path here — we'll rely on selectedElement matching
        ctxSelectedPath = undefined;
      }
    }
  } catch (e) {
    // ignore if context not present
  }

  const effectiveSelectedPath =
    ctxSelectedPath !== undefined ? ctxSelectedPath : selectedPath;
  const effectiveSelectedElement =
    ctxSelectedElement !== undefined ? ctxSelectedElement : selectedElement;
  if (!Array.isArray(elements) || elements.length === 0) {
    return <div style={{ color: "rgba(255,255,255,0.6)" }}>No elements</div>;
  }

  return (
    <div>
      {elements.map((el, i) => {
        const rootWidget = Object.keys(el)[0];
        const rootData = el[rootWidget];
        const rootSegment =
          (rootData && (rootData._id?.$oid || rootData.identifier)) ||
          rootWidget ||
          String(i);
        return (
          <ElementRow
            key={i}
            el={el}
            depth={0}
            index={i}
            indexPath={[i]}
            onSelect={onSelect}
            path={[rootSegment]}
            selectedPath={effectiveSelectedPath}
            selectedElement={effectiveSelectedElement}
          />
        );
      })}
    </div>
  );
};

export default ElementList;
