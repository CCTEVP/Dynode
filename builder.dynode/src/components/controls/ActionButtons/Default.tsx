import React from "react";
import { useNavigate } from "react-router-dom";

const actions = [
  { label: "Dynamic Creative", type: "dynamic" },
  { label: "Interactive Creative", type: "interactive" },
  { label: "Export Creative", type: "export" },
];

const ActionButtons: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="action-buttons">
      {actions.map((action) => (
        <button
          key={action.type}
          onClick={() => navigate("/Editor/Creatives/Create")}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
