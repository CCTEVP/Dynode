import React from "react";

export interface TagProps {
  color?: "green" | "orange" | "red" | "blue" | "default";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Tag: React.FC<TagProps> = ({
  color = "default",
  children,
  className = "",
  style,
}) => {
  // Inline style to guarantee override
  const colorMap: Record<string, React.CSSProperties> = {
    green: { background: "#e6fffb", color: "#389e8a", borderColor: "#b5f5ec" },
    orange: { background: "#fff7e6", color: "#d46b08", borderColor: "#ffe7ba" },
    red: { background: "#fff1f0", color: "#cf1322", borderColor: "#ffa39e" },
    blue: { background: "#e6f7ff", color: "#096dd9", borderColor: "#91d5ff" },
    default: { background: "#fafbfc", color: "#888", borderColor: "#ededed" },
  };
  return (
    <span
      className={className}
      style={{
        display: "inline-block",
        fontSize: "8.5px",
        padding: "0 3px",
        height: "13px",
        lineHeight: "11px",
        borderRadius: "1.5px",
        fontWeight: 400,
        letterSpacing: "0.1px",
        boxShadow: "none",
        verticalAlign: "middle",
        userSelect: "none",
        whiteSpace: "nowrap",
        textTransform: "uppercase",
        border: "1px solid",
        ...colorMap[color],
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Tag;
