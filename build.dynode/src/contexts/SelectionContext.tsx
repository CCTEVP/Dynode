import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
} from "react";

type Source = "canvas" | "panel" | "selector" | "programmatic";

export type Selection = {
  indexPath?: number[];
  uid?: string;
  element?: any;
};

type State = {
  selected: Selection | null;
  lastSource?: Source | null;
};

type Action =
  | { type: "select"; payload: Selection; source: Source }
  | { type: "clear"; source?: Source };

const SelectionContext = createContext<{
  state: State;
  selectByIndexPath: (
    indexPath: number[],
    opts?: { source?: Source; element?: any }
  ) => void;
  selectByUid: (uid: string, opts?: { source?: Source; element?: any }) => void;
  clearSelection: (opts?: { source?: Source }) => void;
} | null>(null);

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "select":
      return { selected: action.payload, lastSource: action.source };
    case "clear":
      return { selected: null, lastSource: action.source ?? null };
    default:
      return state;
  }
}

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    selected: null,
    lastSource: null,
  });
  const lastBroadcastRef = useRef<{ source?: Source; stamp?: number }>({});

  const selectByIndexPath = useCallback(
    (indexPath: number[], opts?: { source?: Source; element?: any }) => {
      const source = opts?.source ?? "programmatic";
      dispatch({
        type: "select",
        payload: { indexPath, element: opts?.element },
        source,
      });
      lastBroadcastRef.current = { source, stamp: Date.now() };
    },
    []
  );

  const selectByUid = useCallback(
    (uid: string, opts?: { source?: Source; element?: any }) => {
      const source = opts?.source ?? "programmatic";
      dispatch({
        type: "select",
        payload: { uid, element: opts?.element },
        source,
      });
      lastBroadcastRef.current = { source, stamp: Date.now() };
    },
    []
  );

  const clearSelection = useCallback((opts?: { source?: Source }) => {
    dispatch({ type: "clear", source: opts?.source });
    lastBroadcastRef.current = { source: opts?.source, stamp: Date.now() };
  }, []);

  return (
    <SelectionContext.Provider
      value={{ state, selectByIndexPath, selectByUid, clearSelection }}
    >
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx)
    throw new Error("useSelection must be used inside SelectionProvider");
  return ctx;
}
