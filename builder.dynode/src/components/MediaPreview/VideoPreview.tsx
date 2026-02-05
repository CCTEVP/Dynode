import React from "react";

interface VideoPreviewProps {
  url: string;
  width?: number;
  height?: number;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  url,
  width = 400,
  height = 300,
}) => {
  return (
    <video
      src={url}
      controls
      style={{
        width,
        height,
        maxWidth: "100%",
        backgroundColor: "#000",
      }}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPreview;
