import React from "react";
import EditLeft from "../EditLeft/Default";
import EditToolbar from "../EditToolbar/Default";
import EditRight from "../EditRight/Default";

interface Props {
  creative?: any;
  // left panel props
  selectedSceneIndex?: number;
  setSelectedSceneIndex?: (i: number) => void;
  setSelectedElementPath?: (p: string[] | null) => void;
  setSelectedElement?: (el: any | null) => void;
  selectedElement?: any | null;
  selectedElementPath?: string[] | null;

  // toolbar props
  activeTool?: string;
  setActiveTool?: (t: string) => void;
  setSelectedLayout?: (c: any | null) => void;
  setSelectedWidget?: (c: any | null) => void;
  selectedLayout?: any | null;
  selectedWidget?: any | null;

  // right panel props
  scale?: number;
  showZoomStepper?: boolean;
  setShowZoomStepper?: (v: boolean | ((prev: boolean) => boolean)) => void;
  isPreviewMode?: boolean;
  setIsPreviewMode?: (v: boolean | ((prev: boolean) => boolean)) => void;
  onSave?: () => void;
  selectedElementDraft?: any | null;
  updateDraftField?: (field: string, value: any) => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
}

const EditorPanels: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  creative,
  selectedSceneIndex,
  setSelectedSceneIndex,
  setSelectedElementPath,
  setSelectedElement,
  selectedElement,
  selectedElementPath,
  activeTool,
  setActiveTool,
  setSelectedLayout,
  setSelectedWidget,
  selectedLayout,
  selectedWidget,
  scale,
  showZoomStepper,
  setShowZoomStepper,
  isPreviewMode,
  setIsPreviewMode,
  onSave,
  selectedElementDraft,
  updateDraftField,
  zoomIn,
  zoomOut,
}) => {
  const hasChildren = React.Children.count(children) > 0;
  const normSelectedSceneIndex = selectedSceneIndex ?? 0;
  const normSetSelectedSceneIndex = setSelectedSceneIndex ?? (() => {});
  const normSetSelectedElementPath = setSelectedElementPath ?? (() => {});
  const normSetSelectedElement = setSelectedElement ?? (() => {});
  const normSelectedElement = selectedElement ?? null;
  const normSelectedElementPath = selectedElementPath ?? null;
  const normActiveTool = activeTool ?? "select";
  const normSetActiveTool = setActiveTool ?? (() => {});
  const normSetSelectedLayout = setSelectedLayout ?? (() => {});
  const normSetSelectedWidget = setSelectedWidget ?? (() => {});
  const normShowZoomStepper = !!showZoomStepper;
  const normSetShowZoomStepper = setShowZoomStepper ?? (() => {});
  const normIsPreviewMode = !!isPreviewMode;
  const normSetIsPreviewMode = setIsPreviewMode ?? (() => {});
  const normOnSave = onSave ?? (() => {});

  return (
    <div className="editor-panels">
      {hasChildren ? (
        children
      ) : (
        <>
          <EditLeft
            creative={creative}
            selectedSceneIndex={normSelectedSceneIndex}
            setSelectedSceneIndex={normSetSelectedSceneIndex}
            setSelectedElementPath={normSetSelectedElementPath}
            setSelectedElement={normSetSelectedElement}
            selectedElement={normSelectedElement}
            selectedElementPath={normSelectedElementPath}
          />

          <EditToolbar
            activeTool={normActiveTool}
            setActiveTool={normSetActiveTool}
            setSelectedLayout={normSetSelectedLayout}
            setSelectedWidget={normSetSelectedWidget}
            selectedLayout={selectedLayout}
            selectedWidget={selectedWidget}
          />

          <EditRight
            scale={scale}
            zoomIn={zoomIn}
            zoomOut={zoomOut}
            showZoomStepper={normShowZoomStepper}
            setShowZoomStepper={normSetShowZoomStepper}
            isPreviewMode={normIsPreviewMode}
            setIsPreviewMode={normSetIsPreviewMode}
            onSave={normOnSave}
            selectedElement={normSelectedElement}
            selectedElementPath={normSelectedElementPath}
            selectedElementDraft={selectedElementDraft}
            updateDraftField={updateDraftField || (() => {})}
          />
        </>
      )}
    </div>
  );
};

export default EditorPanels;
