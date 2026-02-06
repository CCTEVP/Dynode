import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Spin,
  Tabs,
  InputNumber,
  Select,
  Descriptions,
  App,
  theme,
  Tooltip,
} from "antd";
import {
  SaveOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  ApiOutlined,
  ApiFilled,
} from "@ant-design/icons";
import {
  getSourceById,
  createSource,
  updateSource,
  getEndpointData,
} from "../../services/source";
import DataBrowser from "../../components/controls/VariableMapper/DataBrowser";
import "./Edit.css";

const { TextArea } = Input;

// Type options for internal sources
const INTERNAL_TYPES = [
  { value: "string", label: "String" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "date-time", label: "Date-Time" },
  { value: "time", label: "Time" },
  { value: "array", label: "Array" },
  { value: "object", label: "Object" },
];

// Source type options
const SOURCE_TYPES = [
  { value: "internal", label: "Internal Variable" },
  { value: "external", label: "External Endpoint" },
];

const SourceEdit: React.FC = () => {
  const { message, modal } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<string>();
  const [sourceMetadata, setSourceMetadata] = useState<{
    created?: string;
    updated?: string;
  }>({});
  const [endpointLoadingStates, setEndpointLoadingStates] = useState<{
    [key: string]: { test: boolean; force: boolean };
  }>({});
  const [endpointBufferData, setEndpointBufferData] = useState<{
    [key: string]: {
      created?: string;
      updated?: string;
      pattern?: any;
      data?: any;
      valid?: boolean;
      httpStatus?: number;
    };
  }>({});
  const [, forceUpdate] = useState({});
  const [headerSticky, setHeaderSticky] = useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const isNew = id === "new";

  useEffect(() => {
    if (!isNew && id) {
      fetchSource(id);
    }
  }, [id, isNew]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 100) {
        setHeaderSticky(true);
      } else {
        setHeaderSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchSource = async (sourceId: string) => {
    setLoading(true);
    try {
      const data = await getSourceById(sourceId);

      // Merge internal and external sources into a unified "sources" array
      const sources = [
        ...(data.internal || []).map((item: any) => ({
          ...item,
          sourceType: "internal",
        })),
        ...(data.external || []).map((item: any) => ({
          ...item,
          sourceType: "external",
          // Stringify pattern for editing
          pattern: item.pattern ? JSON.stringify(item.pattern, null, 2) : "",
        })),
      ];

      form.setFieldsValue({
        name: data.name,
        sources: sources,
      });

      // Set the first tab as active after loading
      if (sources.length > 0 && !activeTabKey) {
        setActiveTabKey("0");
      }

      setSourceMetadata({
        created: data.created
          ? new Date(data.created).toISOString()
          : undefined,
        updated: data.updated
          ? new Date(data.updated).toISOString()
          : undefined,
      });

      // Fetch buffer data for external endpoints
      const bufferData: {
        [key: string]: {
          created?: string;
          updated?: string;
          pattern?: any;
          data?: any;
          valid?: boolean;
          httpStatus?: number;
        };
      } = {};
      for (const item of sources) {
        if (item.sourceType === "external" && item._id) {
          try {
            const metadata = await getEndpointData(
              sourceId,
              item._id.toString(),
              false,
              true, // readOnly
            );
            bufferData[item._id.toString()] = {
              created: metadata.created
                ? new Date(metadata.created).toISOString()
                : undefined,
              updated: metadata.updated
                ? new Date(metadata.updated).toISOString()
                : undefined,
              pattern: metadata.pattern,
              data: metadata.data,
              valid: metadata.httpStatus
                ? metadata.httpStatus >= 200 && metadata.httpStatus < 300
                : undefined,
              httpStatus: metadata.httpStatus,
            };
          } catch (error) {
            // Buffer might not exist yet
          }
        }
      }
      setEndpointBufferData(bufferData);
    } catch (error) {
      message.error("Failed to load source");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    setSaving(true);
    try {
      // Split unified sources array back into internal and external
      const internal = (values.sources || [])
        .filter((s: any) => s.sourceType === "internal")
        .map(({ sourceType, ...rest }: any) => rest);

      const external = (values.sources || [])
        .filter((s: any) => s.sourceType === "external")
        .map(({ sourceType, ...rest }: any) => {
          // Parse pattern back to object if it's a string
          if (rest.pattern && typeof rest.pattern === "string") {
            try {
              rest.pattern = JSON.parse(rest.pattern);
            } catch (e) {
              // If parsing fails, leave it as is or set to empty object
              console.warn("Failed to parse pattern:", e);
              rest.pattern = {};
            }
          }
          return rest;
        });

      const payload = {
        name: values.name,
        internal,
        external,
      };

      if (isNew) {
        await createSource(payload);
        message.success("Source created successfully");
        navigate(`/sources`);
      } else {
        await updateSource(id!, payload);
        message.success("Source updated successfully");
        navigate(`/sources`);
      }
    } catch (error) {
      message.error("Failed to save source");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const isFormDirty = form.isFieldsTouched();

    if (isFormDirty) {
      modal.confirm({
        title: "Discard changes?",
        content: "Are you sure you want to leave without saving?",
        okText: "Discard",
        okType: "danger",
        cancelText: "Stay",
        centered: true,
        transitionName: "zoom",
        onOk: () => {
          navigate("/sources");
          return Promise.resolve();
        },
      });
    } else {
      navigate("/sources");
    }
  };

  const handleTestEndpoint = async (
    sourceId: string,
    endpointId: string,
    fieldKey: string,
  ) => {
    setEndpointLoadingStates((prev) => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], test: true },
    }));
    try {
      // Test endpoint (this fetches and caches the data)
      const testResult = await getEndpointData(sourceId, endpointId, false);
      message.success("Endpoint is working!");

      // Fetch metadata to get timestamps and status
      const metadata = await getEndpointData(sourceId, endpointId, false, true);

      setEndpointBufferData((prev) => ({
        ...prev,
        [endpointId]: {
          created: metadata.created
            ? new Date(metadata.created).toISOString()
            : undefined,
          updated: metadata.updated
            ? new Date(metadata.updated).toISOString()
            : undefined,
          pattern: testResult?.pattern || metadata.pattern,
          data: testResult?.data || metadata.data,
          valid: metadata.httpStatus
            ? metadata.httpStatus >= 200 && metadata.httpStatus < 300
            : undefined,
          httpStatus: metadata.httpStatus,
        },
      }));
    } catch (error) {
      message.error("Failed to test endpoint");
    } finally {
      setEndpointLoadingStates((prev) => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], test: false },
      }));
    }
  };

  const handleForceUpdate = async (
    sourceId: string,
    endpointId: string,
    fieldKey: string,
  ) => {
    const endpointIdStr = String(endpointId); // Ensure it's a string
    setEndpointLoadingStates((prev) => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], force: true },
    }));
    try {
      await getEndpointData(sourceId, endpointIdStr, true, false, false);
      message.success("Cache updated!");

      // Refresh buffer data with readOnly call
      const metadata = await getEndpointData(
        sourceId,
        endpointIdStr,
        false,
        true,
        false,
      );
      setEndpointBufferData((prev) => ({
        ...prev,
        [endpointIdStr]: {
          created: metadata.created
            ? new Date(metadata.created).toISOString()
            : undefined,
          updated: metadata.updated
            ? new Date(metadata.updated).toISOString()
            : undefined,
          pattern: metadata.pattern,
          valid: metadata.httpStatus
            ? metadata.httpStatus >= 200 && metadata.httpStatus < 300
            : undefined,
          httpStatus: metadata.httpStatus,
        },
      }));
    } catch (error) {
      message.error("Failed to force update");
    } finally {
      setEndpointLoadingStates((prev) => ({
        ...prev,
        [fieldKey]: { ...prev[fieldKey], force: false },
      }));
    }
  };

  if (loading) {
    return (
      <div className="source-edit-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="source-edit-page">
      <div
        ref={headerRef}
        className={`source-edit-header ${headerSticky ? "sticky" : ""}`}
        style={
          headerSticky
            ? {
                background: token.colorBgContainer,
                borderBottom: `1px solid ${token.colorBorder}`,
              }
            : undefined
        }
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
            style={{ fontSize: "18px" }}
          />
          <h1 style={{ margin: 0 }}>
            {isNew ? "Create Source" : "Edit Source"}
          </h1>
        </div>
        {headerSticky && (
          <div className="source-name-sticky">
            {form.getFieldValue("name") || "Untitled Source"}
          </div>
        )}
        <Space>
          <Button icon={<CloseOutlined />} onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={() => form.submit()}
          >
            Save
          </Button>
        </Space>
      </div>
      {headerSticky && <div style={{ height: "72px" }} />}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{ sources: [] }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            return false;
          }
        }}
      >
        <Card
          title="Source Information"
          style={{ marginBottom: 24, maxWidth: "100%" }}
        >
          <Form.Item
            name="name"
            label="Source Name"
            rules={[{ required: true, message: "Please enter a source name" }]}
          >
            <Input placeholder="e.g., Weather API, Stock Market Data" />
          </Form.Item>
          {!isNew && (sourceMetadata.created || sourceMetadata.updated) && (
            <Descriptions size="small" column={2}>
              {sourceMetadata.created && (
                <Descriptions.Item label="Created">
                  {new Date(sourceMetadata.created).toLocaleString()}
                </Descriptions.Item>
              )}
              {sourceMetadata.updated && (
                <Descriptions.Item label="Updated">
                  {new Date(sourceMetadata.updated).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Card>

        <Card title="Sources">
          <Form.List name="sources">
            {(fields, { add, remove }) => (
              <>
                {fields.length > 0 ? (
                  <Tabs
                    type="editable-card"
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                    tabBarGutter={8}
                    tabBarStyle={{ marginBottom: 16 }}
                    onEdit={(targetKey, action) => {
                      if (action === "add") {
                        const currentKeys = fields.map((f) => f.key);
                        const maxKey =
                          currentKeys.length > 0
                            ? Math.max(...currentKeys)
                            : -1;
                        add({ sourceType: "internal" });
                        requestAnimationFrame(() => {
                          const newTabKey = String(maxKey + 1);
                          setActiveTabKey(newTabKey);
                          // Scroll the tab bar to the end to show the new tab
                          setTimeout(() => {
                            const tabNav = document.querySelector(
                              ".ant-tabs-nav-list",
                            ) as HTMLElement;
                            if (tabNav) {
                              tabNav.scrollLeft = tabNav.scrollWidth;
                            }
                          }, 100);
                        });
                      } else if (action === "remove") {
                        const index = fields.findIndex(
                          (f) => String(f.key) === targetKey,
                        );
                        if (index !== -1) {
                          const source = form.getFieldValue(["sources", index]);
                          const sourceName =
                            source?.name || `Source ${index + 1}`;

                          modal.confirm({
                            title: "Remove Source?",
                            content: `Are you sure you want to remove "${sourceName}"? This action cannot be undone.`,
                            okText: "Remove",
                            okType: "danger",
                            cancelText: "Cancel",
                            onOk: () => {
                              remove(index);
                              if (
                                activeTabKey === targetKey &&
                                fields.length > 1
                              ) {
                                setActiveTabKey(String(fields[0].key));
                              }
                            },
                          });
                        }
                      }
                    }}
                    items={fields.map(({ key, name, ...restField }, index) => {
                      const fieldData = form.getFieldValue(["sources", name]);
                      const fieldKey = String(key);
                      const isExternal = fieldData?.sourceType === "external";
                      const testLoading =
                        endpointLoadingStates[fieldKey]?.test || false;
                      const forceLoading =
                        endpointLoadingStates[fieldKey]?.force || false;

                      return {
                        key: String(key),
                        label: (
                          <span>
                            <span className="tab-position-number">
                              {index + 1}.{" "}
                            </span>
                            <span
                              style={{
                                color: isExternal ? "#29B6F6" : "#52C41A",
                              }}
                            >
                              {isExternal ? (
                                <ApiFilled
                                  style={{ color: "#29B6F6", marginRight: 6 }}
                                />
                              ) : (
                                <ApiOutlined
                                  style={{ color: "#52C41A", marginRight: 6 }}
                                />
                              )}
                              {fieldData?.name || `Source ${index + 1}`}
                            </span>
                          </span>
                        ),
                        closable: true,
                        children: (
                          <div style={{ padding: "16px 0" }}>
                            <Form.Item name={[name, "_id"]} hidden>
                              <Input type="hidden" />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "sourceType"]}
                              label="Source Type"
                              rules={[
                                {
                                  required: true,
                                  message: "Please select a source type",
                                },
                              ]}
                            >
                              <Select
                                options={SOURCE_TYPES}
                                placeholder="Select source type"
                                onChange={() => {
                                  // Force re-render when source type changes
                                  forceUpdate({});
                                }}
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "name"]}
                              label="Name"
                              rules={[
                                {
                                  required: true,
                                  message: "Please enter a name",
                                },
                              ]}
                            >
                              <Input
                                placeholder={
                                  isExternal
                                    ? "e.g., Weather API"
                                    : "e.g., Target Date"
                                }
                              />
                            </Form.Item>

                            {isExternal ? (
                              <>
                                <Form.Item
                                  {...restField}
                                  name={[name, "source"]}
                                  label="Source URL"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Please enter a source URL",
                                    },
                                    {
                                      type: "url",
                                      message: "Please enter a valid URL",
                                    },
                                  ]}
                                >
                                  <Input placeholder="https://api.example.com/data" />
                                </Form.Item>

                                <Space
                                  style={{
                                    width: "100%",
                                    flexWrap: "wrap",
                                    minWidth: 0,
                                  }}
                                >
                                  <Form.Item
                                    {...restField}
                                    name={[name, "lifetime"]}
                                    label="Cache Lifetime (seconds)"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please enter cache lifetime",
                                      },
                                    ]}
                                    style={{ flex: "1 1 200px", minWidth: 0 }}
                                  >
                                    <InputNumber
                                      min={0}
                                      style={{ width: "100%" }}
                                      placeholder="3600"
                                    />
                                  </Form.Item>

                                  <Form.Item
                                    {...restField}
                                    name={[name, "timeout"]}
                                    label="Timeout (seconds)"
                                    rules={[
                                      {
                                        required: true,
                                        message: "Please enter timeout",
                                      },
                                    ]}
                                    style={{ flex: "1 1 200px", minWidth: 0 }}
                                  >
                                    <InputNumber
                                      min={1}
                                      style={{ width: "100%" }}
                                      placeholder="30"
                                    />
                                  </Form.Item>
                                </Space>

                                <Form.Item
                                  {...restField}
                                  name={[name, "pattern"]}
                                  label={
                                    <Space>
                                      Response Pattern (JSON Schema)
                                      <Button
                                        size="small"
                                        icon={<ReloadOutlined />}
                                        onClick={async () => {
                                          if (!id) return;
                                          const sourceId = String(
                                            fieldData._id,
                                          );
                                          if (!sourceId) return;

                                          try {
                                            // Regenerate pattern from buffer data (readOnly + forcePatternUpdate)
                                            const result =
                                              await getEndpointData(
                                                id,
                                                sourceId,
                                                false,
                                                true,
                                                true,
                                              );

                                            if (result?.pattern) {
                                              // Update the pattern field with regenerated pattern
                                              form.setFieldValue(
                                                ["sources", name, "pattern"],
                                                JSON.stringify(
                                                  result.pattern,
                                                  null,
                                                  2,
                                                ),
                                              );
                                              message.success(
                                                "Pattern regenerated from buffer data",
                                              );
                                            } else {
                                              message.warning(
                                                "No pattern available. Test the endpoint first.",
                                              );
                                            }
                                          } catch (error) {
                                            message.error(
                                              "Failed to regenerate pattern from buffer",
                                            );
                                            console.error(error);
                                          }
                                        }}
                                      >
                                        Update from Buffer
                                      </Button>
                                    </Space>
                                  }
                                  tooltip="Leave empty to auto-generate on first fetch"
                                >
                                  <TextArea
                                    rows={6}
                                    placeholder='{"type": "object", "properties": {...}}'
                                  />
                                </Form.Item>

                                {/* Variables section for external sources */}
                                <Card
                                  type="inner"
                                  title="Variables"
                                  size="small"
                                  style={{ marginBottom: 16 }}
                                >
                                  <Form.List name={[name, "variables"]}>
                                    {(
                                      varFields,
                                      { add: addVar, remove: removeVar },
                                    ) => (
                                      <>
                                        {varFields.length > 0 && (
                                          <div
                                            style={{
                                              display: "flex",
                                              gap: 8,
                                              marginBottom: 8,
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                              color: "#666",
                                            }}
                                          >
                                            <div
                                              style={{
                                                flex: 1.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              Name
                                            </div>
                                            <div
                                              style={{ flex: 1, minWidth: 0 }}
                                            >
                                              Type
                                            </div>
                                            <div
                                              style={{
                                                flex: 1.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              Path
                                            </div>
                                            <div
                                              style={{
                                                flex: 1.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              Description
                                            </div>
                                            <div
                                              style={{
                                                flex: 0.3,
                                                minWidth: 0,
                                              }}
                                            ></div>
                                          </div>
                                        )}
                                        {varFields.map((varField) => (
                                          <div
                                            key={varField.key}
                                            style={{
                                              display: "flex",
                                              gap: 8,
                                              alignItems: "start",
                                              marginBottom: 16,
                                            }}
                                          >
                                            <Form.Item
                                              name={[varField.name, "name"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: "Name required",
                                                },
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 1.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              <Input placeholder="Variable name" />
                                            </Form.Item>

                                            <Form.Item
                                              name={[varField.name, "type"]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 1,
                                                minWidth: 0,
                                              }}
                                            >
                                              <Select
                                                options={[
                                                  {
                                                    value: "string",
                                                    label: "String",
                                                  },
                                                  {
                                                    value: "number",
                                                    label: "Number",
                                                  },
                                                  {
                                                    value: "boolean",
                                                    label: "Boolean",
                                                  },
                                                  {
                                                    value: "date",
                                                    label: "Date",
                                                  },
                                                  {
                                                    value: "array",
                                                    label: "Array",
                                                  },
                                                  {
                                                    value: "object",
                                                    label: "Object",
                                                  },
                                                ]}
                                                placeholder="Type"
                                              />
                                            </Form.Item>

                                            <div
                                              style={{
                                                flex: 1.5,
                                                minWidth: 0,
                                                display: "flex",
                                                gap: 0,
                                              }}
                                            >
                                              <Form.Item
                                                name={[varField.name, "path"]}
                                                rules={[
                                                  {
                                                    required: true,
                                                    message: "Path required",
                                                  },
                                                ]}
                                                style={{
                                                  marginBottom: 0,
                                                  flex: 1,
                                                }}
                                              >
                                                <Input
                                                  placeholder="e.g., data.temperature"
                                                  style={{
                                                    borderTopRightRadius: 0,
                                                    borderBottomRightRadius: 0,
                                                  }}
                                                />
                                              </Form.Item>
                                              <DataBrowser
                                                sampleData={
                                                  endpointBufferData[
                                                    fieldData._id
                                                  ]?.data
                                                }
                                                onFetchData={async () => {
                                                  if (fieldData._id && id) {
                                                    const data =
                                                      await getEndpointData(
                                                        id,
                                                        fieldData._id,
                                                      );
                                                    return data?.data || data;
                                                  }
                                                  return null;
                                                }}
                                                onSelect={(path) => {
                                                  // Preserve scroll position
                                                  const scrollPos =
                                                    window.scrollY;

                                                  // Update path
                                                  form.setFieldValue(
                                                    [
                                                      "sources",
                                                      name,
                                                      "variables",
                                                      varField.name,
                                                      "path",
                                                    ],
                                                    path,
                                                  );

                                                  // Try to auto-fill name and type from schema
                                                  const pattern =
                                                    endpointBufferData[
                                                      fieldData._id
                                                    ]?.pattern;
                                                  if (pattern) {
                                                    const pathParts =
                                                      path.split(".");
                                                    let schema = pattern;

                                                    for (const part of pathParts) {
                                                      if (part.includes("[")) {
                                                        const cleanPart =
                                                          part.split("[")[0];
                                                        if (
                                                          schema.properties?.[
                                                            cleanPart
                                                          ]
                                                        ) {
                                                          schema =
                                                            schema.properties[
                                                              cleanPart
                                                            ];
                                                          if (
                                                            schema.type ===
                                                              "array" &&
                                                            schema.items
                                                          ) {
                                                            schema =
                                                              schema.items;
                                                          }
                                                        }
                                                      } else if (
                                                        schema.properties?.[
                                                          part
                                                        ]
                                                      ) {
                                                        schema =
                                                          schema.properties[
                                                            part
                                                          ];
                                                      } else if (
                                                        schema.type ===
                                                          "array" &&
                                                        schema.items
                                                          ?.properties?.[part]
                                                      ) {
                                                        schema =
                                                          schema.items
                                                            .properties[part];
                                                      }
                                                    }

                                                    // Auto-fill name if not set
                                                    const currentName =
                                                      form.getFieldValue([
                                                        "sources",
                                                        name,
                                                        "variables",
                                                        varField.name,
                                                        "name",
                                                      ]);
                                                    if (!currentName) {
                                                      const lastPart =
                                                        pathParts[
                                                          pathParts.length - 1
                                                        ];
                                                      const nodeName =
                                                        lastPart.includes("[")
                                                          ? lastPart.split(
                                                              "[",
                                                            )[0]
                                                          : lastPart;
                                                      form.setFieldValue(
                                                        [
                                                          "sources",
                                                          name,
                                                          "variables",
                                                          varField.name,
                                                          "name",
                                                        ],
                                                        nodeName,
                                                      );
                                                    }

                                                    // Auto-fill type from schema
                                                    if (schema?.type) {
                                                      form.setFieldValue(
                                                        [
                                                          "sources",
                                                          name,
                                                          "variables",
                                                          varField.name,
                                                          "type",
                                                        ],
                                                        schema.type,
                                                      );
                                                    }
                                                  }

                                                  // Restore scroll position
                                                  requestAnimationFrame(() => {
                                                    window.scrollTo(
                                                      0,
                                                      scrollPos,
                                                    );
                                                  });
                                                }}
                                              />
                                            </div>

                                            <Form.Item
                                              name={[
                                                varField.name,
                                                "description",
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 1.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              <Input placeholder="Description" />
                                            </Form.Item>

                                            <Tooltip title="Remove Variable">
                                              <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() =>
                                                  removeVar(varField.name)
                                                }
                                                style={{
                                                  marginTop: 4,
                                                }}
                                              />
                                            </Tooltip>
                                          </div>
                                        ))}
                                        <Button
                                          type="dashed"
                                          onClick={() => addVar()}
                                          block
                                          icon={<PlusOutlined />}
                                        >
                                          Add Variable
                                        </Button>
                                      </>
                                    )}
                                  </Form.List>
                                </Card>

                                {fieldData && fieldData._id && !isNew && (
                                  <Card
                                    type="inner"
                                    title="Testing & Cache"
                                    size="small"
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 24,
                                      }}
                                    >
                                      <Space>
                                        <Button
                                          icon={<ThunderboltOutlined />}
                                          onClick={() =>
                                            handleTestEndpoint(
                                              id!,
                                              String(fieldData._id),
                                              fieldKey,
                                            )
                                          }
                                          loading={testLoading}
                                        >
                                          Test Endpoint
                                        </Button>
                                        <Button
                                          icon={<ReloadOutlined />}
                                          onClick={() =>
                                            handleForceUpdate(
                                              id!,
                                              String(fieldData._id),
                                              fieldKey,
                                            )
                                          }
                                          loading={forceLoading}
                                        >
                                          Force Cache Update
                                        </Button>
                                      </Space>

                                      {(() => {
                                        const endpointIdStr = String(
                                          fieldData._id,
                                        );
                                        const bufferData =
                                          endpointBufferData[endpointIdStr];
                                        return (
                                          bufferData && (
                                            <div
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              {bufferData.httpStatus !==
                                                undefined && (
                                                <div
                                                  style={{
                                                    padding: "4px 12px",
                                                    borderRadius: 4,
                                                    fontSize: "12px",
                                                    fontWeight: "bold",
                                                    backgroundColor:
                                                      bufferData.valid
                                                        ? token.colorSuccess
                                                        : token.colorError,
                                                    color: "white",
                                                  }}
                                                >
                                                  {bufferData.valid
                                                    ? "✓ Valid"
                                                    : "✗ Invalid"}
                                                </div>
                                              )}
                                            </div>
                                          )
                                        );
                                      })()}

                                      {(() => {
                                        const endpointIdStr = String(
                                          fieldData._id,
                                        );
                                        const bufferData =
                                          endpointBufferData[endpointIdStr];
                                        return (
                                          bufferData && (
                                            <div
                                              style={{
                                                display: "flex",
                                                gap: 16,
                                                fontSize: "12px",
                                                color: "#666",
                                              }}
                                            >
                                              {bufferData.created && (
                                                <div>
                                                  <strong>
                                                    Cache Created:
                                                  </strong>{" "}
                                                  {new Date(
                                                    bufferData.created,
                                                  ).toLocaleString()}
                                                </div>
                                              )}
                                              {bufferData.updated && (
                                                <div>
                                                  <strong>
                                                    Cache Updated:
                                                  </strong>{" "}
                                                  {new Date(
                                                    bufferData.updated,
                                                  ).toLocaleString()}
                                                </div>
                                              )}
                                            </div>
                                          )
                                        );
                                      })()}
                                    </div>
                                  </Card>
                                )}
                              </>
                            ) : (
                              <>
                                {/* Variables section for internal sources */}
                                <Card
                                  type="inner"
                                  title="Variables"
                                  size="small"
                                  style={{ marginBottom: 16 }}
                                >
                                  <Form.List name={[name, "variables"]}>
                                    {(
                                      varFields,
                                      { add: addVar, remove: removeVar },
                                    ) => (
                                      <>
                                        {varFields.length > 0 && (
                                          <div
                                            style={{
                                              display: "flex",
                                              gap: 8,
                                              marginBottom: 8,
                                              fontWeight: "bold",
                                              fontSize: "12px",
                                              color: "#666",
                                            }}
                                          >
                                            <div
                                              style={{
                                                flex: 1.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              Name
                                            </div>
                                            <div
                                              style={{ flex: 1, minWidth: 0 }}
                                            >
                                              Type
                                            </div>
                                            <div
                                              style={{
                                                flex: 2.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              Value
                                            </div>
                                            <div
                                              style={{ flex: 2, minWidth: 0 }}
                                            >
                                              Description
                                            </div>
                                            <div
                                              style={{
                                                flex: 0.3,
                                                minWidth: 0,
                                              }}
                                            ></div>
                                          </div>
                                        )}
                                        {varFields.map((varField) => (
                                          <div
                                            key={varField.key}
                                            style={{
                                              display: "flex",
                                              gap: 8,
                                              alignItems: "start",
                                              marginBottom: 16,
                                            }}
                                          >
                                            <Form.Item
                                              name={[varField.name, "name"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: "Name required",
                                                },
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 1.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              <Input placeholder="Variable name" />
                                            </Form.Item>

                                            <Form.Item
                                              name={[varField.name, "type"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: "Type required",
                                                },
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 1,
                                                minWidth: 0,
                                              }}
                                            >
                                              <Select
                                                options={INTERNAL_TYPES}
                                                placeholder="Type"
                                                onChange={() => {
                                                  // Clear value when type changes
                                                  form.setFieldValue(
                                                    [
                                                      "sources",
                                                      name,
                                                      "variables",
                                                      varField.name,
                                                      "value",
                                                    ],
                                                    undefined,
                                                  );
                                                }}
                                              />
                                            </Form.Item>

                                            <Form.Item
                                              name={[varField.name, "value"]}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: "Value required",
                                                },
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 2.5,
                                                minWidth: 0,
                                              }}
                                            >
                                              <Input placeholder="Value" />
                                            </Form.Item>

                                            <Form.Item
                                              name={[
                                                varField.name,
                                                "description",
                                              ]}
                                              style={{
                                                marginBottom: 0,
                                                flex: 2,
                                                minWidth: 0,
                                              }}
                                            >
                                              <Input placeholder="Description" />
                                            </Form.Item>

                                            <Tooltip title="Remove Variable">
                                              <Button
                                                type="text"
                                                size="small"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() =>
                                                  removeVar(varField.name)
                                                }
                                                style={{
                                                  marginTop: 4,
                                                }}
                                              />
                                            </Tooltip>
                                          </div>
                                        ))}
                                        <Button
                                          type="dashed"
                                          onClick={() => addVar()}
                                          block
                                          icon={<PlusOutlined />}
                                        >
                                          Add Variable
                                        </Button>
                                      </>
                                    )}
                                  </Form.List>
                                </Card>
                              </>
                            )}
                          </div>
                        ),
                      };
                    })}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "24px 0" }}>
                    <p style={{ color: "#999", marginBottom: 16 }}>
                      No sources added yet.
                    </p>
                    <Button
                      type="primary"
                      onClick={() => {
                        const currentKeys = fields.map((f) => f.key);
                        const maxKey =
                          currentKeys.length > 0
                            ? Math.max(...currentKeys)
                            : -1;
                        add({ sourceType: "internal" });
                        requestAnimationFrame(() => {
                          setActiveTabKey(String(maxKey + 1));
                        });
                      }}
                    >
                      + Add Source
                    </Button>
                  </div>
                )}
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
};

export default SourceEdit;
