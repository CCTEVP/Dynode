import React from "react";
import Panel from "../Panel/Default";
import PanelGroup from "../PanelGroup/Default";

interface Props {
  scale?: number;
  zoomIn?: () => void;
  zoomOut?: () => void;
  // whether to show the main right panel (hidden by default)
  showMain?: boolean;
  showZoomStepper: boolean;
  setShowZoomStepper: (v: boolean | ((prev: boolean) => boolean)) => void;
  isPreviewMode: boolean;
  setIsPreviewMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  onSave: () => void;
  selectedElement: any | null;
  selectedElementPath: string[] | null;
  selectedElementDraft: any | null;
  updateDraftField: (field: string, value: any) => void;
}

const EditRight: React.FC<Props> = ({
  scale,
  zoomIn,
  zoomOut,
  showMain = false,
  showZoomStepper,
  setShowZoomStepper,
  isPreviewMode,
  setIsPreviewMode,
  onSave,
  selectedElement,
  selectedElementPath,
  selectedElementDraft,
  updateDraftField,
}) => {
  return (
    <PanelGroup position="top-right">
      {showMain && (
        <Panel className="right-options" resizable allowed={["left", "bottom"]}>
          Contextual Menu
        </Panel>
      )}
      <Panel
        className="right-properties"
        resizable
        allowed={["left", "bottom"]}
      >
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
          <button onClick={() => onSave()}>Save</button>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
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

                    <label style={{ fontSize: 12, color: "#666" }}>Type</label>
                    <input
                      value={data.type || key || ""}
                      onChange={(e) => updateDraftField("type", e.target.value)}
                    />

                    <label style={{ fontSize: 12, color: "#666" }}>Value</label>
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
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>
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
    </PanelGroup>
  );
};

export default EditRight;
