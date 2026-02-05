import React from "react";
import { Typography } from "antd";

const { Title } = Typography;

const TestCodebasePage: React.FC = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Test Codebase Page</Title>
      <p>If you see this, the route is working.</p>
    </div>
  );
};

export default TestCodebasePage;
