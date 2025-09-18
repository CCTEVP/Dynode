import React from "react";

type PanelProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

const Panel: React.FC<PanelProps> = ({ className = "", children, style, ...rest }) => {
  return (
    <div className={`panel ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
};

export default Panel;
