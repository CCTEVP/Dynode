import {
  LayoutOutlined,
  AppstoreOutlined,
  BlockOutlined,
} from "@ant-design/icons";

export const formatObjectForDisplay = (obj: Record<string, any>) => {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value}`)
    .join(";\n");
};

export const formatDate = (dateString: string) => {
  try {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  } catch {
    return "Invalid Date";
  }
};

export const getTypeIcon = (type: any) => {
  const typeValue = Array.isArray(type) ? type[0] : type;
  const typeStr = String(typeValue || "").toLowerCase();

  switch (typeStr) {
    case "layout":
    case "slidelayout":
      return <LayoutOutlined style={{ fontSize: "24px", color: "#fff" }} />;
    case "widget":
    case "imagewidget":
    case "videowidget":
    case "textwidget":
    case "cardwidget":
    case "countdownwidget":
      return <AppstoreOutlined style={{ fontSize: "24px", color: "#fff" }} />;
    case "boxlayout":
      return <LayoutOutlined style={{ fontSize: "24px", color: "#fff" }} />;
    default:
      return <BlockOutlined style={{ fontSize: "24px", color: "#fff" }} />;
  }
};

export const getCardColor = (_type: string | string[], index: number) => {
  const colors = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #3fc5beff 0%, #fed6e3 100%)",
  ];
  return colors[index % colors.length];
};
