import { Layout, Menu, Avatar, Button, Space, Input } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  FolderOpenOutlined,
  FileAddOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const { Sider, Header, Content } = Layout;

import React from "react";
import type { PropsWithChildren } from "react";

const MainLayout: React.FC<PropsWithChildren<{}>> = ({ children }) => {
  const location = useLocation();
  const path = location.pathname;

  // derive selected key from pathname so /creatives/123 still maps to 'creatives'
  const selectedKey =
    path === "/"
      ? "home"
      : path.startsWith("/creatives")
      ? "creatives"
      : path.startsWith("/community")
      ? "community"
      : path.startsWith("/templates")
      ? "templates"
      : "home";

  const items = [
    {
      key: "home",
      icon: <FolderOpenOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: "creatives",
      icon: <FileAddOutlined />,
      label: <Link to="/creatives">My Creatives</Link>,
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
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        width={265}
        style={{
          background: "#f7f7f7",
          padding: "0 0 16px 0",
          minWidth: 220,
          maxWidth: 265,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", padding: 24 }}>
          <Avatar style={{ background: "#d4a62a", marginRight: 12 }} size={40}>
            E
          </Avatar>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Erick</div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
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
          <Space direction="vertical" style={{ width: "100%" }}>
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
              background: "#f7f3ff",
              color: "#7c3aed",
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
          {/* render the header differently depending on the active section
              - Home and Creatives: show Folder title + New Folder + Search
              - Community and Templates: show Search only (aligned right)
          */}
          {(selectedKey === "home" || selectedKey === "creatives") && (
            <Header style={{ background: "#f5f5f5", padding: "0" }}>
              <div style={{ width: "100%", margin: 0, padding: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h4 style={{ margin: 0 }}>Folder</h4>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginLeft: 16 }}
                    onClick={() =>
                      (window as any).dispatchEvent(new Event("openNewFolder"))
                    }
                  >
                    + New Folder
                  </Button>

                  <div style={{ flex: 1 }} />

                  <Input
                    placeholder="Enter keywords here..."
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    onChange={(e) =>
                      (window as any).dispatchEvent(
                        new CustomEvent("search", {
                          detail: (e.target as HTMLInputElement).value,
                        })
                      )
                    }
                    allowClear
                  />
                </div>
              </div>
            </Header>
          )}

          {(selectedKey === "community" || selectedKey === "templates") && (
            <Header style={{ background: "#f5f5f5", padding: "0" }}>
              <div style={{ width: "100%", margin: 0, padding: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <h4 style={{ margin: 0 }}>Folder</h4>

                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    style={{ marginLeft: 16 }}
                    onClick={() =>
                      (window as any).dispatchEvent(new Event("openNewFolder"))
                    }
                  >
                    + New Folder
                  </Button>

                  <div style={{ flex: 1 }} />

                  <Input
                    placeholder="Enter keywords here..."
                    prefix={<SearchOutlined />}
                    style={{ width: 300 }}
                    onChange={(e) =>
                      (window as any).dispatchEvent(
                        new CustomEvent("search", {
                          detail: (e.target as HTMLInputElement).value,
                        })
                      )
                    }
                    allowClear
                  />
                </div>
              </div>
            </Header>
          )}

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
