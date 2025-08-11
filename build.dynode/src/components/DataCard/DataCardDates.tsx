import React from "react";
import { Typography } from "antd";
import type { DataCardItem } from "./types";
import { formatDate } from "./utils";

const { Text } = Typography;

interface DataCardDatesProps {
  item: DataCardItem;
}

const DataCardDates: React.FC<DataCardDatesProps> = ({ item }) => {
  return (
    <div
      style={{
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: "11px",
          color: "#666",
          lineHeight: "1.4",
        }}
      >
        {item.created && item.updated && (
          <>
            Created: {formatDate(item.created)} • Updated:{" "}
            {formatDate(item.updated)}
          </>
        )}
      </Text>
      <Text
        style={{
          fontSize: "11px",
          color: "#666",
          fontFamily: "monospace",
        }}
      >
        ID: {item._id || "N/A"}
      </Text>
    </div>
  );
};

export default DataCardDates;
