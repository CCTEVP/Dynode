import React from "react";
import { Button } from "antd";
import { CodeOutlined, ExpandAltOutlined } from "@ant-design/icons";
import type { DataCardItem } from "./types";

interface DataCardActionsProps {
  item: DataCardItem;
  onViewDetails: (item: DataCardItem) => void;
}

const DataCardActions: React.FC<DataCardActionsProps> = ({
  item,
  onViewDetails,
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginTop: "16px",
        paddingTop: "16px",
        borderTop: "1px solid #f0f0f0",
      }}
    >
      <Button
        type="primary"
        icon={<CodeOutlined />}
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(item);
        }}
      >
        Details
      </Button>
      {item.contents && (
        <Button
          icon={<ExpandAltOutlined />}
          disabled={item.contents.length === 0}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          Contents ({item.contents.length})
        </Button>
      )}
    </div>
  );
};

export default DataCardActions;
