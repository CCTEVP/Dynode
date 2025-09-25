import React, { useEffect, useRef } from "react";
import type { VideoWidget as VideoWidgetType } from "./types";
import { BaseWidget } from "./BaseWidget";

const RENDER_BASE =
  (import.meta.env && (import.meta.env.VITE_RENDER_BASE_URL as string)) ||
  process.env.VITE_RENDER_BASE_URL ||
  "http://localhost:5000";

interface VideoWidgetProps {
  widget: VideoWidgetType;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
  creative?: any;
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
    const creativeId =
      (creative && (creative as any)?._id && (creative as any)._id.$oid) ||
      widget.parent?.[0]?.$oid ||
      "";
    console.debug("[VideoWidget] resolving asset", { creativeId, primaryPath });
    sourceUrl = primaryPath
      ? `http://localhost:5000/dynamics/${creativeId}/${primaryPath.filename}.opt.${primaryPath.extension}`
      : "#";
    console.debug("[VideoWidget] resolved fallback sourceUrl", sourceUrl);
  }

  console.debug("[VideoWidget] final sourceUrl", sourceUrl);

  const srcRef = useRef<HTMLSourceElement | null>(null);
  useEffect(() => {
    if (srcRef.current) {
      srcRef.current.src = sourceUrl;
      srcRef.current.setAttribute("data-debug-src", sourceUrl);
    }
  }, [sourceUrl]);

  return (
    <BaseWidget widget={widget} additionalProps={additionalProps}>
      <video
        controls={!widget.attributes.includes("fullscreen")}
        style={{ width: "100%", height: "100%", zIndex: 1 }}
        data-source-id={widget.source._id.$oid}
        data-source-kind={widget.source.kind}
        data-source-name={widget.source.name}
        data-source-url={sourceUrl}
        data-render-base={RENDER_BASE}
        data-mime-type={primaryPath?.mime}
        data-filename={primaryPath?.filename}
      >
        <source
          ref={srcRef}
          src={sourceUrl}
          type={primaryPath?.mime || "video/mp4"}
          data-debug-src={sourceUrl}
        />
        Your browser does not support the video tag.
      </video>
    </BaseWidget>
  );
};

export default VideoWidget;
