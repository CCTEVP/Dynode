import React from "react";
import ImagePreview from "./ImagePreview";
import VideoPreview from "./VideoPreview";
import FontPreview from "./FontPreview";
import { Typography } from "antd";
import env from "../../../config/env";
import type { AssetPath } from "../../types/assets";

const { Text } = Typography;

interface MediaPreviewProps {
  path: AssetPath;
  kind: "image" | "video" | "font" | "other";
  creativeId?: string;
  assetName?: string;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({
  path,
  kind,
  creativeId,
  assetName,
}) => {
  // Construct URL based on environment
  const baseUrl =
    env.env === "docker"
      ? "/api"
      : env.externalOrigins.render || "http://localhost:5555";

  // If we have a creativeId, use the dynamics route pattern
  // Otherwise, use direct source.dynode file serving
  const url = creativeId
    ? `${baseUrl}/dynamics/${creativeId}/${path.filename}.${path.extension}`
    : `${env.env === "docker" ? "/api" : env.externalOrigins.source}/files/assets/${path.filename}.${path.extension}`;

  switch (kind) {
    case "image":
      return <ImagePreview url={url} alt={assetName || path.filename} />;
    case "video":
      return <VideoPreview url={url} />;
    case "font":
      return <FontPreview url={url} fontName={assetName || path.filename} />;
    default:
      return (
        <div
          style={{ padding: 16, backgroundColor: "#f5f5f5", borderRadius: 4 }}
        >
          <Text type="secondary">
            {path.filename}.{path.extension} ({path.mime})
          </Text>
        </div>
      );
  }
};

export default MediaPreview;
