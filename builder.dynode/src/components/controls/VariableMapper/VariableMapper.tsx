import React, { useState } from "react";
import { Input, Button, Table, Tooltip, Space, Select } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { SourceExternalVariable } from "../../../types/source";
import DataBrowser from "./DataBrowser";
import "./VariableMapper.css";

interface VariableMapperProps {
  value?: SourceExternalVariable[];
  onChange?: (value: SourceExternalVariable[]) => void;
  sampleData?: any;
  onFetchSampleData?: () => Promise<any>;
}

const VariableMapper: React.FC<VariableMapperProps> = ({
  value = [],
  onChange,
  sampleData,
  onFetchSampleData,
}) => {
  const [autoOpenIndex, setAutoOpenIndex] = useState<number | null>(null);

  const handleAdd = () => {
    const newVariable: SourceExternalVariable = {
      path: "",
      name: "",
      type: "",
      description: "",
    };
    const newIndex = value.length;
    onChange?.([...value, newVariable]);
    // Set the index to auto-open
    setAutoOpenIndex(newIndex);
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange?.(newValue);
  };

  const handleChange = (
    index: number,
    field: keyof SourceExternalVariable,
    val: string,
  ) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [field]: val };
    onChange?.(newValue);
  };

  const columns = [
    {
      title: "Path",
      dataIndex: "path",
      key: "path",
      width: "30%",
      render: (text: string, _: SourceExternalVariable, index: number) => (
        <Space.Compact style={{ width: "100%" }}>
          <Input
            placeholder="e.g., main.temp"
            value={text}
            onChange={(e) => handleChange(index, "path", e.target.value)}
            style={{ flex: 1 }}
          />
          <DataBrowser
            sampleData={sampleData}
            onFetchData={onFetchSampleData}
            autoOpen={autoOpenIndex === index}
            onAutoOpenComplete={() => setAutoOpenIndex(null)}
            onSelect={(path) => {
              // Prepare all updates at once
              const updates: Partial<SourceExternalVariable> = { path };

              // Auto-fill name and type from schema if available
              if (sampleData) {
                // Parse path and traverse schema
                const pathParts = path.split(".");
                let schema = sampleData;

                for (const part of pathParts) {
                  // Handle array access notation like [0]
                  if (part.includes("[")) {
                    const cleanPart = part.split("[")[0];
                    if (schema.properties && schema.properties[cleanPart]) {
                      schema = schema.properties[cleanPart];
                      // If it's an array type, navigate to items
                      if (schema.type === "array" && schema.items) {
                        schema = schema.items;
                      }
                    }
                  } else if (schema.properties && schema.properties[part]) {
                    schema = schema.properties[part];
                  } else if (
                    schema.type === "array" &&
                    schema.items &&
                    schema.items.properties &&
                    schema.items.properties[part]
                  ) {
                    // Handle accessing properties within array items
                    schema = schema.items.properties[part];
                  }
                }

                // Get the last part of the path as the name (remove array notation)
                const lastPart = pathParts[pathParts.length - 1];
                const nodeName = lastPart.includes("[")
                  ? lastPart.split("[")[0]
                  : lastPart;
                updates.name = nodeName;

                // Set type from schema
                if (schema.type) {
                  updates.type = schema.type;
                }
              }

              // Apply all updates at once
              const newValue = [...value];
              newValue[index] = { ...newValue[index], ...updates };
              onChange?.(newValue);
            }}
          />
        </Space.Compact>
      ),
    },
    {
      title: "Variable Name",
      dataIndex: "name",
      key: "name",
      width: "25%",
      render: (text: string, _: SourceExternalVariable, index: number) => (
        <Input
          placeholder="e.g., temperature"
          value={text}
          onChange={(e) => handleChange(index, "name", e.target.value)}
        />
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: "15%",
      render: (text: string, _: SourceExternalVariable, index: number) => (
        <Select
          placeholder="Select type"
          value={text || undefined}
          onChange={(val) => handleChange(index, "type", val)}
          style={{ width: "100%" }}
          options={[
            { value: "string", label: "string" },
            { value: "number", label: "number" },
            { value: "boolean", label: "boolean" },
            { value: "integer", label: "integer" },
            { value: "array", label: "array" },
            { value: "object", label: "object" },
          ]}
        />
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: "20%",
      render: (text: string, _: SourceExternalVariable, index: number) => (
        <Input
          placeholder="Optional description"
          value={text}
          onChange={(e) => handleChange(index, "description", e.target.value)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: (_: any, __: SourceExternalVariable, index: number) => (
        <Tooltip title="Remove Variable">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(index)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="variable-mapper">
      <div className="variable-mapper-header">
        <h4>Variable Mappings</h4>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="small"
        >
          Add Variable
        </Button>
      </div>

      {value.length > 0 ? (
        <Table
          dataSource={value.map((v, i) => ({ ...v, key: i }))}
          columns={columns}
          pagination={false}
          size="small"
        />
      ) : (
        <div className="variable-mapper-empty">
          <p>Test the endpoint first to add variables.</p>
        </div>
      )}
    </div>
  );
};

export default VariableMapper;
