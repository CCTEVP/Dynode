import { Layout, Menu, Avatar, Button, Space, Tooltip } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  TeamOutlined,
  ThunderboltOutlined,
  ShareAltOutlined,
  QuestionCircleOutlined,
  BranchesOutlined,
  HighlightOutlined,
  ProductOutlined,
  SnippetsOutlined,
  HomeOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import { useTheme } from "../contexts/ThemeContext";

const { Sider, Content } = Layout;

import React from "react";
import type { PropsWithChildren } from "react";

const MainLayout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;
  const { themeMode, toggleTheme } = useTheme();

  // derive selected key from pathname so /creatives/123 still maps to 'creatives'
  const selectedKey =
    path === "/"
      ? "home"
      : path.startsWith("/creatives")
        ? "creatives"
        : path.startsWith("/sources")
          ? "sources"
          : path.startsWith("/assets")
            ? "assets"
            : path.startsWith("/community")
              ? "community"
              : path.startsWith("/templates")
                ? "templates"
                : path.startsWith("/help/components")
                  ? "/help/components"
                  : path.startsWith("/help/design")
                    ? "/help/design"
                    : path.startsWith("/help/codebase")
                      ? "/help/codebase"
                      : path.startsWith("/help")
                        ? "help"
                        : "home";

  // Keep Help menu open when on a help page
  const openKeys = path.startsWith("/help") ? ["help"] : [];

  const items = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: "creatives",
      icon: <SnippetsOutlined />,
      label: <Link to="/creatives">My Creatives</Link>,
    },
    {
      key: "sources",
      icon: <BranchesOutlined />,
      label: <Link to="/sources">My Sources</Link>,
    },
    {
      key: "assets",
      icon: <DatabaseOutlined />,
      label: <Link to="/assets">My Assets</Link>,
    },
    {
      key: "community",
      icon: <TeamOutlined />,
      label: <Link to="/community">Community</Link>,
    },
    {
      key: "templates",
      icon: <ThunderboltOutlined />,
      label: <Link to="/templates">Templates</Link>,
    },
    {
      type: "divider" as const,
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Help",
      children: [
        {
          key: "/help/components",
          icon: <ProductOutlined />,
          label: <Link to="/help/components">Components</Link>,
        },
        {
          key: "/help/design",
          icon: <HighlightOutlined />,
          label: <Link to="/help/design">Design</Link>,
        },
        {
          key: "/help/codebase",
          icon: <ShareAltOutlined />,
          label: <Link to="/help/codebase">Codebase Map</Link>,
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", width: "100%", maxWidth: "100vw" }}>
      <Sider
        width={265}
        style={{
          background: themeMode === "dark" ? "#1f1f1f" : "#f7f7f7",
          padding: "0 0 16px 0",
          minWidth: 220,
          maxWidth: 265,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Avatar
              style={{ background: "#d4a62a", marginRight: 12 }}
              size={40}
            >
              E
            </Avatar>
            <div
              style={{
                fontWeight: 700,
                fontSize: 18,
                color:
                  themeMode === "dark"
                    ? "rgba(255, 255, 255, 0.85)"
                    : "rgba(0, 0, 0, 0.88)",
              }}
            >
              Erick
            </div>
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          items={items}
          style={{ border: "none", background: "transparent" }}
        />

        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 0,
            width: "100%",
            padding: "0 16px",
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="small">
            <Button type="link" style={{ textAlign: "left", width: "100%" }}>
              Documentation
            </Button>
            <Button type="link" style={{ textAlign: "left", width: "100%" }}>
              Support
            </Button>
          </Space>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 0,
            width: "100%",
            padding: "0 16px",
          }}
        >
          <Button
            type="text"
            style={{
              width: "100%",
              background: themeMode === "dark" ? "#2d1f4a" : "#f7f3ff",
              color: themeMode === "dark" ? "#a78bfa" : "#7c3aed",
              fontWeight: 700,
            }}
          >
            Project DYNODE
          </Button>
        </div>
      </Sider>

      <Layout>
        {/* remove top padding so Header sits flush at the top of the content area */}
        <Content style={{ padding: "0 32px 32px 32px" }}>
          <Tooltip
            title={`Switch to ${themeMode === "dark" ? "Light" : "Dark"} Mode`}
            placement="left"
            color="rgba(0, 0, 0, 0.85)"
          >
            <button
              onClick={toggleTheme}
              className="theme-toggle-corner"
              data-mode={themeMode}
              aria-label="Toggle theme"
            >
              <span className="theme-toggle-track" />
              <span className="theme-toggle-knob">
                <span className="theme-toggle-icon">
                  {themeMode === "dark" ? "🌙" : "☀️"}
                </span>
              </span>
            </button>
          </Tooltip>
          {/* render the header differently depending on the active section
              - Home: show Folder title + New Folder + Search
              - Community and Templates: show Search only (aligned right)
          */}
          <main>
            {/* Outlet will be placed where page-specific content should render */}
            {children}
          </main>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
