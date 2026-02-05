import React, { useState } from "react";
import Panel from "../Panel/Default";
import PanelGroup from "../PanelGroup/Default";
import ElementList from "../ElementList/Default";

interface Props {
  creative: any;
  selectedSceneIndex: number;
  setSelectedSceneIndex: (i: number) => void;
  setSelectedElementPath: (p: string[] | null) => void;
  setSelectedElement: (el: any | null) => void;
  selectedElement?: any | null;
  selectedElementPath?: string[] | null;
}

const EditLeft: React.FC<Props> = ({
  creative,
  selectedSceneIndex,
  setSelectedSceneIndex,
  setSelectedElementPath,
  setSelectedElement,
  selectedElement = null,
  selectedElementPath = null,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <PanelGroup position="top-left">
      <Panel className="left-elements" resizable allowed={["right", "bottom"]}>
        <div
          className="top-row"
          style={{ display: "flex", gap: 8, alignItems: "center" }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <strong>{(creative as any).name}</strong>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              aria-label="menu"
              aria-expanded={showOptions}
              onClick={() => setShowOptions((s) => !s)}
            >
              ☰
            </button>
          </div>
        </div>
        <div className="left-separator" />
        <div className="scene-selector" style={{ marginTop: 8 }}>
          {Array.isArray((creative as any).elements) &&
          (creative as any).elements.length ? (
            (creative as any).elements.map((el: any, i: number) => {
              const key = Object.keys(el)[0];
              const data = el[key];
              const label =
                data?.name || data?.identifier || key || `Scene ${i + 1}`;
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
            <div style={{ color: "rgba(255,255,255,0.6)" }}>No scenes</div>
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
            sceneIndex={selectedSceneIndex}
            elements={
              (creative as any).elements &&
              (creative as any).elements[selectedSceneIndex] &&
              (creative as any).elements[selectedSceneIndex][
                Object.keys((creative as any).elements[selectedSceneIndex])[0]
              ] &&
              (creative as any).elements[selectedSceneIndex][
                Object.keys((creative as any).elements[selectedSceneIndex])[0]
              ].contents
                ? (creative as any).elements[selectedSceneIndex][
                    Object.keys(
                      (creative as any).elements[selectedSceneIndex]
                    )[0]
                  ].contents
                : []
            }
            onSelect={(path: string[], el: any, indexPath?: number[]) => {
              const sceneEl = (creative as any).elements[selectedSceneIndex];
              const rootKey = Object.keys(sceneEl)[0];
              const rootData = sceneEl[rootKey];
              const rootSegment =
                (rootData && (rootData._id?.$oid || rootData.identifier)) ||
                rootKey ||
                String(selectedSceneIndex);
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
      {showOptions && (
        <Panel className="left-options" resizable allowed={["right", "bottom"]}>
          Menu
        </Panel>
      )}
    </PanelGroup>
  );
};

export default EditLeft;
