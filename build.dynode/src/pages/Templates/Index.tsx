import React, { useEffect } from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

const Templates: React.FC = () => {
  useEffect(() => {
    const searchHandler = (e: any) => {
      // placeholder: pages can react to header search via this event
      // eslint-disable-next-line no-console
      console.log("Templates search:", e.detail);
    };
    window.addEventListener("search", searchHandler as EventListener);
    return () =>
      window.removeEventListener("search", searchHandler as EventListener);
  }, []);

  return (
    <div style={{ fontSize: "90%" }}>
      <div style={{ width: "100%", margin: 0, padding: "32px 0" }}>
        <Card
          bordered={false}
          style={{
            display: "flex",
            flexDirection: "column",
            margin: 0,
            width: "100%",
            maxWidth: "100%",
            background: "transparent",
            boxShadow: "none",
            borderRadius: 0,
            border: "none",
            padding: 0,
          }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%",
            background: "transparent",
            padding: 0,
            border: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Templates
              </Title>
              <Text type="secondary">Templates content placeholder.</Text>
            </div>
          </div>

          <div style={{ minHeight: 300 }} />
        </Card>
      </div>
    </div>
  );
};

export default Templates;
