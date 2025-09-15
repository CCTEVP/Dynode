import React from "react";
import { useNavigate } from "react-router-dom";

const CreativeCard: React.FC<{
  id: string;
  title: string;
  updated: string;
  onClick?: () => void;
}> = ({ id, title, updated, onClick }) => {
  const navigate = useNavigate();
  return (
    <div
      className="creative-card"
      onClick={() => {
        onClick ? onClick() : navigate(`/Editor/Creatives/${id}`);
      }}
    >
      <div className="creative-card__thumb">
        {/* Placeholder for thumbnail */}
      </div>
      <div className="creative-card__title">{title}</div>
      <div className="creative-card__updated">Updated {updated}</div>
    </div>
  );
};

export default CreativeCard;
