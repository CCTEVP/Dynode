import React from "react";
import { Typography, Button } from "antd";
import type { DataCardItem } from "./types";
import { getTypeIcon, getCardColor } from "./utils";

const { Title } = Typography;

interface DataCardHeaderProps {
  item: DataCardItem;
  index: number;
  onClose: () => void;
}

const DataCardHeader: React.FC<DataCardHeaderProps> = ({
  item,
  index,
  onClose,
}) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            background: getCardColor(item.type, index),
            padding: "8px",
            borderRadius: "8px",
            marginRight: "12px",
          }}
        >
          {getTypeIcon(item.type)}
        </div>
        <Title level={3} style={{ margin: 0 }}>
          {Array.isArray(item.type) ? item.type[0] : item.type}
        </Title>
      </div>
      <Button
        type="text"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ✕
      </Button>
    </div>
  );
};

export default DataCardHeader;
