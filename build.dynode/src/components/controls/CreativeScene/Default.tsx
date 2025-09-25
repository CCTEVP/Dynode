import React from "react";
import "./Default.css";

interface CreativeSceneProps {
  index: number;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const Default: React.FC<CreativeSceneProps> = ({
  index,
  active = false,
  children,
  className,
}) => {
  return (
    <section
      role="group"
      aria-hidden={!active}
      data-scene-index={index}
      className={className ? `creative-scene ${className}` : "creative-scene"}
      style={{ display: active ? undefined : "none" }}
    >
      {children}
    </section>
  );
};

export default Default;
