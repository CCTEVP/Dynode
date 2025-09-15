import React from "react";
import { Layout } from "antd";
import type { PropsWithChildren } from "react";

const { Content } = Layout;

const FullLayout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 0, margin: 0 }}>{children}</Content>
    </Layout>
  );
};

export default FullLayout;
