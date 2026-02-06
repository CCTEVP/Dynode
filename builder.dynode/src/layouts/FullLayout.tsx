import React from "react";
import { Layout } from "antd";
import type { PropsWithChildren } from "react";
import ThemeSwitch from "../components/controls/ThemeSwitch";

const { Content } = Layout;

const FullLayout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ padding: 0, margin: 0 }}>
        <ThemeSwitch />
        {children}
      </Content>
    </Layout>
  );
};

export default FullLayout;
