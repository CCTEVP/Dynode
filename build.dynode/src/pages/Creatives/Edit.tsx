import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Alert, Button, Space } from "antd";
import { CreativeRenderer } from "../../components/creative/CreativeRenderer.tsx";
import CreativeCanvas from "../../components/creative/CreativeCanvas.tsx";
import Selector from "../../components/creative/Selector.tsx";
import creativeService from "../../services/creative.ts";
import type { Creative } from "../../types/creative.ts";
import "./Edit.css";

const Edit: React.FC = () => {
  const { creativeId } = useParams<{ creativeId: string }>();
  const navigate = useNavigate();

  const [creative, setCreative] = useState<Creative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedProps, setSelectedProps] = useState<any | null>(null);

  useEffect(() => {
    const hudRight = document.querySelector(
      ".creative-canvas-hud .hud-right"
    ) as HTMLElement | null;
    if (!hudRight) return;
    const rightPanel = hudRight.querySelector(
      ".panel.right-properties"
    ) as HTMLElement | null;
    if (!rightPanel) return;
    const propsContainer = rightPanel.querySelector(
      ".properties-container"
    ) as HTMLElement | null;
    if (!propsContainer) return;
    if (!selectedProps) {
      propsContainer.textContent = "Select an element to see properties";
      return;
    }
    // populate inputs
    propsContainer.innerHTML = "";
    const addRow = (label: string, value: string) => {
      const row = document.createElement("div");
      row.style.marginBottom = "8px";
      const lab = document.createElement("div");
      lab.textContent = label;
      lab.style.fontSize = "12px";
      lab.style.opacity = "0.7";
      const input = document.createElement("input");
      input.value = value || "";
      input.style.width = "100%";
      row.appendChild(lab);
      row.appendChild(input);
      propsContainer.appendChild(row);
    };
    addRow("id", selectedProps.id || "");
    addRow("tag", selectedProps.tagName || "");
    addRow("class", selectedProps.className || "");
    addRow("inlineStyle", selectedProps.inlineStyle || "");
  }, [selectedProps]);

  // listen to global selection events from Selector
  useEffect(() => {
    const handler = (ev: Event) => {
      const e = ev as CustomEvent;
      setSelectedProps(e.detail || null);
    };
    window.addEventListener("creative:selection", handler as EventListener);
    return () =>
      window.removeEventListener(
        "creative:selection",
        handler as EventListener
      );
  }, []);

  const loadCreative = async () => {
    if (!creativeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await creativeService.getCreative(creativeId);
      setCreative(response);
    } catch (err) {
      console.error("Failed to load creative:", err);
      setError(
        "Failed to load creative. Please check if the creative ID is valid."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load creative when component mounts or when the route param changes
  useEffect(() => {
    // fire-and-forget: loadCreative handles its own errors and sets loading state
    if (creativeId) {
      loadCreative();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creativeId]);

  const handleSave = async () => {
    if (!creative) return;

    setSaving(true);
    try {
      await creativeService.updateCreative(creative._id.$oid, creative);
      // Could show success message here
    } catch (err) {
      console.error("Failed to save creative:", err);
      setError("Failed to save creative. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToCreatives = () => {
    navigate("/creatives");
  };

  // Helper: find and remove node (widget) from elements tree, returning the node and new elements
  const removeNodeById = (
    elements: any[],
    id: string
  ): { node: any | null; elements: any[] } => {
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const key = Object.keys(el)[0];
      const payload = el[key];
      if (!payload) continue;
      if (payload._id?.$oid === id) {
        const node = el;
        const newElements = [...elements.slice(0, i), ...elements.slice(i + 1)];
        return { node, elements: newElements };
      }
      // If layout, search children
      if (payload.contents && Array.isArray(payload.contents)) {
        const result = removeNodeById(payload.contents, id);
        if (result.node) {
          // replace contents with updated children
          const newPayload = { ...payload, contents: result.elements };
          const newEl = { [key]: newPayload };
          const newElements = [
            ...elements.slice(0, i),
            newEl,
            ...elements.slice(i + 1),
          ];
          return { node: result.node, elements: newElements };
        }
      }
    }
    return { node: null, elements };
  };

  // Helper: insert node into layout with given id (append to contents)
  const insertNodeIntoLayout = (
    elements: any[],
    layoutId: string,
    node: any
  ): any[] => {
    return elements.map((el) => {
      const key = Object.keys(el)[0];
      const payload = el[key];
      if (!payload) return el;
      if (payload._id?.$oid === layoutId) {
        const newContents = Array.isArray(payload.contents)
          ? [...payload.contents, node]
          : [node];
        const newPayload = { ...payload, contents: newContents };
        return { [key]: newPayload };
      }
      if (payload.contents && Array.isArray(payload.contents)) {
        return {
          [key]: {
            ...payload,
            contents: insertNodeIntoLayout(payload.contents, layoutId, node),
          },
        };
      }
      return el;
    });
  };

  const handleMove = (widgetId: string, destLayoutId: string) => {
    if (!creative) return;
    // Clone current elements
    const elementsCopy = JSON.parse(JSON.stringify(creative.elements || []));
    const { node, elements: removed } = removeNodeById(elementsCopy, widgetId);
    if (!node) return;
    const inserted = insertNodeIntoLayout(removed, destLayoutId, node);
    const newCreative = { ...creative, elements: inserted } as Creative;
    setCreative(newCreative);
  };

  // Layer tree with search, 20px indent and collapsible children
  const [treeSearch] = useState<string>("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getNodeId = (payload: any, idx: number) => {
    const rawId = payload?._id;
    const idVal =
      rawId && typeof rawId === "object" && rawId.$oid
        ? rawId.$oid
        : typeof rawId === "string"
        ? rawId
        : payload?.identifier || `unknown-${idx}`;
    const typeName = payload.type || "Unknown";
    const normalizedType = String(typeName)
      .replace(/([A-Z])/g, "-$1")
      .toLowerCase()
      .replace(/^-/g, "");
    return `${normalizedType}-${idVal}`;
  };

  const toggleExpand = (id: string) => {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  };

  const matchesSearch = (payload: any, term: string) => {
    if (!term) return true;
    const t = term.toLowerCase();
    const name = String(payload?.name || payload?.type || "").toLowerCase();
    return name.includes(t);
  };

  const nodeHasMatch = (payload: any, term: string): boolean => {
    if (!term) return true;
    if (matchesSearch(payload, term)) return true;
    if (payload && Array.isArray(payload.contents)) {
      return payload.contents.some((c: any) => nodeHasMatch(c, term));
    }
    return false;
  };

  const renderNode = (
    el: any,
    idx: number,
    depth = 0,
    isLast = false
  ): React.ReactNode => {
    const key = Object.keys(el)[0];
    const payload = el[key] || {};
    const typeName = payload.type || key || "Unknown";
    const id = getNodeId(payload, idx);
    // Support multiple possible child array properties (contents, slides, elements, children)
    const childProps = ["contents", "slides", "elements", "children"];
    let childrenArray: any[] = [];
    for (const p of childProps) {
      if (payload && Array.isArray(payload[p])) {
        childrenArray = payload[p];
        break;
      }
    }
    const hasChildren = childrenArray && childrenArray.length > 0;
    // Default to expanded for all nodes so the full hierarchy is visible by default
    const isExpanded = expanded[id] !== undefined ? !!expanded[id] : true;
    if (!nodeHasMatch(payload, treeSearch)) return null;

    const isSelected =
      selectedId === (payload?._id?.$oid || payload?.identifier || id);

    // small SVG connector component: draws T or L shapes for child rows
    const ConnectorSVG: React.FC<{
      isChild: boolean;
      isLast: boolean;
      hasChildren: boolean;
    }> = ({ isChild, isLast, hasChildren }) => {
      const stroke = "rgba(255,255,255,0.06)";
      const w = 20;
      const h = 28;
      // if not a child (depth 0) or parent (hasChildren), render an empty spacer
      if (!isChild || hasChildren) {
        return <span style={{ width: w, display: "inline-block" }} />;
      }
      // coordinates: center x = 10, vertical from yTop to yBottom
      const cx = 10;
      const yTop = 6;
      const yCenter = Math.round(h / 2);
      const yBottom = h - 6;
      if (isLast) {
        // L: vertical from yTop to yCenter, then horizontal from cx to w
        return (
          <svg
            width={w}
            height={h}
            viewBox={`0 0 ${w} ${h}`}
            style={{ display: "inline-block", verticalAlign: "middle" }}
            aria-hidden
          >
            <line
              x1={cx}
              y1={yTop}
              x2={cx}
              y2={yCenter}
              stroke={stroke}
              strokeWidth={1}
            />
            <line
              x1={cx}
              y1={yCenter}
              x2={w}
              y2={yCenter}
              stroke={stroke}
              strokeWidth={1}
            />
          </svg>
        );
      }
      // T: vertical short segment and horizontal arm at center
      return (
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ display: "inline-block", verticalAlign: "middle" }}
          aria-hidden
        >
          <line
            x1={cx}
            y1={yTop}
            x2={cx}
            y2={yBottom}
            stroke={stroke}
            strokeWidth={1}
          />
          <line
            x1={cx}
            y1={yCenter}
            x2={w}
            y2={yCenter}
            stroke={stroke}
            strokeWidth={1}
          />
        </svg>
      );
    };

    return (
      <div
        className={`layer-node ${isLast ? "is-last" : ""} ${
          hasChildren ? "has-children" : "no-children"
        }`}
        key={id}
        // expose depth as a CSS variable so CSS can compute consistent indentation
        style={{ ["--depth" as any]: depth }}
        data-is-last={isLast ? "true" : undefined}
      >
        {/* determine simple icon type for styling (layout/widget/shape/unknown) */}
        <div
          className={`layer-row ${isSelected ? "selected" : ""}`}
          data-layer-id={payload?._id?.$oid || payload?.identifier || id}
          data-depth={depth}
          data-collapsible={hasChildren ? "true" : "false"}
          data-last={isLast ? "true" : "false"}
          data-icon={((): string => {
            const t = String(payload?.type || "").toLowerCase();
            if (!t) return "unknown";
            if (t.includes("layout")) return "layout";
            if (t.includes("widget")) return "widget";
            if (
              t.includes("ellipse") ||
              t.includes("rect") ||
              t.includes("rectangle")
            )
              return "shape";
            return "unknown";
          })()}
        >
          <div className="left-controls">
            {hasChildren ? (
              <button
                className="collapse-toggle"
                onClick={() => toggleExpand(id)}
                aria-label={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? "▾" : "▸"}
              </button>
            ) : (
              <span className="collapse-placeholder" />
            )}

            {/* show connector only for child rows that are not parents; never render both arrow and connector */}
            {!hasChildren && depth > 0 ? (
              <span className="connector">
                <ConnectorSVG
                  isChild={true}
                  isLast={isLast}
                  hasChildren={false}
                />
              </span>
            ) : (
              <span className="connector-spacer" />
            )}
          </div>

          <div
            className="layer-label"
            style={{ cursor: "pointer", fontSize: 13 }}
            onClick={() => {
              const target = document.getElementById(id);
              if (target)
                target.dispatchEvent(
                  new MouseEvent("click", { bubbles: true })
                );
            }}
          >
            {typeName}
            {payload?.name ? ` — ${payload.name}` : ""}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="layer-children">
            {childrenArray.map((c: any, i: number) =>
              renderNode(c, i, depth + 1, i === childrenArray.length - 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderElementTree = (elements: any[] = []) =>
    elements.map((el: any, idx: number) =>
      renderNode(el, idx, 0, idx === elements.length - 1)
    );

  if (loading) {
    return (
      <div className="edit-loading">
        <Spin size="large" />
        <p>Loading creative...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-error">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Space direction="vertical">
              <Button size="small" onClick={loadCreative}>
                Retry
              </Button>
              <Button size="small" onClick={handleBackToCreatives}>
                Back to Creatives
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  if (!creative) {
    return (
      <div className="edit-error">
        <Alert
          message="Creative not found"
          description="The requested creative could not be found."
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={handleBackToCreatives}>
              Back to Creatives
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div
      className="edit-container"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
      }}
    >
      {/* Header moved into HUD panels (left/top and right/top). */}

      <div
        className={`edit-content ${
          isPreviewMode ? "preview-mode" : "edit-mode"
        }`}
        style={{ flex: 1, minHeight: 0 }}
      >
        {creative && (
          <CreativeCanvas
            leftPanel={
              <div className="panel left-elements">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <button onClick={handleBackToCreatives}>←</button>
                  <div style={{ fontWeight: 600 }}>{creative.name}</div>
                  <button title="Open menu">☰</button>
                </div>
                <div
                  className="element-list"
                  style={{ maxHeight: 480, overflow: "auto" }}
                >
                  {renderElementTree(creative.elements || [])}
                </div>
              </div>
            }
            rightPanel={
              <div className="panel right-properties">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#f3c665",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    E
                  </div>
                  <button
                    onClick={() => {
                      const step = document.querySelector(
                        ".zoom-stepper"
                      ) as HTMLElement | null;
                      if (step)
                        step.style.display =
                          step.style.display === "none" ? "block" : "none";
                    }}
                  >
                    100%
                  </button>
                  <button onClick={() => setIsPreviewMode((s) => !s)}>
                    {isPreviewMode ? "Exit Preview" : "Preview"}
                  </button>
                  <button onClick={() => handleSave()}>Save</button>
                </div>
                <div
                  className="zoom-stepper"
                  style={{ display: "none", marginTop: 8 }}
                >
                  <button
                    onClick={() =>
                      (
                        document.querySelector(
                          '.hud-center-icons button[aria-label="Zoom out"]'
                        ) as HTMLElement | null
                      )?.click()
                    }
                  >
                    -
                  </button>
                  <span style={{ margin: "0 8px" }}>{"100%"}</span>
                  <button
                    onClick={() =>
                      (
                        document.querySelector(
                          '.hud-center-icons button[aria-label="Zoom in"]'
                        ) as HTMLElement | null
                      )?.click()
                    }
                  >
                    +
                  </button>
                </div>
                <div className="properties-container" style={{ marginTop: 12 }}>
                  Select an element to see properties
                </div>
              </div>
            }
          >
            <CreativeRenderer creative={creative} onMove={handleMove} />
            <Selector
              containerId="dynamic-creative-container"
              onSelectionChange={(_el, props) => {
                setSelectedId(props?.id ?? null);
              }}
            />
          </CreativeCanvas>
        )}
      </div>
    </div>
  );
};

export default Edit;
