import React from "react";
interface Props {
  position?: string;
}

const PanelGroup: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  position,
}) => {
  const posClass = position ? `pos-${position}` : "";
  return (
    <div
      className={`panel-group ${posClass}`}
      style={{ display: "flex", flexDirection: "row", gap: 10 }}
    >
      {children}
    </div>
  );
};

export default PanelGroup;
