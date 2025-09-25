import React from "react";
import { AuthProvider } from "./AuthContext";
import { ToolComponentsProvider } from "./ToolComponentsContext";
import { CreativeProvider } from "./CreativeContext";
import { SelectionProvider } from "../contexts/SelectionContext";
import useCreative from "../hooks/useCreative";

type Props = {
  creativeId?: string;
  children: React.ReactNode;
};

const EditorProviders: React.FC<Props> = ({ creativeId, children }) => {
  const { creative, loading, error, reload } = useCreative(creativeId);

  return (
    <AuthProvider>
      <ToolComponentsProvider>
        <CreativeProvider value={{ creative, loading, error, reload }}>
          <SelectionProvider>{children}</SelectionProvider>
        </CreativeProvider>
      </ToolComponentsProvider>
    </AuthProvider>
  );
};

export default EditorProviders;
