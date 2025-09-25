import React from "react";
import CreativeCanvas from "../CreativeCanvas/Default";
import { CreativeRenderer } from "../CreativeRenderer/Default";

interface Props {
  creative?: any;
  onMove?: () => void;
  selectedSceneIndex?: number;
}

const EditorCanvas: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  creative,
  onMove,
  selectedSceneIndex = 0,
}) => {
  return (
    <div className="editor-canvas">
      <CreativeCanvas>
        <CreativeRenderer
          creative={creative}
          onMove={onMove}
          selectedSceneIndex={selectedSceneIndex}
        />
      </CreativeCanvas>
      {children}
    </div>
  );
};

export default EditorCanvas;
