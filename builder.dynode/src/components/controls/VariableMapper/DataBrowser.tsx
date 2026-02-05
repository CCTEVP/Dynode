import React, { useState, useRef, useEffect } from "react";
import { Button, Spin, Tree, App, theme } from "antd";
import { EyeOutlined, CloseOutlined } from "@ant-design/icons";
import type { DataNode } from "antd/es/tree";

interface DataBrowserProps {
  sampleData?: any;
  onSelect: (path: string, value: any) => void;
  onFetchData?: () => Promise<any>;
  autoOpen?: boolean;
  onAutoOpenComplete?: () => void;
}

const DataBrowser: React.FC<DataBrowserProps> = ({
  sampleData,
  onSelect,
  onFetchData,
  autoOpen = false,
  onAutoOpenComplete,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(sampleData);
  const buttonRef = useRef<HTMLDivElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const { message } = App.useApp();
  const { token } = theme.useToken();

  React.useEffect(() => {
    if (autoOpen && !visible) {
      setVisible(true);
      onAutoOpenComplete?.();
    }
  }, [autoOpen]);

  const buildTreeData = (obj: any, path: string = ""): DataNode[] => {
    if (obj === null || obj === undefined) {
      return [];
    }

    // Handle JSON Schema format
    if (obj.type === "object" && obj.properties) {
      return Object.keys(obj.properties).map((key) => {
        const propSchema = obj.properties[key];
        const currentPath = path ? `${path}.${key}` : key;
        const propType = propSchema.type || "unknown";
        const hasChildren =
          propType === "object" ||
          propType === "array" ||
          propSchema.properties;

        return {
          title: (
            <span>
              <span style={{ fontWeight: 500 }}>{key}</span>
              <span style={{ color: token.colorTextSecondary, marginLeft: 8 }}>
                ({propType})
              </span>
            </span>
          ),
          key: currentPath,
          children: hasChildren
            ? buildTreeData(propSchema, currentPath)
            : undefined,
          isLeaf: !hasChildren,
        };
      });
    }

    // Handle JSON Schema array type
    if (obj.type === "array" && obj.items) {
      const itemType = obj.items.type || "unknown";
      const hasChildren =
        itemType === "object" || itemType === "array" || obj.items.properties;

      if (hasChildren) {
        return buildTreeData(obj.items, `${path}[0]`);
      }
      return [];
    }

    // Fallback for raw data (non-schema)
    if (typeof obj !== "object") {
      return [];
    }

    if (Array.isArray(obj)) {
      return obj.map((item, index) => {
        const currentPath = path ? `${path}[${index}]` : `[${index}]`;
        const isLeaf = typeof item !== "object" || item === null;

        return {
          title: (
            <span>
              <span style={{ color: token.colorTextSecondary }}>[{index}]</span>
              {isLeaf && (
                <span style={{ color: token.colorTextTertiary, marginLeft: 8 }}>
                  : {JSON.stringify(item)}
                </span>
              )}
            </span>
          ),
          key: currentPath,
          children: isLeaf ? undefined : buildTreeData(item, currentPath),
          isLeaf,
        };
      });
    }

    return Object.keys(obj).map((key) => {
      const value = obj[key];
      const currentPath = path ? `${path}.${key}` : key;
      const isLeaf = typeof value !== "object" || value === null;
      const valueType = Array.isArray(value) ? "array" : typeof value;

      return {
        title: (
          <span>
            <span style={{ fontWeight: 500 }}>{key}</span>
            <span style={{ color: token.colorTextSecondary, marginLeft: 8 }}>
              ({valueType}){isLeaf && `: ${JSON.stringify(value)}`}
            </span>
          </span>
        ),
        key: currentPath,
        children: isLeaf ? undefined : buildTreeData(value, currentPath),
        isLeaf,
      };
    });
  };

  const handleOpen = async () => {
    setVisible(true);

    if (!data && onFetchData) {
      setLoading(true);
      try {
        const fetchedData = await onFetchData();
        const actualData = fetchedData?.data || fetchedData;
        setData(actualData);
      } catch (error) {
        message.error("Failed to fetch sample data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Close on click outside
  useEffect(() => {
    if (!visible) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        floatingRef.current &&
        !floatingRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible]);

  const handleSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const path = selectedKeys[0] as string;
      onSelect(path, null);
      message.success(`Selected: ${path}`);
      setVisible(false);
    }
  };

  const treeData = data ? buildTreeData(data) : [];

  return (
    <>
      <div ref={buttonRef} style={{ display: "inline-block" }}>
        <Button
          htmlType="button"
          icon={<EyeOutlined />}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleOpen();
          }}
          title="Browse sample data"
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          Browse
        </Button>
      </div>

      {visible && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              zIndex: 1000,
            }}
          />

          {/* Floating Window */}
          <div
            ref={floatingRef}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "800px",
              maxWidth: "90vw",
              maxHeight: "80vh",
              backgroundColor: token.colorBgElevated,
              borderRadius: "8px",
              boxShadow:
                "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
              zIndex: 1001,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: `1px solid ${token.colorBorderSecondary}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: token.colorText,
                }}
              >
                Browse Sample Data - Click on a node to select
              </div>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => setVisible(false)}
                style={{ marginRight: -8 }}
              />
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "40px" }}>
                  <Spin size="large" />
                  <p style={{ marginTop: 16 }}>Fetching sample data...</p>
                </div>
              ) : data ? (
                <Tree
                  treeData={treeData}
                  defaultExpandAll={false}
                  onSelect={handleSelect}
                  selectable
                  showLine
                />
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: token.colorTextSecondary,
                  }}
                >
                  <p>No sample data available</p>
                  <p>Test the endpoint first to see sample data</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "10px 16px",
                textAlign: "right",
              }}
            >
              <Button onClick={() => setVisible(false)}>Close</Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DataBrowser;
