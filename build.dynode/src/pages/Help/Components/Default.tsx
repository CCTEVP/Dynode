import React, { useState, useEffect, Suspense, lazy } from "react";
import { Row, Typography, Spin, Alert } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

// Lazy load heavy components
const DataCard = lazy(() =>
  import("../../../components/DataCard").then((module) => ({
    default: module.DataCard,
  }))
);
const ComponentFilter = lazy(() =>
  import("../../../components/ComponentFilter").then((module) => ({
    default: module.ComponentFilter,
  }))
);

// Import types normally (they don't add to bundle size)
import type { DataCardItem } from "../../../components/DataCard";

const { Title, Paragraph } = Typography;

const COMPONENTS_API_URL =
  import.meta.env.MODE === "production"
    ? "/api/data/components"
    : import.meta.env.VITE_SOURCE_API_URL
    ? `${import.meta.env.VITE_SOURCE_API_URL}/data/components`
    : "http://localhost:3000/data/components";

const Components: React.FC = () => {
  const [components, setComponents] = useState<DataCardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentFilter = searchParams.get("type") || "all";

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        setLoading(true);

        let url = COMPONENTS_API_URL;
        if (currentFilter !== "all") {
          url += `?type=${currentFilter}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setComponents(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch components"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, [currentFilter]);

  const handleFilterChange = (value: string) => {
    if (value === "all") {
      navigate(window.location.pathname, { replace: true });
    } else {
      navigate(`${window.location.pathname}?type=${value}`, { replace: true });
    }
  };

  const handleCardClick = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  const handleViewDetails = (_item: DataCardItem) => {
    // Navigate to detail view or open modal here
  };

  const getPageTitle = () => {
    switch (currentFilter) {
      case "layout":
        return "Layout Components";
      case "widget":
        return "Widget Components";
      default:
        return "All Components";
    }
  };

  const getPageDescription = () => {
    switch (currentFilter) {
      case "layout":
        return "Explore our collection of layout components designed to help structure your application.";
      case "widget":
        return "Discover interactive widget components for enhanced user experiences.";
      default:
        return "Browse all available components in our library.";
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
        <Alert
          message="Error loading components"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: "16px" }}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <Title level={1}>{getPageTitle()}</Title>
      <Paragraph
        style={{
          fontSize: "16px",
          color: "#666",
          marginBottom: "24px",
        }}
      >
        {getPageDescription()}
      </Paragraph>

      <Suspense fallback={<Spin size="small" />}>
        <ComponentFilter
          currentFilter={currentFilter}
          onFilterChange={handleFilterChange}
        />
      </Suspense>

      {components.length === 0 ? (
        <Alert message="No components found" type="info" showIcon />
      ) : (
        <Suspense fallback={<Spin size="large" />}>
          <Row gutter={[16, 16]}>
            {components.map((component, index) => (
              <DataCard
                key={component._id || `component-${index}`}
                item={component}
                index={index}
                isExpanded={expandedCard === index}
                onCardClick={() => handleCardClick(index)}
                onViewDetails={handleViewDetails}
              />
            ))}
          </Row>
        </Suspense>
      )}
    </div>
  );
};

export default Components;
