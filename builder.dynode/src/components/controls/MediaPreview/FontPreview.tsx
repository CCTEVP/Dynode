import React, { useEffect } from "react";
import { Card, Typography } from "antd";

const { Text } = Typography;

interface FontPreviewProps {
  url: string;
  fontName: string;
  sampleText?: string;
}

const FontPreview: React.FC<FontPreviewProps> = ({
  url,
  fontName,
  sampleText = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 0123456789",
}) => {
  const fontFamilyName = `preview-font-${fontName.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    // Inject font-face rule
    const styleId = `font-preview-${fontFamilyName}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      @font-face {
        font-family: '${fontFamilyName}';
        src: url('${url}');
      }
    `;

    return () => {
      // Cleanup on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [url, fontFamilyName]);

  return (
    <Card size="small" style={{ marginTop: 8 }}>
      <div
        style={{ fontFamily: fontFamilyName, fontSize: 16, lineHeight: 1.6 }}
      >
        {sampleText}
      </div>
      <Text
        type="secondary"
        style={{ display: "block", marginTop: 8, fontSize: 12 }}
      >
        Font: {fontName}
      </Text>
    </Card>
  );
};

export default FontPreview;
