import React, { useState, useRef } from "react";
import PanelGroup from "../PanelGroup/Default";
import Panel from "../Panel/Default";
import { useToolComponentsContext } from "../../../contexts/ToolComponentsContext";
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

interface Props {
  activeTool: string;
  setActiveTool: (t: string) => void;
  setSelectedLayout: (c: any | null) => void;
  setSelectedWidget: (c: any | null) => void;
  selectedLayout?: any | null;
  selectedWidget?: any | null;
}

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

const EditToolbar: React.FC<Props> = ({
  activeTool,
  setActiveTool,
  setSelectedLayout,
  setSelectedWidget,
  selectedLayout = null,
  selectedWidget = null,
}) => {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const { components: toolComponents } = useToolComponentsContext();

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
    <PanelGroup position="top-center">
      <Panel className="hud-center-icons" style={{ display: "flex" }}>
        <div
          ref={toolbarRef}
          role="toolbar"
          aria-label="Tools"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <button
            title="Select"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("tool:change", { detail: { tool: "select" } })
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
                  setOpenGroup((p) => (p === "layouts" ? null : "layouts"))
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
                  setOpenGroup((p) => (p === "widgets" ? null : "widgets"))
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
                      style={{ transform: "scale(0.7)", color: "inherit" }}
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
      </Panel>
    </PanelGroup>
  );
};

export default EditToolbar;
