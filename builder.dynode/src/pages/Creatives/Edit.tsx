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
  );
};

export default Edit;
