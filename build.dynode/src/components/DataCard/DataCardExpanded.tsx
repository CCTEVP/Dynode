import React from "react";
import type { DataCardItem } from "./types";
import DataCardHeader from "./DataCardHeader";
import DataCardDates from "./DataCardDates";
import DataCardInfo from "./DataCardInfo";
import DataCardCollapse from "./DataCardCollapse";
import DataCardActions from "./DataCardActions";

interface DataCardExpandedProps {
  item: DataCardItem;
  index: number;
  onClose: () => void;
  onViewDetails: (item: DataCardItem) => void;
}

const DataCardExpanded: React.FC<DataCardExpandedProps> = ({
  item,
  index,
  onClose,
  onViewDetails,
}) => {
  return (
    <div style={{ width: "100%" }}>
      <DataCardHeader item={item} index={index} onClose={onClose} />
      <DataCardDates item={item} />
      <DataCardInfo item={item} />
      <DataCardCollapse item={item} />
      <DataCardActions item={item} onViewDetails={onViewDetails} />
    </div>
  );
};

export default DataCardExpanded;
