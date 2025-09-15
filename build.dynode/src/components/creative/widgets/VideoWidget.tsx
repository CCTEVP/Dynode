import React from "react";
import type { VideoWidget as VideoWidgetType } from "./types";
import { BaseWidget } from "./BaseWidget";
import type { Creative } from "../../../types/creative";

interface VideoWidgetProps {
  widget: VideoWidgetType;
  creative?: Creative;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
  // No children prop - VideoWidget cannot be a parent
}

export const VideoWidget: React.FC<VideoWidgetProps> = ({
  widget,
  creative,
  additionalProps = {},
}) => {
  const primaryPath = widget.source.paths?.[0];

  // Try to resolve asset path from creative.resources.assets
  let sourceUrl = "#";
  if (creative && creative.resources && creative.resources.assets) {
    const assets = creative.resources.assets as Record<string, any>;
    const matchKey = Object.keys(assets).find((k) => {
      const a = assets[k];
      if (!a || !a.paths) return false;
      return a.paths.some(
        (p: string) =>
          p.includes(widget.source._id.$oid) ||
          p.includes(primaryPath?.filename || "")
      );
    });
    if (matchKey) {
      const asset = assets[matchKey];
      const p = asset.paths?.[0];
      if (p) sourceUrl = `http://localhost:5000${p}`;
    }
  }

  if (sourceUrl === "#") {
    const creativeId = widget.parent?.[0]?.$oid || "";
    sourceUrl = primaryPath
      ? `http://localhost:5000/dynamics/${creativeId}/${primaryPath.filename}.opt.${primaryPath.extension}`
      : "#";
  }

  return (
    <BaseWidget widget={widget} additionalProps={additionalProps}>
      <video
        controls={!widget.attributes.includes("fullscreen")}
        style={{ width: "100%", height: "100%" }}
        data-source-id={widget.source._id.$oid}
        data-source-kind={widget.source.kind}
        data-source-name={widget.source.name}
        data-mime-type={primaryPath?.mime}
        data-filename={primaryPath?.filename}
      >
        <source src={sourceUrl} type={primaryPath?.mime || "video/mp4"} />
        Your browser does not support the video tag.
      </video>
    </BaseWidget>
  );
};

export default VideoWidget;
