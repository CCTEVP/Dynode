import React from "react";
import { Card, Col } from "antd";
import type { DataCardItem } from "./types";
import { getCardColor } from "./utils";
import DataCardCollapsed from "./DataCardCollapsed";
import DataCardExpanded from "./DataCardExpanded";

interface DataCardProps {
  item: DataCardItem;
  index: number;
  isExpanded: boolean;
  onCardClick: () => void;
  onViewDetails: (item: DataCardItem) => void;
}

const DataCard: React.FC<DataCardProps> = ({
  item,
  index,
  isExpanded,
  onCardClick,
  onViewDetails,
}) => {
  return (
    <Col
      xs={24}
      sm={isExpanded ? 24 : 12}
      md={isExpanded ? 24 : 8}
      lg={isExpanded ? 24 : 6}
      key={item._id || `item-${index}`}
      style={{
        transition: "all 0.3s ease",
      }}
    >
      <Card
        hoverable
        style={{
          height: isExpanded ? "auto" : "120px",
          background: isExpanded
            ? "#fff"
            : getCardColor(
                Array.isArray(item.type) ? item.type[0] : item.type,
                index
              ),
          border: "none",
          borderRadius: "12px",
          overflow: "hidden",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
        styles={{
          body: {
            padding: isExpanded ? "24px" : "16px",
            height: "100%",
            display: "flex",
            flexDirection: isExpanded ? "column" : "row",
            alignItems: isExpanded ? "flex-start" : "center",
          },
        }}
        onClick={onCardClick}
      >
        {!isExpanded ? (
          <DataCardCollapsed item={item} />
        ) : (
          <DataCardExpanded
            item={item}
            index={index}
            onClose={onCardClick}
            onViewDetails={onViewDetails}
          />
        )}
      </Card>
    </Col>
  );
};

export default DataCard;
