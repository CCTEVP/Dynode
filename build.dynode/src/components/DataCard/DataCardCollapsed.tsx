import React from "react";
import { Typography } from "antd";
import type { DataCardItem } from "./types";
import { getTypeIcon } from "./utils";

const { Title } = Typography;

interface DataCardCollapsedProps {
  item: DataCardItem;
}

const DataCardCollapsed: React.FC<DataCardCollapsedProps> = ({ item }) => {
  return (
    <>
      <div style={{ marginRight: "12px" }}>{getTypeIcon(item.type)}</div>
      <div style={{ flex: 1 }}>
        <Title
          level={4}
          style={{
            color: "#fff",
            margin: 0,
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          {Array.isArray(item.type) ? item.type[0] : item.type}
        </Title>
      </div>
    </>
  );
};

export default DataCardCollapsed;
