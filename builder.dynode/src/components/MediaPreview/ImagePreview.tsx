import React from "react";
import { Image } from "antd";

interface ImagePreviewProps {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  url,
  alt = "Image preview",
  width = 200,
  height = 150,
}) => {
  return (
    <Image
      src={url}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: "cover" }}
      preview={{
        mask: "Click to preview",
      }}
    />
  );
};

export default ImagePreview;
