<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Alert, Button, Space } from "antd";
// Selector component removed: editor's EditorSelector will provide selection overlay
import creativeService from "../../services/creative";
import useCreative from "../../hooks/useCreative";
import EditorProviders from "../../contexts/EditorProviders";
// EditLeft/EditToolbar/EditRight are rendered by EditorPanels by default
import Editor from "../../components/controls/Editor";
import "./Edit.css";
// selection logic moved to controls; no direct use in this file
// (type imports removed; Editor handles rendering)

const Edit: React.FC = () => {
  const { creativeId } = useParams<{ creativeId: string }>();
  const navigate = useNavigate();

  // `EditorProviders` will load and provide creative via context
  const creativeHook = useCreative(creativeId); // keep local ref for saving reload
  const creative = creativeHook.creative;
  const loading = creativeHook.loading;
  const error = creativeHook.error;
  const reload = creativeHook.reload;
  const [, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  // toolComponents are provided via ToolComponentsProvider/context
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number>(0);
  const [selectedElementPath, setSelectedElementPath] = useState<
    string[] | null
  >(null);
  const [selectedElement, setSelectedElement] = useState<any | null>(null);
  const [selectedElementDraft, setSelectedElementDraft] = useState<any | null>(
    null
  );
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

  // Creative data is loaded via `useCreative` hook and provided via context below

  // Tool components are provided by ToolComponentsProvider via context

  // Close any open group when the Select tool is activated
  useEffect(() => {
    const onToolChange = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail;
        if (detail && detail.tool) {
          setActiveTool(detail.tool);
          // close open groups when switching to select (handled by toolbar component)
          if (detail.tool === "select") {
            /* no-op here */
          }
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

  // SelectionBridge component moved to separate file

  // Close open group when clicking anywhere outside the toolbar (tools panel)
  useEffect(() => {
    const onDocMouseDown = (ev: MouseEvent) => {
      try {
        const el = toolbarRef.current;
        if (!el) return;
        const target = ev.target as Node | null;
        if (target && !el.contains(target)) {
          // toolbar component handles its own open/close
        }
      } catch (e) {}
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  // toolbar button style moved to `EditToolbar` component

  const handleSave = async () => {
    if (!creative) return;
    setSaving(true);
    try {
      await creativeService.updateCreative(
        (creative as any)._id?.$oid ?? (creative as any).id,
        creative
      );
      // reload to refresh any derived state
      try {
        await reload();
      } catch {}
    } catch {
      setLocalError("Save failed");
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
  if (error || localError)
    return (
      <div className="edit-error">
        <Alert
          message="Error"
          description={error ? error.message : localError}
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

  // layout/widget grouping is handled by the toolbar via context

  return (
    <EditorProviders creativeId={creativeId}>
      <Editor
        creative={creative}
        selectedSceneIndex={selectedSceneIndex}
        setSelectedSceneIndex={setSelectedSceneIndex}
        selectedElementPath={selectedElementPath}
        selectedElement={selectedElement}
        setSelectedElementPath={setSelectedElementPath}
        setSelectedElement={setSelectedElement}
        setSelectedElementDraft={setSelectedElementDraft}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        setSelectedLayout={setSelectedLayout}
        setSelectedWidget={setSelectedWidget}
        selectedLayout={selectedLayout}
        selectedWidget={selectedWidget}
        scale={1}
        showZoomStepper={showZoomStepper}
        setShowZoomStepper={setShowZoomStepper}
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={setIsPreviewMode}
        onSave={handleSave}
        selectedElementDraft={selectedElementDraft}
        updateDraftField={updateDraftField}
        onMove={handleMove}
      />
    </EditorProviders>
=======
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button, Avatar, Input, Spin, Alert } from "antd";
import creativeService from "../../services/creative";
import useEditorStore from "../../store/useEditorStore";
import PanelControl from "../../components/controls/Panel/Default";
import ModalControl from "../../components/controls/Modal/Modal";
import {
  SlideLayout,
  BoxLayout,
  GridLayout,
} from "../../components/editor/layouts";
import {
  CardWidget,
  TextWidget,
  ImageWidget,
  VideoWidget,
  CountdownWidget,
} from "../../components/editor/widgets";

const EditorCanvas: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{ position: "absolute", inset: 0, zIndex: 0, overflow: "hidden" }}
  >
    {children}
  </div>
);

const EditorSelector: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 10,
      pointerEvents: "none",
    }}
  >
    {children}
  </div>
);

const EditorPanels: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      zIndex: 20,
      pointerEvents: "auto",
    }}
  >
    {children}
  </div>
);

const EditorModals: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => (
  <div style={{ position: "absolute", inset: 0, zIndex: 30 }}>{children}</div>
);

const Scene: React.FC<{ element: string; children?: React.ReactNode }> = ({
  element,
  children,
}) => (
  <div
    style={{
      padding: 12,
      minWidth: 220,
      minHeight: 180,
      border: "2px dashed rgba(0,0,0,0.08)",
      background: "rgba(240,248,255,0.6)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
    data-scene={element}
  >
    {children}
  </div>
);

const Boundary: React.FC<{ type?: string; event?: string }> = ({
  type,
  event,
}) => (
  <div
    style={{
      position: "absolute",
      border: "1px solid rgba(0,0,0,0.05)",
      pointerEvents: "none",
    }}
  >{`${type}(${event})`}</div>
);

const PanelGroup: React.FC<{
  position?: string;
  children?: React.ReactNode;
}> = ({ position, children }) => {
  const style: React.CSSProperties = { position: "absolute" };
  if (position === "top-left") Object.assign(style, { left: 8, top: 8 });
  if (position === "top-center")
    Object.assign(style, {
      left: "50%",
      top: 8,
      transform: "translateX(-50%)",
    });
  if (position === "top-right") Object.assign(style, { right: 8, top: 8 });
  return <div style={style}>{children}</div>;
};

const Edit: React.FC = () => {
  const { creativeId } = useParams<{ creativeId: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creative, setCreativeLocal] = useState<any | null>(null);
  const setCreative = useEditorStore((s) => s.setCreative);
  const [scale, setScale] = useState<number>(1);
  const [middleDown, setMiddleDown] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Keep overlays disabled until we make the canvas visible and ready.
  // Set to `true` when you want panels/selectors/modals to appear.
  const overlaysEnabled = false;

  const cleanStyles = (styles: Record<string, any> | undefined) => {
    if (!styles || typeof styles !== "object") return {};
    const forbidden = new Set(["position", "top", "left", "right", "bottom"]);
    const out: Record<string, any> = {};
    Object.keys(styles).forEach((k) => {
      if (forbidden.has(k)) return;
      // convert kebab to camel
      const camel = k.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      let v: any = styles[k];
      if (typeof v === "string" && v.match(/^\d+(px)?$/))
        v = parseInt(v.replace(/px$/, ""), 10);
      out[camel] = v;
    });
    return out;
  };

  // Auto-fit scale to content height when creative loads or window resizes
  useEffect(() => {
    const fit = () => {
      const container = containerRef.current;
      const content = contentRef.current;
      if (!container || !content) return;
      // measure content natural height (unscaled)
      const rect = content.getBoundingClientRect();
      const naturalH = rect.height / Math.max(0.0001, scale);
      const availH = container.clientHeight - 32; // padding
      const desired = naturalH > 0 ? Math.min(1, availH / naturalH) : 1;
      setScale((s) => {
        // if scale already equals desired (within small epsilon), keep
        if (Math.abs(s - desired) < 0.005) return s;
        return desired;
      });
    };

    // run after paint
    const id = setTimeout(fit, 50);
    window.addEventListener("resize", fit);
    return () => {
      clearTimeout(id);
      window.removeEventListener("resize", fit);
    };
  }, [creative]);

  useEffect(() => {
    if (!creativeId) return;
    let mounted = true;
    setLoading(true);
    setError(null);

    creativeService
      .getCreativeWithElements(creativeId)
      .then((data) => {
        if (!mounted) return;
        setCreativeLocal(data);
        if (setCreative) setCreative(data);
        console.debug("[Edit] loaded creative root:", data?.root ?? data);
        console.debug(
          "[Edit] loaded elements:",
          Array.isArray(data?.elements)
            ? data.elements.map(
                (e: any) =>
                  Object.keys(e)[0] +
                  ":" +
                  (e[Object.keys(e)[0]]?.identifier || "?")
              )
            : data?.elements
        );
      })
      .catch((err) => {
        console.error("Error loading creative:", err);
        if (!mounted) return;
        setError(err?.message || String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [creativeId, setCreative]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            zIndex: 100,
          }}
        >
          <Spin tip="Loading creative..." />
        </div>
      )}

      {error && (
        <div style={{ position: "absolute", inset: 8, zIndex: 200 }}>
          <Alert
            type="error"
            message="Failed to load creative"
            description={error}
          />
        </div>
      )}
      <EditorCanvas>
        <div
          onMouseDown={(e) => {
            if (e.button === 1) setMiddleDown(true);
          }}
          onMouseUp={(e) => {
            if (e.button === 1) setMiddleDown(false);
          }}
          onMouseLeave={() => setMiddleDown(false)}
          onWheel={(e) => {
            if (!middleDown) return;
            e.preventDefault();
            const delta = e.deltaY;
            const factor = delta > 0 ? 0.9 : 1.1;
            setScale((s) =>
              Math.min(3, Math.max(0.25, +(s * factor).toFixed(3)))
            );
          }}
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "95%",
              height: "95%",
              background: "#fff",
              borderRadius: 6,
              boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              flexWrap: "wrap",
              padding: 48,
              overflow: "auto",
            }}
            ref={containerRef}
          >
            <div
              ref={contentRef}
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "center center",
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {creative ? (
                <>
                  {Array.isArray(creative.elements) &&
                  creative.elements.length > 0 ? (
                    creative.elements.map((el: any, idx: number) => {
                      const widgetType = Object.keys(el)[0];
                      const data = el[widgetType] ?? el;
                      const id = data?.identifier || widgetType || String(idx);
                      // title intentionally unused here; rendering uses components directly
                      // renderNode will clean styles for each payload
                      const renderNode = (
                        node: any,
                        indexPath: number[] = []
                      ) => {
                        if (!node) return null;
                        const key = Object.keys(node)[0];
                        const p = node[key];
                        if (!key || !p) return null;

                        // prepare cleaned payload
                        const cleaned = { ...p, styles: cleanStyles(p.styles) };

                        // Layouts
                        if (key === "SlideLayout") {
                          const k =
                            p?._id?.$oid ??
                            p?.identifier ??
                            `slide-${indexPath.join("-")}`;
                          return (
                            <SlideLayout
                              key={k}
                              layout={cleaned}
                              additionalProps={{}}
                            >
                              {Array.isArray(p.contents)
                                ? p.contents.map((c: any, i: number) =>
                                    renderNode(c, [...indexPath, i])
                                  )
                                : null}
                            </SlideLayout>
                          );
                        }

                        if (key === "BoxLayout") {
                          const k =
                            p?._id?.$oid ??
                            p?.identifier ??
                            `box-${indexPath.join("-")}`;
                          return (
                            <BoxLayout
                              key={k}
                              layout={cleaned}
                              additionalProps={{}}
                            >
                              {Array.isArray(p.contents)
                                ? p.contents.map((c: any, i: number) =>
                                    renderNode(c, [...indexPath, i])
                                  )
                                : null}
                            </BoxLayout>
                          );
                        }

                        if (key === "GridLayout") {
                          const k =
                            p?._id?.$oid ??
                            p?.identifier ??
                            `grid-${indexPath.join("-")}`;
                          return (
                            <GridLayout key={k} layout={cleaned}>
                              {Array.isArray(p.contents)
                                ? p.contents.map((c: any, i: number) =>
                                    renderNode(c, [...indexPath, i])
                                  )
                                : null}
                            </GridLayout>
                          );
                        }

                        // Widgets
                        const widgetKey = key;
                        const widgetId =
                          p?._id?.$oid ??
                          p?.identifier ??
                          `${widgetKey}-${indexPath.join("-")}`;
                        if (widgetKey === "CardWidget")
                          return (
                            <CardWidget
                              key={widgetId}
                              widget={cleaned}
                              creative={creative?.root ?? creative}
                              additionalProps={{}}
                            />
                          );
                        if (widgetKey === "TextWidget")
                          return (
                            <TextWidget
                              key={widgetId}
                              widget={cleaned}
                              creative={creative?.root ?? creative}
                              additionalProps={{}}
                            />
                          );
                        if (widgetKey === "ImageWidget")
                          return (
                            <ImageWidget
                              key={widgetId}
                              widget={cleaned}
                              creative={creative?.root ?? creative}
                              additionalProps={{}}
                            />
                          );
                        if (widgetKey === "VideoWidget")
                          return (
                            <VideoWidget
                              key={widgetId}
                              widget={cleaned}
                              creative={creative?.root ?? creative}
                              additionalProps={{}}
                            />
                          );
                        if (widgetKey === "CountdownWidget")
                          return (
                            <CountdownWidget
                              key={widgetId}
                              widget={cleaned}
                              creative={creative?.root ?? creative}
                              additionalProps={{}}
                            />
                          );

                        return null;
                      };

                      return (
                        <Scene key={id} element={id}>
                          {renderNode(el)}
                        </Scene>
                      );
                    })
                  ) : (
                    <Scene element="elements">
                      Elements: {creative.elements?.length || 0}
                    </Scene>
                  )}
                </>
              ) : (
                <>
                  <Scene element="0">Scene 0</Scene>
                  <Scene element="1">Scene 1</Scene>
                </>
              )}
            </div>
          </div>
        </div>
      </EditorCanvas>

      {overlaysEnabled && (
        <EditorSelector>
          <Boundary type="selection" event="click" />
          <Boundary type="detection" event="hover" />
        </EditorSelector>
      )}

      {overlaysEnabled && (
        <EditorPanels>
          <PanelGroup position="top-left">
            <PanelControl>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Button onClick={() => (window.location.hash = "/creatives")}>
                    Back
                  </Button>
                  <h3 style={{ margin: 0 }}>Creative Name</h3>
                  <Button>Options</Button>
                </div>
                <div>SceneSelector</div>
                <div>ElementSelector</div>
              </div>
            </PanelControl>
            <PanelControl id="OptionsPanel">Options</PanelControl>
          </PanelGroup>

          <PanelGroup position="top-center">
            <PanelControl>
              <div style={{ display: "flex", gap: 8 }}>
                <Button>Arrow</Button>
                <Button>Layouts</Button>
                <Button>Widgets</Button>
              </div>
            </PanelControl>
            <PanelControl>
              <div id="layoutsGroup" />
            </PanelControl>
          </PanelGroup>

          <PanelGroup position="top-right">
            <PanelControl>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Avatar />
                  <div
                    style={{ display: "flex", gap: 4, alignItems: "center" }}
                  >
                    <Button>-</Button>
                    <Input style={{ width: 56 }} defaultValue={100} />
                    <Button>+</Button>
                  </div>
                  <Button>Preview</Button>
                  <Button type="primary">Save</Button>
                </div>
                <div>Properties</div>
                <div>DataRaw</div>
              </div>
            </PanelControl>
            <PanelControl>Options</PanelControl>
          </PanelGroup>
        </EditorPanels>
      )}

      {overlaysEnabled && (
        <EditorModals>
          <ModalControl open={false} onClose={() => {}}>
            <></>
          </ModalControl>
        </EditorModals>
      )}
    </div>
>>>>>>> 3df647b1ea3251c86e7e3082b3bc28543f32cab9
  );
};

export default Edit;
