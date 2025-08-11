import React from "react";
import { Space, Select, Typography } from "antd";

const { Text } = Typography;
const { Option } = Select;

interface ComponentFilterProps {
  currentFilter: string;
  onFilterChange: (value: string) => void;
}

const ComponentFilter: React.FC<ComponentFilterProps> = ({
  currentFilter,
  onFilterChange,
}) => {
  return (
    <div style={{ marginBottom: "32px" }}>
      <Space>
        <Text strong>Filter by type:</Text>
        <Select
          value={currentFilter}
          onChange={onFilterChange}
          style={{ width: 120 }}
        >
          <Option value="all">All</Option>
          <Option value="layout">Layouts</Option>
          <Option value="widget">Widgets</Option>
        </Select>
      </Space>
    </div>
  );
};

export default ComponentFilter;
