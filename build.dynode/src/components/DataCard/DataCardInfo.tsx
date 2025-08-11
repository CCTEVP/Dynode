import React from "react";
import { Typography } from "antd";
import type { DataCardItem } from "./types";

const { Text } = Typography;

interface DataCardInfoProps {
  item: DataCardItem;
}

const DataCardInfo: React.FC<DataCardInfoProps> = ({ item }) => {
  return (
    <div style={{ marginBottom: "16px" }}>
      <Text type="secondary" style={{ display: "block", marginBottom: "8px" }}>
        Identifier:{" "}
        {Array.isArray(item.identifier) ? item.identifier[0] : item.identifier}
      </Text>

      {item.order !== undefined && (
        <Text
          type="secondary"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Order: {item.order}
        </Text>
      )}

      {item.status && (
        <Text
          type="secondary"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Status: {item.status}
        </Text>
      )}

      {item.classes && (
        <Text
          type="secondary"
          style={{ display: "block", marginBottom: "8px" }}
        >
          Classes: {item.classes || "None"}
        </Text>
      )}
    </div>
  );
};

export default DataCardInfo;
