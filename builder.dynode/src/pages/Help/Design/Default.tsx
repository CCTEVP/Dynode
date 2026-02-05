import React, { useState, useMemo } from "react";
import { Typography, Input, Collapse, Space, Tooltip, Select } from "antd";
import * as Icons from "@ant-design/icons";
import { useToast } from "../../../components/controls/Toast";
import { useTheme } from "../../../contexts/ThemeContext";
import "./Default.css";

const { Title, Paragraph } = Typography;

const Design: React.FC = () => {
  const toast = useToast();
  const { themeMode } = useTheme();
  const [iconSearchTerm, setIconSearchTerm] = useState("");
  const [selectedIconTypes, setSelectedIconTypes] = useState<string[]>([
    "Outlined",
    "Filled",
    "TwoTone",
  ]);

  // Memoize tag styles based on theme
  const getTagStyle = useMemo(() => {
    console.log("Design page - Current themeMode:", themeMode);
    return {
      display: "inline-flex",
      alignItems: "center",
      background: themeMode === "dark" ? "#262626" : "#f0f0f0",
      border: `1px solid ${themeMode === "dark" ? "#434343" : "#d9d9d9"}`,
      color:
        themeMode === "dark"
          ? "rgba(255, 255, 255, 0.85)"
          : "rgba(0, 0, 0, 0.88)",
      padding: "0 8px",
      borderRadius: "4px",
      marginInlineEnd: "4px",
      fontSize: "14px",
      lineHeight: "22px",
    };
  }, [themeMode]);

  // Group icons by type
  const iconGroups = useMemo(() => {
    const allIcons = Object.keys(Icons).filter(
      (key) =>
        key !== "default" &&
        key !== "createFromIconfontCN" &&
        key !== "getTwoToneColor" &&
        key !== "setTwoToneColor",
    );

    const groups: { [key: string]: string[] } = {
      Outlined: [],
      Filled: [],
      TwoTone: [],
    };

    allIcons.forEach((iconName) => {
      if (iconName.endsWith("Outlined")) {
        groups.Outlined.push(iconName);
      } else if (iconName.endsWith("Filled")) {
        groups.Filled.push(iconName);
      } else if (iconName.endsWith("TwoTone")) {
        groups.TwoTone.push(iconName);
      }
    });

    return groups;
  }, []);

  // Filter icons based on search term and selected types
  const filteredIconGroups = useMemo(() => {
    const filtered: { [key: string]: string[] } = {};

    Object.entries(iconGroups).forEach(([group, icons]) => {
      // Only include selected types
      if (!selectedIconTypes.includes(group)) return;

      // Filter by search term
      const matchingIcons = iconSearchTerm
        ? icons.filter((icon) =>
            icon.toLowerCase().includes(iconSearchTerm.toLowerCase()),
          )
        : icons;

      if (matchingIcons.length > 0) {
        filtered[group] = matchingIcons;
      }
    });
    return filtered;
  }, [iconGroups, iconSearchTerm, selectedIconTypes]);

  const handleIconClick = (iconName: string) => {
    navigator.clipboard.writeText(iconName);
    toast.info(`Copied: ${iconName}`);
  };

  const renderIconGrid = (icons: string[]) => {
    const isDark = themeMode === "dark";
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
          gap: "12px",
          padding: "16px 0",
        }}
      >
        {icons.map((iconName) => {
          const IconComponent = (Icons as any)[iconName];
          return (
            <Tooltip key={iconName} title={iconName}>
              <div
                onClick={() => handleIconClick(iconName)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "12px",
                  border: isDark ? "1px solid #424242" : "1px solid #f0f0f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  height: "80px",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#1890ff";
                  e.currentTarget.style.backgroundColor = isDark
                    ? "#111d2c"
                    : "#f0f7ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark
                    ? "#424242"
                    : "#f0f0f0";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <IconComponent
                  style={{
                    fontSize: "24px",
                    color: "#1890ff",
                    marginBottom: "8px",
                  }}
                />
                <span
                  style={{
                    fontSize: "11px",
                    textAlign: "center",
                    wordBreak: "break-word",
                    lineHeight: "1.2",
                  }}
                >
                  {iconName}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="design-page"
      style={{ maxWidth: "1400px", margin: "0 auto", padding: "24px" }}
    >
      <Title level={1}>Design Assets</Title>
      <Paragraph style={{ fontSize: "16px" }}>
        Browse and use design assets from the Ant Design framework.
      </Paragraph>

      <div style={{ marginTop: "48px" }}>
        <Title level={2}>Available Icons</Title>
        <Paragraph style={{ fontSize: "16px", marginBottom: "24px" }}>
          Browse all available Ant Design icons. Click any icon to copy its
          component name.
        </Paragraph>

        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
          }}
        >
          <Input
            placeholder="Search icons by name..."
            value={iconSearchTerm}
            onChange={(e) => setIconSearchTerm(e.target.value)}
            allowClear
            style={{ maxWidth: "400px" }}
            prefix={<Icons.SearchOutlined />}
          />
          <Select
            key={`select-${themeMode}`}
            mode="multiple"
            placeholder="Select icon types"
            value={selectedIconTypes}
            onChange={setSelectedIconTypes}
            className="design-page-select"
            style={{ minWidth: "300px" }}
            tagRender={(props) => {
              const { label, closable, onClose } = props;
              console.log(
                "tagRender called, themeMode:",
                themeMode,
                "style:",
                getTagStyle,
              );
              return (
                <span style={getTagStyle}>
                  <span>{label}</span>
                  {closable && (
                    <span
                      onClick={onClose}
                      style={{
                        marginInlineStart: "4px",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      ×
                    </span>
                  )}
                </span>
              );
            }}
            options={[
              { label: "Outlined", value: "Outlined" },
              { label: "Filled", value: "Filled" },
              { label: "Two Tone", value: "TwoTone" },
            ]}
          />
        </div>

        <Collapse
          items={Object.entries(filteredIconGroups).map(([group, icons]) => ({
            key: group,
            label: (
              <Space>
                <span style={{ fontWeight: 600 }}>{group}</span>
                <span style={{ fontSize: "12px", opacity: 0.65 }}>
                  ({icons.length} icons)
                </span>
              </Space>
            ),
            children: renderIconGrid(icons),
          }))}
          defaultActiveKey={["Outlined"]}
          bordered={false}
          style={{ background: "transparent" }}
        />
      </div>
    </div>
  );
};

export default Design;
