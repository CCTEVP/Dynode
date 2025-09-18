import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Alert, Button, Space } from "antd";
import {
  SelectOutlined,
  LayoutOutlined,
  AppstoreOutlined,
  BorderOutlined,
  SnippetsOutlined,
  CaretDownFilled,
  PictureOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  IdcardOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { CreativeRenderer } from "../../components/editor/CreativeRenderer";
import CreativeCanvas from "../../components/editor/CreativeCanvas";
import Panel from "../../components/controls/Panel/Default";
import Selector from "../../components/editor/Selector";
import creativeService from "../../services/creative";
import type { Creative } from "../../types/creative";
import ElementList from "../../components/editor/ElementList";
import "./Edit.css";
import {
  SelectionProvider,
  useSelection,
} from "../../contexts/SelectionContext";

const Edit: React.FC = () => {
  const { creativeId } = useParams<{ creativeId: string }>();
  const navigate = useNavigate();

  const [creative, setCreative] = useState<Creative | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setSaving] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [toolComponents, setToolComponents] = useState<any[] | null>(null);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [selectedElementPath, setSelectedElementPath] = useState<
    string[] | null
  >(null);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [selectedElementDraft, setSelectedElementDraft] = useState<any | null>(
    null
  );
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<any | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<any | null>(null);
  const [showZoomStepper, setShowZoomStepper] = useState(false);
  const [activeTool, setActiveTool] = useState<string>("select");
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // keep draft in sync when selection changes
    if (selectedElement) {
      try {
        setSelectedElementDraft(JSON.parse(JSON.stringify(selectedElement)));
      } catch (e) {
        setSelectedElementDraft(selectedElement);
      }
    } else {
      setSelectedElementDraft(null);
    }
  }, [selectedElement]);

  const updateDraftField = (field: string, value: any) => {
    if (!selectedElementDraft) return;
    const newDraft = JSON.parse(JSON.stringify(selectedElementDraft));
    const k = Object.keys(newDraft)[0];
    if (!k) return;
    const data = newDraft[k] || {};
    data[field] = value;
    newDraft[k] = data;
    setSelectedElementDraft(newDraft);
    setSelectedElement(newDraft);
  };

  useEffect(() => {
    const load = async () => {
      if (!creativeId) return;
      setLoading(true);
      try {
        const resp = await creativeService.getCreative(creativeId);
        setCreative(resp);
      } catch (e) {
        setError("Failed to load creative");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [creativeId]);

  const reloadToolComponents = async () => {
    setToolComponents(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      let res: Response | null = null;
      try {
        res = await fetch("http://localhost:3000/data/components", {
          signal: controller.signal,
        });
      } catch {}
      if (!res || !res.ok)
        res = await fetch("/data/components", { signal: controller.signal });
      if (!res || !res.ok) throw new Error("fetch failed");
      const json = await res.json();
      setToolComponents(Array.isArray(json) ? json : []);
    } catch (err: any) {
      setToolComponents([]);
    } finally {
      clearTimeout(timeout);
    }
  };
  useEffect(() => {
    reloadToolComponents();
  }, []);

  // Close any open group when the Select tool is activated
  useEffect(() => {
    const onToolChange = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail;
        if (detail && detail.tool) {
          setActiveTool(detail.tool);
          // close open groups when switching to select
          if (detail.tool === "select") setOpenGroup(null);
          // if switching away from layout/widget, clear that group's selected child so the group button
          // displays its default group icon.
          if (detail.tool !== "layout") setSelectedLayout(null);
          if (detail.tool !== "widget") setSelectedWidget(null);
        }
      } catch (e) {}
    };
    window.addEventListener("tool:change", onToolChange as EventListener);
    return () =>
      window.removeEventListener("tool:change", onToolChange as EventListener);
  }, []);

  // Bridge legacy selection events into SelectionContext
  function SelectionBridge() {
    const { selectByIndexPath, selectByUid } = useSelection();
    React.useEffect(() => {
      const handler = (ev: Event) => {
        try {
          const detail = (ev as CustomEvent).detail || {};
          console.debug("SelectionBridge: received event detail", detail);
          if (!detail) return;
          // prefer indexPath
          if (detail.indexPath && Array.isArray(detail.indexPath)) {
            // prefer DOM-authoritative indexPath when available
            let idxs = detail.indexPath.map((n: any) => Number(n));
            try {
              const idxStr = idxs.join("-");
              const dom = document.querySelector(
                `[data-index-path="${idxStr}"]`
              ) as HTMLElement | null;
              if (!dom) {
                // try to find any node whose data-index-path endsWith the incoming path
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
          // prefer uid/id
          if (detail.id) {
            const domId = String(detail.id);
            const idVal = domId.split("-").pop() || domId;
            selectByUid(String(idVal), {
              source: "selector",
              element: detail.element,
            });
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
  }
  // Sync selection from SelectionContext into local Edit state (selectedElementPath/selectedElement)
  function SyncSelectionToLocal() {
    const { state } = useSelection();
    // derive a stable primitive key for the current context selection so
    // the effect can depend on a primitive instead of the whole object.
    const selKey = React.useMemo(() => {
      const s = state && (state as any).selected;
      if (!s) return "";
      if (Array.isArray(s.indexPath)) return `i:${s.indexPath.join(",")}`;
      if (s.uid) return `u:${String(s.uid)}`;
      if (s.element) {
        const el = s.element as any;
        const uid =
          el && (el.identifier || (el._id && (el._id.$oid || el._id)));
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
        try {
          console.debug("SyncSelection: raw selected from context", sel);
        } catch (e) {}
        if (!sel) {
          setSelectedElementPath(null);
          setSelectedElement(null);
          setSelectedElementDraft(null);
          return;
        }
        // compute root segment for current scene
        const sceneEl = (creative as any)?.elements?.[selectedSceneIndex];
        const rootKey = sceneEl ? Object.keys(sceneEl)[0] : undefined;
        const rootData = rootKey ? sceneEl[rootKey] : undefined;
        const rootSegment =
          (rootData && (rootData._id?.$oid || rootData.identifier)) ||
          rootKey ||
          String(selectedSceneIndex);

        let incomingPath: string[] | undefined;
        let element: any = sel.element || null;

        if (sel.indexPath && Array.isArray(sel.indexPath) && creative) {
          try {
            // normalize and validate indexPath by checking for matching DOM nodes
            const rawIdxs: number[] = sel.indexPath.map((n: any) => Number(n));
            let idxs: number[] = rawIdxs.slice();
            try {
              const idxStr = idxs.join("-");
              const foundDom = document.querySelector(
                `[data-index-path="${idxStr}"]`
              ) as HTMLElement | null;
              if (!foundDom) {
                // try without leading scene index (if any)
                if (idxs.length > 1) {
                  const withoutFirst = idxs.slice(1);
                  const alt = document.querySelector(
                    `[data-index-path="${withoutFirst.join("-")}"]`
                  ) as HTMLElement | null;
                  if (alt) idxs = withoutFirst;
                }
                // try adding selectedSceneIndex as prefix
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
            } catch {
              // ignore DOM lookup errors
            }
            console.debug("SyncSelection: incoming indexPath", idxs);
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
            console.debug(
              "SyncSelection: resolved sceneIdx",
              sceneIdx,
              "selectedSceneIndex",
              selectedSceneIndex
            );
            const scene = (creative as any).elements[sceneIdx];
            const sceneKey = scene ? Object.keys(scene)[0] : null;
            let currentContents = sceneKey
              ? scene[sceneKey]?.contents || []
              : [];
            const parentPath: string[] = [];
            let foundElement: any = null;
            const offset = idxs[0] === sceneIdx ? 1 : 0;
            console.debug("SyncSelection: mapping offset", offset);
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
            console.debug(
              "SyncSelection: foundElement parentPath",
              parentPath,
              "foundElementKey",
              foundElement ? Object.keys(foundElement)[0] : null
            );
            if (foundElement) {
              incomingPath = parentPath;
              element = element || foundElement;
            }
          } catch (err) {
            console.debug("SyncSelection: indexPath mapping error", err);
          }
        }

        if (!incomingPath && sel.uid && creative) {
          try {
            const idVal = String(sel.uid);
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

        // only update local state when values actually change to avoid
        // causing repeated effects / render loops
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
  }

  // Close open group when clicking anywhere outside the toolbar (tools panel)
  useEffect(() => {
    const onDocMouseDown = (ev: MouseEvent) => {
      try {
        const el = toolbarRef.current;
        if (!el) return;
        const target = ev.target as Node | null;
        if (target && !el.contains(target)) {
          setOpenGroup(null);
        }
      } catch (e) {}
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const getComponentIcon = (c: any) => {
    const hint = ((c.name || c.type || c.id || "") + "").toLowerCase();
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

  const squareBtnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    minWidth: 36,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  };

  const handleSave = async () => {
    if (!creative) return;
    setSaving(true);
    try {
      await creativeService.updateCreative(
        (creative as any)._id?.$oid ?? (creative as any).id,
        creative
      );
    } catch {
      setError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => navigate("/creatives");
  const handleMove = () => {};

  if (loading)
    return (
      <div className="edit-loading">
        <Spin size="large" />
        <p>Loading creative...</p>
      </div>
    );
  if (error)
    return (
      <div className="edit-error">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Space direction="vertical">
              <Button size="small" onClick={() => window.location.reload()}>
                Retry
              </Button>
              <Button size="small" onClick={handleBack}>
                Back
              </Button>
            </Space>
          }
        />
      </div>
    );
  if (!creative)
    return (
      <div className="edit-error">
        <Alert
          message="Not found"
          description="Creative missing"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={handleBack}>
              Back
            </Button>
          }
        />
      </div>
    );

  const layouts: any[] = [];
  const widgets: any[] = [];
  const others: any[] = [];
  (toolComponents || []).forEach((c: any) => {
    const h = ((c.type || c.category || c.kind || "") + "").toLowerCase();
    if (h.includes("layout")) layouts.push(c);
    else if (h.includes("widget")) widgets.push(c);
    else others.push(c);
  });

  return (
    <SelectionProvider>
      <SelectionBridge />
      <SyncSelectionToLocal />
      <div
        className="edit-container"
        style={{ height: "100vh", display: "flex", flexDirection: "column" }}
      >
        <div className="edit-content" style={{ flex: 1, minHeight: 0 }}>
          <CreativeCanvas
            leftPanel={
              <Panel className="left-elements">
                <div
                  className="top-row"
                  style={{ display: "flex", gap: 8, alignItems: "center" }}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <button onClick={handleBack}>←</button>
                    <strong>{(creative as any).name}</strong>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <button aria-label="menu">☰</button>
                  </div>
                </div>
                <div className="left-separator" />
                {/* Scene selector: stacked rows for top-level elements (slides) */}
                <div className="scene-selector" style={{ marginTop: 8 }}>
                  {Array.isArray((creative as any).elements) &&
                  (creative as any).elements.length ? (
                    (creative as any).elements.map((el: any, i: number) => {
                      const key = Object.keys(el)[0];
                      const data = el[key];
                      const label =
                        data?.name ||
                        data?.identifier ||
                        key ||
                        `Scene ${i + 1}`;
                      const isActive = i === selectedSceneIndex;
                      return (
                        <div
                          key={i}
                          className={`scene-row ${isActive ? "active" : ""}`}
                          onClick={() => {
                            setSelectedSceneIndex(i);
                            const rootKey = Object.keys(el)[0];
                            const rootData = el[rootKey];
                            const rootSegment =
                              (rootData &&
                                (rootData._id?.$oid || rootData.identifier)) ||
                              rootKey ||
                              String(i);
                            setSelectedElementPath([rootSegment]);
                            setSelectedElement(el);
                            window.dispatchEvent(
                              new CustomEvent("creative:select", {
                                detail: {
                                  path: [rootSegment],
                                  element: el,
                                  indexPath: [i],
                                },
                              })
                            );
                          }}
                          title={label}
                        >
                          <div className="scene-label">{label}</div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: "rgba(255,255,255,0.6)" }}>
                      No scenes
                    </div>
                  )}
                </div>
                <div className="left-separator" />
                <div
                  className="element-list"
                  style={{ maxHeight: 480, overflow: "auto" }}
                >
                  <ElementList
                    selectedElement={selectedElement}
                    selectedPath={selectedElementPath}
                    elements={
                      (creative as any).elements &&
                      (creative as any).elements[selectedSceneIndex] &&
                      (creative as any).elements[selectedSceneIndex][
                        Object.keys(
                          (creative as any).elements[selectedSceneIndex]
                        )[0]
                      ] &&
                      (creative as any).elements[selectedSceneIndex][
                        Object.keys(
                          (creative as any).elements[selectedSceneIndex]
                        )[0]
                      ].contents
                        ? (creative as any).elements[selectedSceneIndex][
                            Object.keys(
                              (creative as any).elements[selectedSceneIndex]
                            )[0]
                          ].contents
                        : []
                    }
                    onSelect={(path, el, indexPath) => {
                      // determine current scene/root segment
                      const sceneEl = (creative as any).elements[
                        selectedSceneIndex
                      ];
                      const rootKey = Object.keys(sceneEl)[0];
                      const rootData = sceneEl[rootKey];
                      const rootSegment =
                        (rootData &&
                          (rootData._id?.$oid || rootData.identifier)) ||
                        rootKey ||
                        String(selectedSceneIndex);
                      // avoid duplicating the rootSegment if path already starts with it
                      const fullPath =
                        path && path.length
                          ? path[0] === rootSegment
                            ? path
                            : [rootSegment, ...path]
                          : [rootSegment];
                      const fullIndexPath = indexPath
                        ? indexPath[0] === selectedSceneIndex
                          ? indexPath
                          : [selectedSceneIndex, ...indexPath]
                        : [selectedSceneIndex];
                      setSelectedElementPath(fullPath);
                      setSelectedElement(el);
                      window.dispatchEvent(
                        new CustomEvent("creative:select", {
                          detail: {
                            path: fullPath,
                            element: el,
                            indexPath: fullIndexPath,
                          },
                        })
                      );
                    }}
                  />
                </div>
              </Panel>
            }
            centerPanel={
              <div
                ref={toolbarRef}
                className="hud-center-icons"
                role="toolbar"
                aria-label="Tools"
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <button
                  title="Select"
                  onClick={() => {
                    // dispatch the global tool change and clear any group selections
                    window.dispatchEvent(
                      new CustomEvent("tool:change", {
                        detail: { tool: "select" },
                      })
                    );
                    setActiveTool("select");
                    setSelectedLayout(null);
                    setSelectedWidget(null);
                    setOpenGroup(null);
                  }}
                  style={{
                    ...squareBtnStyle,
                    boxShadow:
                      activeTool === "select"
                        ? "0 0 0 2px rgba(255,255,255,0.95)"
                        : undefined,
                  }}
                >
                  <SelectOutlined />
                </button>

                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ position: "relative" }}>
                    <button
                      aria-label={
                        selectedLayout
                          ? `Selected layout: ${
                              selectedLayout.name ?? selectedLayout.type
                            }`
                          : `Layouts (${layouts.length})`
                      }
                      title={
                        selectedLayout
                          ? selectedLayout.name ?? selectedLayout.type
                          : `Layouts (${layouts.length})`
                      }
                      onClick={() =>
                        setOpenGroup((p) =>
                          p === "layouts" ? null : "layouts"
                        )
                      }
                      style={{
                        ...squareBtnStyle,
                        position: "relative",
                        boxShadow:
                          activeTool === "layout" && selectedLayout
                            ? "0 0 0 2px rgba(255,255,255,0.95)"
                            : undefined,
                      }}
                    >
                      {selectedLayout ? (
                        getComponentIcon(selectedLayout)
                      ) : (
                        <LayoutOutlined />
                      )}
                      <span
                        style={{
                          position: "absolute",
                          right: 4,
                          bottom: 25,
                          fontSize: 10,
                          opacity: 0.95,
                          color: "#fff",
                          pointerEvents: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        <CaretDownFilled
                          style={{ transform: "scale(0.7)", color: "inherit" }}
                        />
                      </span>
                    </button>
                    {openGroup === "layouts" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "inline-block",
                          whiteSpace: "normal",
                          padding: 8,
                          borderRadius: 6,
                          borderTopLeftRadius: 0,
                          borderTopRightRadius: 0,
                          background: "rgba(0,0,0,0.76)",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                          zIndex: 1200,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            alignItems: "center",
                          }}
                        >
                          {layouts.length ? (
                            layouts.map((c: any, i: number) => (
                              <button
                                key={c._id?.$oid ?? c.id ?? i}
                                title={c.name ?? c.type}
                                aria-label={c.name ?? c.type}
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent("tool:insert", {
                                      detail: { component: c },
                                    })
                                  );
                                  setSelectedLayout(c);
                                  // clear widget selection when a layout is chosen
                                  setSelectedWidget(null);
                                  setActiveTool("layout");
                                  setOpenGroup(null);
                                }}
                                style={squareBtnStyle}
                              >
                                {getComponentIcon(c)}
                              </button>
                            ))
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.6)" }}>
                              No layouts
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ position: "relative" }}>
                    <button
                      aria-label={
                        selectedWidget
                          ? `Selected widget: ${
                              selectedWidget.name ?? selectedWidget.type
                            }`
                          : `Widgets (${widgets.length})`
                      }
                      title={
                        selectedWidget
                          ? selectedWidget.name ?? selectedWidget.type
                          : `Widgets (${widgets.length})`
                      }
                      onClick={() =>
                        setOpenGroup((p) =>
                          p === "widgets" ? null : "widgets"
                        )
                      }
                      style={{
                        ...squareBtnStyle,
                        position: "relative",
                        boxShadow:
                          activeTool === "widget" && selectedWidget
                            ? "0 0 0 2px rgba(255,255,255,0.95)"
                            : undefined,
                      }}
                    >
                      {selectedWidget ? (
                        getComponentIcon(selectedWidget)
                      ) : (
                        <SnippetsOutlined />
                      )}
                      <span
                        style={{
                          position: "absolute",
                          right: 4,
                          bottom: 25,
                          fontSize: 10,
                          opacity: 0.95,
                          color: "#fff",
                          pointerEvents: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                        }}
                      >
                        <CaretDownFilled
                          style={{ transform: "scale(0.7)", color: "inherit" }}
                        />
                      </span>
                    </button>
                    {openGroup === "widgets" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "inline-block",
                          whiteSpace: "normal",
                          padding: 8,
                          borderRadius: 6,
                          borderTopLeftRadius: 0,
                          borderTopRightRadius: 0,
                          background: "rgba(0,0,0,0.76)",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                          zIndex: 1200,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 6,
                            alignItems: "center",
                          }}
                        >
                          {widgets.length ? (
                            widgets.map((c: any, i: number) => (
                              <button
                                key={c._id?.$oid ?? c.id ?? i}
                                title={c.name ?? c.type}
                                aria-label={c.name ?? c.type}
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent("tool:insert", {
                                      detail: { component: c },
                                    })
                                  );
                                  setSelectedWidget(c);
                                  // clear layout selection when a widget is chosen
                                  setSelectedLayout(null);
                                  setActiveTool("widget");
                                  setOpenGroup(null);
                                }}
                                style={squareBtnStyle}
                              >
                                {getComponentIcon(c)}
                              </button>
                            ))
                          ) : (
                            <span style={{ color: "rgba(255,255,255,0.6)" }}>
                              No widgets
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {others.length > 0 && (
                    <div style={{ position: "relative" }}>
                      <button
                        aria-label={`Other (${others.length})`}
                        title={`Other (${others.length})`}
                        onClick={() =>
                          setOpenGroup((p) => (p === "other" ? null : "other"))
                        }
                        style={{ ...squareBtnStyle, position: "relative" }}
                      >
                        <AppstoreOutlined />
                        <span
                          style={{
                            position: "absolute",
                            right: 4,
                            bottom: 25,
                            fontSize: 10,
                            opacity: 0.95,
                            color: "#fff",
                            pointerEvents: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}
                        >
                          <CaretDownFilled
                            style={{
                              transform: "scale(0.7)",
                              color: "inherit",
                            }}
                          />
                        </span>
                      </button>
                      {openGroup === "other" && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 6px)",
                            left: "50%",
                            transform: "translateX(-50%)",
                            display: "inline-block",
                            whiteSpace: "normal",
                            padding: 8,
                            borderRadius: 6,
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                            background: "rgba(0,0,0,0.76)",
                            boxShadow: "0 6px 20px rgba(0,0,0,0.6)",
                            zIndex: 1200,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 6,
                              alignItems: "center",
                            }}
                          >
                            {others.map((c: any, i: number) => (
                              <button
                                key={c._id?.$oid ?? c.id ?? i}
                                title={c.name ?? c.type}
                                aria-label={c.name ?? c.type}
                                onClick={() =>
                                  window.dispatchEvent(
                                    new CustomEvent("tool:insert", {
                                      detail: { component: c },
                                    })
                                  )
                                }
                                style={squareBtnStyle}
                              >
                                {getComponentIcon(c)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            }
            rightPanel={(scale, { zoomIn, zoomOut }) => (
              <Panel className="right-properties">
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
                  <button onClick={() => setShowZoomStepper((s) => !s)}>
                    {Math.round((scale || 1) * 100)}%
                  </button>
                  <button onClick={() => setIsPreviewMode((s) => !s)}>
                    {isPreviewMode ? "Exit Preview" : "Preview"}
                  </button>
                  <button onClick={() => handleSave()}>Save</button>
                </div>
                {showZoomStepper && (
                  <div className="zoom-stepper" style={{ marginTop: 8 }}>
                    <button onClick={() => zoomOut && zoomOut()}>-</button>
                    <span style={{ margin: "0 8px" }}>
                      {Math.round((scale || 1) * 100) + "%"}
                    </span>
                    <button onClick={() => zoomIn && zoomIn()}>+</button>
                  </div>
                )}
                <div className="properties-container" style={{ marginTop: 12 }}>
                  {selectedElement ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>Properties</div>
                      <div>
                        <div style={{ fontSize: 12, color: "#666" }}>Path</div>
                        <div style={{ fontSize: 13 }}>
                          {(selectedElementPath || []).join(" / ")}
                        </div>
                      </div>
                      {(() => {
                        const key = Object.keys(selectedElement)[0];
                        const data =
                          (selectedElementDraft && selectedElementDraft[key]) ||
                          (selectedElement && selectedElement[key]) ||
                          {};
                        return (
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            <label style={{ fontSize: 12, color: "#666" }}>
                              Identifier
                            </label>
                            <input
                              value={data.identifier || ""}
                              onChange={(e) =>
                                updateDraftField("identifier", e.target.value)
                              }
                            />

                            <label style={{ fontSize: 12, color: "#666" }}>
                              Type
                            </label>
                            <input
                              value={data.type || key || ""}
                              onChange={(e) =>
                                updateDraftField("type", e.target.value)
                              }
                            />

                            <label style={{ fontSize: 12, color: "#666" }}>
                              Value
                            </label>
                            <input
                              value={data.value || ""}
                              onChange={(e) =>
                                updateDraftField("value", e.target.value)
                              }
                            />
                          </div>
                        );
                      })()}

                      <div style={{ marginTop: 12 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#666",
                            marginBottom: 6,
                          }}
                        >
                          Raw JSON
                        </div>
                        <pre
                          style={{
                            maxHeight: 240,
                            overflow: "auto",
                            background: "#0f0f0f",
                            color: "#eaeaea",
                            padding: 8,
                            borderRadius: 6,
                            fontSize: 12,
                          }}
                        >
                          {JSON.stringify(selectedElement, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    "Select an element to see properties"
                  )}
                </div>
              </Panel>
            )}
          >
            <CreativeRenderer
              creative={creative as Creative}
              onMove={handleMove}
            />
            <Selector
              containerId="dynamic-creative-container"
              onSelectionChange={(_el) => {}}
            />
          </CreativeCanvas>
        </div>
      </div>
    </SelectionProvider>
  );
};

export default Edit;
