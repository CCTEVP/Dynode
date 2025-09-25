import React from "react";
import SelectionBridge from "../SelectionBridge/Default";
import SyncSelectionToLocal from "../SyncSelectionToLocal/Default";
import EditorCanvas from "../EditorCanvas/Default";
import EditorSelector from "../EditorSelector/Default";
import EditorPanels from "../EditorPanels/Default";

interface Props {
  creative?: any;
  selectedSceneIndex?: number;
  setSelectedSceneIndex?: (n: number) => void;
  selectedElementPath?: string[] | null;
  selectedElement?: any | null;
  setSelectedElementPath?: (p: string[] | null) => void;
  setSelectedElement?: (e: any | null) => void;
  setSelectedElementDraft?: (d: any | null) => void;

  activeTool?: string;
  setActiveTool?: (t: string) => void;
  setSelectedLayout?: (c: any | null) => void;
  setSelectedWidget?: (c: any | null) => void;
  selectedLayout?: any | null;
  selectedWidget?: any | null;

  scale?: number;
  showZoomStepper?: boolean;
  setShowZoomStepper?: (v: boolean | ((prev: boolean) => boolean)) => void;
  isPreviewMode?: boolean;
  setIsPreviewMode?: (v: boolean | ((prev: boolean) => boolean)) => void;
  onSave?: () => void;
  selectedElementDraft?: any | null;
  updateDraftField?: (field: string, value: any) => void;
  onMove?: () => void;
}

const Editor: React.FC<React.PropsWithChildren<Props>> = ({
  creative,
  selectedSceneIndex = 0,
  setSelectedSceneIndex = () => {},
  selectedElementPath = null,
  selectedElement = null,
  setSelectedElementPath = () => {},
  setSelectedElement = () => {},
  setSelectedElementDraft = () => {},
  activeTool = "select",
  setActiveTool = () => {},
  setSelectedLayout = () => {},
  setSelectedWidget = () => {},
  selectedLayout = null,
  selectedWidget = null,
  scale = 1,
  showZoomStepper = false,
  setShowZoomStepper = () => {},
  isPreviewMode = false,
  setIsPreviewMode = () => {},
  onSave = () => {},
  selectedElementDraft = null,
  updateDraftField = () => {},
  onMove = () => {},
  children,
}) => {
  return (
    <div
      className="editor-container"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
      }}
    >
      <SelectionBridge />

      <SyncSelectionToLocal
        selectedSceneIndex={selectedSceneIndex}
        setSelectedSceneIndex={setSelectedSceneIndex}
        selectedElementPath={selectedElementPath}
        selectedElement={selectedElement}
        setSelectedElementPath={setSelectedElementPath}
        setSelectedElement={setSelectedElement}
        setSelectedElementDraft={setSelectedElementDraft}
      />

      <EditorCanvas
        creative={creative}
        onMove={onMove}
        selectedSceneIndex={selectedSceneIndex}
      />

      <EditorSelector />

      <EditorPanels
        creative={creative}
        selectedSceneIndex={selectedSceneIndex}
        setSelectedSceneIndex={setSelectedSceneIndex}
        setSelectedElementPath={setSelectedElementPath}
        setSelectedElement={setSelectedElement}
        selectedElement={selectedElement}
        selectedElementPath={selectedElementPath}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        setSelectedLayout={setSelectedLayout}
        setSelectedWidget={setSelectedWidget}
        selectedLayout={selectedLayout}
        selectedWidget={selectedWidget}
        scale={scale}
        showZoomStepper={showZoomStepper}
        setShowZoomStepper={setShowZoomStepper}
        isPreviewMode={isPreviewMode}
        setIsPreviewMode={setIsPreviewMode}
        onSave={onSave}
        selectedElementDraft={selectedElementDraft}
        updateDraftField={updateDraftField}
      />

      {children}
    </div>
  );
};

export default Editor;
