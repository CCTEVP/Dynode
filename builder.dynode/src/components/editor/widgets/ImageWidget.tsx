import React from "react";
import type { ImageWidget as ImageWidgetType } from "./types";
import { BaseWidget } from "./BaseWidget";
import type { Creative } from "../../../types/creative";
import env from "../../../../config/env";
// Use external origin for browser asset URLs; internal base is not browser-resolvable.
const RENDER_BASE =
  env.env === "docker"
    ? env.externalOrigins.render // still expose host-mapped port to browser
    : env.externalOrigins.render;

interface ImageWidgetProps {
  widget: ImageWidgetType;
  creative?: Creative;
  additionalProps?: React.HTMLAttributes<HTMLDivElement>;
  // No children prop - ImageWidget cannot be a parent
}

export const ImageWidget: React.FC<ImageWidgetProps> = ({
  widget,
  creative,
  additionalProps = {},
}) => {
  const primaryPath = widget.source.paths?.[0];

  // Try to resolve asset path from creative.resources.assets by matching the source._id
  let imageUrl = "#";

  if (creative && creative.resources && creative.resources.assets) {
    const assets = creative.resources.assets as Record<string, any>;
    // Find asset that references the same source._id
    const matchKey = Object.keys(assets).find((k) => {
      const a = assets[k];
      if (!a || !a.paths) return false;
      // asset paths may already contain the full path starting with /dynamics/
      return a.paths.some(
        (p: string) =>
          p.includes(widget.source._id.$oid) ||
          p.includes(primaryPath?.filename || "")
      );
    });

    if (matchKey) {
      const asset = assets[matchKey];
      const p = asset.paths?.[0];
      if (p) imageUrl = `${RENDER_BASE}${p}`;
    }
  }

  // Fallback to constructing URL from parent id and filename
  if (imageUrl === "#") {
    const creativeId = widget.parent?.[0]?.$oid || "";
    imageUrl = primaryPath
      ? `${RENDER_BASE}/dynamics/${creativeId}/${primaryPath.filename}.opt.${primaryPath.extension}`
      : "#";
  }

  return (
    <BaseWidget widget={widget} additionalProps={additionalProps}>
      <img
        src={imageUrl}
        alt={widget.identifier}
        data-name={widget.identifier}
      />
    </BaseWidget>
  );
};

export default ImageWidget;
