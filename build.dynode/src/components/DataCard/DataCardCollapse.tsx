import React from "react";
import { Collapse, Space, Typography } from "antd";
import {
  CodeOutlined,
  BgColorsOutlined,
  LayoutOutlined,
} from "@ant-design/icons";
import type { DataCardItem } from "./types";
import { formatObjectForDisplay } from "./utils";

const { Text } = Typography;

interface DataCardCollapseProps {
  item: DataCardItem;
}

const DataCardCollapse: React.FC<DataCardCollapseProps> = ({ item }) => {
  const collapseItems = [];

  // Styles section (if exists)
  if (item.styles && Object.keys(item.styles).length > 0) {
    collapseItems.push({
      key: "styles",
      label: (
        <Space>
          <BgColorsOutlined />
          <Text style={{ fontSize: "12px" }}>
            Styles ({Object.keys(item.styles).length} properties)
          </Text>
        </Space>
      ),
      children: (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxHeight: "200px",
            overflow: "auto",
            whiteSpace: "pre-line",
          }}
        >
          {formatObjectForDisplay(item.styles)}
        </div>
      ),
    });
  }

  // Attributes section (if exists)
  if (item.attributes && item.attributes.length > 0) {
    collapseItems.push({
      key: "attributes",
      label: (
        <Space>
          <CodeOutlined />
          <Text style={{ fontSize: "12px" }}>
            Attributes ({item.attributes.length} items)
          </Text>
        </Space>
      ),
      children: (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(item.attributes, null, 2)}
        </div>
      ),
    });
  }

  // Parent section (if exists)
  if (item.parent && item.parent.length > 0) {
    collapseItems.push({
      key: "parent",
      label: (
        <Space>
          <LayoutOutlined />
          <Text style={{ fontSize: "12px" }}>
            Parent ({item.parent.length} items)
          </Text>
        </Space>
      ),
      children: (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(item.parent, null, 2)}
        </div>
      ),
    });
  }

  // Changes section (if exists)
  if (item.changes && item.changes.length > 0) {
    collapseItems.push({
      key: "changes",
      label: (
        <Space>
          <BgColorsOutlined />
          <Text style={{ fontSize: "12px" }}>
            Changes ({item.changes.length} items)
          </Text>
        </Space>
      ),
      children: (
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "12px",
            maxHeight: "200px",
            overflow: "auto",
          }}
        >
          {JSON.stringify(item.changes, null, 2)}
        </div>
      ),
    });
  }

  // If no collapsible items, return null
  if (collapseItems.length === 0) {
    return null;
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Collapse size="small" ghost items={collapseItems} />
    </div>
  );
};

export default DataCardCollapse;
