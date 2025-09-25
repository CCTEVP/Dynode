import { create } from "zustand";

type Scene = {
  id: string;
  name?: string;
};

type CreativeData = {
  root: any | null;
  elements: any[];
};

type EditorState = {
  scenes: Scene[];
  selectedElementId?: string | null;
  layout: Record<string, any>[];
  creative?: CreativeData | null;
  addScene: (scene: Scene) => void;
  selectElement: (id?: string | null) => void;
  setLayout: (layout: Record<string, any>[]) => void;
  setCreative: (creative: CreativeData | null) => void;
};

export const useEditorStore = create<EditorState>((set: any) => ({
  scenes: [{ id: "0", name: "Default" }, { id: "1", name: "Second" }],
  selectedElementId: null,
  layout: [],
  creative: null,
  addScene: (scene: Scene) => set((s: EditorState) => ({ scenes: [...s.scenes, scene] })),
  selectElement: (id?: string | null) => set(() => ({ selectedElementId: id })),
  setLayout: (layout: Record<string, any>[]) => set(() => ({ layout })),
  setCreative: (creative: CreativeData | null) => set(() => ({ creative })),
}));

export default useEditorStore;
