import React, { useState } from "react";
import { Button, Card, Modal, Typography } from "antd";
import { ThunderboltOutlined, ExportOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const sampleCreatives = [
  { id: "1", title: "Creative", updated: "3 hours ago" },
  { id: "2", title: "Creative", updated: "3 hours ago" },
  { id: "3", title: "Creative", updated: "3 hours ago" },
  { id: "4", title: "Creative", updated: "3 hours ago" },
];
const sampleCommunity = [
  { id: "c1", title: "Sample 01", updated: "-" },
  { id: "c2", title: "Sample 02", updated: "-" },
  { id: "c3", title: "Sample 03", updated: "-" },
];
const sampleExplore = [
  { id: "e1", title: "", updated: "-" },
  { id: "e2", title: "", updated: "-" },
  { id: "e3", title: "", updated: "-" },
];

const Home: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredCreatives = searchTerm
    ? sampleCreatives.filter((c) =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sampleCreatives;

  React.useEffect(() => {
    const openHandler = () => setModalOpen(true);
    const searchHandler = (e: any) => setSearchTerm(e.detail || "");

    window.addEventListener("openNewFolder", openHandler as EventListener);
    window.addEventListener("search", searchHandler as EventListener);

    return () => {
      window.removeEventListener("openNewFolder", openHandler as EventListener);
      window.removeEventListener("search", searchHandler as EventListener);
    };
  }, []);
  return (
    <div style={{ fontSize: "90%" }}>
      <div style={{ width: "100%", margin: 0, padding: "32px 0" }}>
        <div style={{ background: "transparent", padding: "0 0 32px 0" }}>
          <div style={{ width: "100%", margin: 0, padding: 0 }}>
            <Title level={4} style={{ color: "#222", marginBottom: 16 }}>
              Recent
            </Title>

            <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
              <div
                style={{
                  background: "#555",
                  borderRadius: 12,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  flex: "0 0 260px",
                }}
              >
                <Button
                  block
                  icon={<ThunderboltOutlined />}
                  style={{ background: "#222", color: "#fff", height: 48 }}
                  onClick={() => navigate("/Creatives/Create")}
                >
                  Dynamic Creative
                </Button>
                <Button
                  block
                  icon={<ThunderboltOutlined />}
                  style={{ background: "#222", color: "#fff", height: 48 }}
                  onClick={() => navigate("/Creatives/Create")}
                >
                  Interactive Creative
                </Button>
                <Button
                  block
                  icon={<ExportOutlined />}
                  style={{ background: "#222", color: "#fff", height: 48 }}
                  onClick={() => navigate("/Creatives/Create")}
                >
                  Export Creative
                </Button>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 24,
                  flexWrap: "nowrap",
                  alignItems: "flex-start",
                  flex: 1,
                  overflow: "hidden",
                }}
              >
                {filteredCreatives.map((c) => (
                  <div key={c.id} style={{ flex: "0 0 260px", width: 260 }}>
                    <Card
                      hoverable
                      style={{
                        minHeight: 180,
                        borderRadius: 12,
                        background: "#fff",
                        padding: 16,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        cursor: "pointer",
                        width: "100%",
                      }}
                      onClick={() => navigate(`/Editor/Creatives/${c.id}`)}
                    >
                      <Card.Meta
                        title={c.title}
                        description={`Updated ${c.updated}`}
                      />
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            <Title level={4} style={{ color: "#222", margin: "32px 0 16px 0" }}>
              Examples from Community
            </Title>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 260px)",
                gap: 16,
                justifyContent: "start",
                alignItems: "start",
              }}
            >
              {sampleCommunity.map((c) => (
                <Card
                  key={c.id}
                  hoverable
                  style={{
                    minHeight: 160,
                    borderRadius: 12,
                    background: "#fff",
                    padding: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    width: "100%",
                    maxWidth: 260,
                  }}
                >
                  <Card.Meta
                    title={c.title}
                    description={`Updated ${c.updated}`}
                  />
                </Card>
              ))}
            </div>

            <Title level={4} style={{ color: "#222", margin: "32px 0 16px 0" }}>
              Explore
            </Title>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 260px)",
                gap: 16,
                justifyContent: "start",
                alignItems: "start",
              }}
            >
              {sampleExplore.map((c) => (
                <Card
                  key={c.id}
                  hoverable
                  style={{
                    minHeight: 160,
                    borderRadius: 12,
                    background: "#fff",
                    padding: 16,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    width: "100%",
                    maxWidth: 260,
                  }}
                >
                  <Card.Meta
                    title={c.title}
                    description={`Updated ${c.updated}`}
                  />
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Modal
          title="Create New Folder"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
        >
          <p>
            This is a simulated modal. Folder creation endpoint is not available
            yet.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default Home;
