import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Spin,
  Select,
  Upload,
  Modal,
  App,
  theme,
  Tag,
  List,
  Typography,
  Divider,
  Tabs,
  Descriptions,
  Tooltip,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  UploadOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FontSizeOutlined,
  FileOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import assetService from "../../services/asset";
import env from "../../../config/env";
import type { AssetBundle } from "../../types/assets";
import { useTheme } from "../../contexts/ThemeContext";
import "./Edit.css";
const { Text } = Typography;

const KIND_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "font", label: "Font" },
  { value: "other", label: "Other" },
];

const AssetEdit: React.FC = () => {
  const { message } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const { themeMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadAssetIndex, setUploadAssetIndex] = useState<number | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [assetMetadata, setAssetMetadata] = useState<{
    created?: string;
    updated?: string;
  }>({});
  const [activeTabKey, setActiveTabKey] = useState<string>();
  const [headerSticky, setHeaderSticky] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewData, setPreviewData] = useState<{
    url: string;
    kind: string;
    name: string;
    mime?: string;
  } | null>(null);
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const [previewHeights, setPreviewHeights] = useState<Record<string, number>>(
    {},
  );
  const formColumnRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  const fileBaseUrl =
    env.env === "docker" ? "/api" : env.externalOrigins.source;

  const isNew = id === "new";

  useEffect(() => {
    if (!isNew && id) {
      fetchAsset(id);
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

  useEffect(() => {
    const node = formColumnRef.current;
    if (!node) return;
    const key = activeTabKey ?? "";
    if (previewHeights[key]) return;
    requestAnimationFrame(() => {
      const height = node.offsetHeight || null;
      if (!height) return;
      setPreviewHeight(height);
      setPreviewHeights((prev) => ({
        ...prev,
        [key]: height,
      }));
    });
  }, [activeTabKey, previewHeights]);

  const fetchAsset = async (assetId: string) => {
    setLoading(true);
    try {
      const data = await assetService.getAsset(assetId);
      if (data) {
        form.setFieldsValue({
          name: data.name || "",
          bundle: data.bundle || [],
        });

        // Set the first tab as active after loading
        if (data.bundle?.length > 0 && !activeTabKey) {
          setActiveTabKey("0");
        }

        setAssetMetadata({
          created: data.created,
          updated: data.updated,
        });
      }
    } catch (error) {
      message.error("Failed to load asset");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/assets");
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: Partial<AssetBundle> = {
        name: values.name || "",
        bundle: values.bundle || [],
      };

      if (isNew) {
        const newAsset = await assetService.createAsset(payload);
        message.success("Asset bundle created successfully");
        navigate(`/assets/${newAsset._id}`);
      } else if (id) {
        await assetService.updateAsset(id, payload);
        message.success("Asset bundle updated successfully");
        fetchAsset(id);
      }
    } catch (error) {
      message.error("Failed to save asset");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddFilesToAsset = (index: number) => {
    setUploadModalVisible(true);
    setUploadAssetIndex(index);
  };

  const handleUploadSubmit = async () => {
    if (uploadFiles.length === 0) {
      message.warning("Please select files to upload");
      return;
    }

    if (!id || isNew) {
      message.warning("Please save the bundle first before uploading files");
      return;
    }

    try {
      const assetName =
        uploadAssetIndex === null ? uploadFiles[0].name : undefined;

      const existingBundle = form.getFieldValue("bundle");
      const assetId =
        uploadAssetIndex !== null && existingBundle[uploadAssetIndex]
          ? existingBundle[uploadAssetIndex]._id
          : undefined;

      const updatedAsset = await assetService.uploadFiles(
        uploadFiles,
        id,
        assetName,
        assetId,
      );

      message.success("Files uploaded successfully");
      form.setFieldsValue({ bundle: updatedAsset.bundle });
      setUploadModalVisible(false);
      setUploadFiles([]);
      setUploadAssetIndex(null);
    } catch (error) {
      message.error("Failed to upload files");
      console.error(error);
    }
  };

  const getKindIcon = (kind: string) => {
    switch (kind) {
      case "image":
        return <FileImageOutlined style={{ color: token.colorSuccess }} />;
      case "video":
        return <VideoCameraOutlined style={{ color: token.colorError }} />;
      case "font":
        return <FontSizeOutlined style={{ color: token.colorWarning }} />;
      default:
        return <FileOutlined style={{ color: token.colorTextSecondary }} />;
    }
  };

  const getAssetFileUrl = (path: { filename: string; extension: string }) =>
    `${fileBaseUrl}/files/assets/${path.filename}.${path.extension}`;

  const renderPreviewContent = (
    kind: string,
    url: string,
    label: string,
    isModal = false,
    previewMaxHeight?: number | null,
  ) => {
    const wrapperHeight = isModal
      ? "80vh"
      : previewMaxHeight
        ? `${previewMaxHeight}px`
        : "100%";
    const containerWidth = isModal ? "80vw" : "100%";
    if (kind === "image") {
      return (
        <div
          style={{
            height: wrapperHeight,
            padding: 12,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: containerWidth,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: token.colorBgContainer,
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            <img
              src={url}
              alt={label}
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      );
    }

    if (kind === "video") {
      return (
        <div
          style={{
            height: wrapperHeight,
            padding: 12,
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: containerWidth,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: token.colorBgContainer,
              margin: "0 auto",
              overflow: "hidden",
            }}
          >
            <video
              src={url}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "auto",
                height: "auto",
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      );
    }

    if (kind === "font") {
      const fontFamily = `asset-font-${label.replace(/\s+/g, "-")}`;
      return (
        <div
          style={{
            height: wrapperHeight,
            padding: 12,
            boxSizing: "border-box",
          }}
        >
          <style>
            {`@font-face { font-family: "${fontFamily}"; src: url("${url}"); }`}
          </style>
          <div
            style={{
              borderRadius: 8,
              padding: 12,
              background: token.colorBgContainer,
              fontFamily,
              fontSize: 26,
              lineHeight: 1.5,
              height: "100%",
              maxWidth: "100%",
              whiteSpace: "normal",
              wordBreak: "break-word",
              boxSizing: "border-box",
              overflow: "auto",
            }}
          >
            <div>The quick brown fox jumps over the lazy dog.</div>
            <div>ABCDEFGHIJKLMNOPQRSTUVWXYZ</div>
            <div>abcdefghijklmnopqrstuvwxyz</div>
          </div>
        </div>
      );
    }

    return (
      <Space direction="vertical" size="small">
        <Text type="secondary">Preview not available for this file.</Text>
        <Button type="link" href={url} target="_blank">
          Open file
        </Button>
      </Space>
    );
  };

  if (loading) {
    return (
      <div className="asset-edit-loading">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="asset-edit-page">
      {/* Theme toggle button - fixed top-right corner */}
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

      <div
        ref={headerRef}
        className={`asset-edit-header ${headerSticky ? "sticky" : ""}`}
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
            {isNew ? "Create Asset Bundle" : "Edit Asset Bundle"}
          </h1>
        </div>
        {headerSticky && (
          <div className="asset-name-sticky">
            {form.getFieldValue("name") || "Untitled Asset Bundle"}
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
            onClick={handleSave}
          >
            Save
          </Button>
        </Space>
      </div>
      {headerSticky && <div style={{ height: "72px" }} />}

      <Form form={form} layout="vertical" initialValues={{ bundle: [] }}>
        <Card title="Asset Bundle Information" style={{ marginBottom: 24 }}>
          <Form.Item
            name="name"
            label="Bundle Name"
            rules={[{ required: true, message: "Please enter a bundle name" }]}
          >
            <Input placeholder="e.g., Campaign Assets, Product Images" />
          </Form.Item>
          {!isNew && (assetMetadata.created || assetMetadata.updated) && (
            <Descriptions size="small" column={2}>
              {assetMetadata.created && (
                <Descriptions.Item label="Created">
                  {new Date(assetMetadata.created).toLocaleString()}
                </Descriptions.Item>
              )}
              {assetMetadata.updated && (
                <Descriptions.Item label="Updated">
                  {new Date(assetMetadata.updated).toLocaleString()}
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Card>

        <Card title="Assets">
          <Form.List name="bundle">
            {(fields, { add, remove }) => (
              <>
                {fields.length > 0 ? (
                  <Tabs
                    type="editable-card"
                    activeKey={activeTabKey}
                    onChange={setActiveTabKey}
                    onEdit={(targetKey, action) => {
                      if (action === "add") {
                        const currentKeys = fields.map((f) => f.key);
                        const maxKey =
                          currentKeys.length > 0
                            ? Math.max(...currentKeys)
                            : -1;
                        add({ name: "", kind: "image", status: "", paths: [] });
                        requestAnimationFrame(() => {
                          setActiveTabKey(String(maxKey + 1));
                        });
                      } else if (action === "remove") {
                        const index = fields.findIndex(
                          (f) => String(f.key) === targetKey,
                        );
                        if (index !== -1) {
                          remove(index);
                          if (activeTabKey === targetKey && fields.length > 1) {
                            setActiveTabKey(String(fields[0].key));
                          }
                        }
                      }
                    }}
                    items={fields.map(({ key, name, ...restField }, index) => {
                      const fieldData = form.getFieldValue(["bundle", name]);
                      const assetKind = fieldData?.kind || "other";
                      const tabKey = String(key);
                      const lockedPreviewHeight =
                        previewHeights[tabKey] || previewHeight || undefined;

                      return {
                        key: String(key),
                        label: (
                          <Space>
                            {getKindIcon(assetKind)}
                            {fieldData?.name || `Asset ${index + 1}`}
                          </Space>
                        ),
                        closable: true,
                        children: (
                          <div style={{ padding: "16px 0" }}>
                            <div
                              style={{
                                display: "flex",
                                gap: 24,
                                alignItems: "stretch",
                              }}
                            >
                              <div
                                ref={formColumnRef}
                                style={{ flex: "1 1 50%", minWidth: 0 }}
                              >
                                <Form.Item name={[name, "_id"]} hidden>
                                  <Input type="hidden" />
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, "name"]}
                                  label="Asset Name"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Name is required",
                                    },
                                  ]}
                                >
                                  <Input placeholder="Asset name" />
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, "kind"]}
                                  label="Kind"
                                  rules={[
                                    {
                                      required: true,
                                      message: "Kind is required",
                                    },
                                  ]}
                                >
                                  <Select
                                    options={KIND_OPTIONS}
                                    placeholder="Select kind"
                                  />
                                </Form.Item>

                                <Form.Item
                                  {...restField}
                                  name={[name, "status"]}
                                  label="Status"
                                >
                                  <Input placeholder="Status (optional)" />
                                </Form.Item>

                                <Divider />

                                <div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      marginBottom: 8,
                                    }}
                                  >
                                    <Text strong>
                                      Files (
                                      {form.getFieldValue([
                                        "bundle",
                                        name,
                                        "paths",
                                      ])?.length || 0}
                                      )
                                    </Text>
                                    <Button
                                      icon={<UploadOutlined />}
                                      onClick={() =>
                                        handleAddFilesToAsset(index)
                                      }
                                      disabled={isNew}
                                    >
                                      Add Files
                                    </Button>
                                  </div>
                                  <List
                                    size="small"
                                    bordered
                                    dataSource={
                                      form.getFieldValue([
                                        "bundle",
                                        name,
                                        "paths",
                                      ]) || []
                                    }
                                    renderItem={(path: any) => (
                                      <List.Item>
                                        <Space>
                                          <Tag color={token.colorPrimary}>
                                            {path.extension}
                                          </Tag>
                                          <Text code>
                                            {path.filename}.{path.extension}
                                          </Text>
                                          <Text type="secondary">
                                            ({path.mime})
                                          </Text>
                                        </Space>
                                      </List.Item>
                                    )}
                                    locale={{
                                      emptyText: "No files uploaded",
                                    }}
                                  />
                                </div>
                              </div>

                              <div
                                style={{
                                  flex: "1 1 50%",
                                  minWidth: 0,
                                  display: "flex",
                                  height: previewHeight || "100%",
                                  maxHeight: previewHeight || "100%",
                                  overflow: "hidden",
                                }}
                              >
                                <Card
                                  size="small"
                                  title="Preview"
                                  style={{
                                    width: "100%",
                                    height: lockedPreviewHeight,
                                    maxHeight: lockedPreviewHeight,
                                    overflow: "hidden",
                                  }}
                                  bodyStyle={{
                                    height: lockedPreviewHeight
                                      ? `${Math.max(lockedPreviewHeight - 56, 180)}px`
                                      : undefined,
                                    maxHeight: lockedPreviewHeight
                                      ? `${Math.max(lockedPreviewHeight - 56, 180)}px`
                                      : undefined,
                                    overflow: "hidden",
                                    padding: 0,
                                    boxSizing: "border-box",
                                  }}
                                  extra={(() => {
                                    const paths =
                                      form.getFieldValue([
                                        "bundle",
                                        name,
                                        "paths",
                                      ]) || [];
                                    const previewPath = paths[0];
                                    const label =
                                      fieldData?.name || `Asset ${index + 1}`;
                                    if (!previewPath) return null;
                                    const url = getAssetFileUrl(previewPath);
                                    return (
                                      <Space size="small">
                                        <Button
                                          size="small"
                                          onClick={() =>
                                            window.open(
                                              url,
                                              "_blank",
                                              "noopener,noreferrer",
                                            )
                                          }
                                        >
                                          Open
                                        </Button>
                                        <Button
                                          size="small"
                                          type="primary"
                                          onClick={() => {
                                            setPreviewData({
                                              url,
                                              kind: assetKind,
                                              name: label,
                                              mime: previewPath.mime,
                                            });
                                            setPreviewModalVisible(true);
                                          }}
                                        >
                                          Maximize
                                        </Button>
                                      </Space>
                                    );
                                  })()}
                                >
                                  {(() => {
                                    const paths =
                                      form.getFieldValue([
                                        "bundle",
                                        name,
                                        "paths",
                                      ]) || [];
                                    const previewPath = paths[0];
                                    const label =
                                      fieldData?.name || `Asset ${index + 1}`;
                                    if (!previewPath) {
                                      return (
                                        <Text type="secondary">
                                          Upload a file to see a preview.
                                        </Text>
                                      );
                                    }
                                    const url = getAssetFileUrl(previewPath);
                                    return renderPreviewContent(
                                      assetKind,
                                      url,
                                      label,
                                      false,
                                      lockedPreviewHeight
                                        ? Math.max(
                                            lockedPreviewHeight - 56,
                                            180,
                                          )
                                        : null,
                                    );
                                  })()}
                                </Card>
                              </div>
                            </div>
                          </div>
                        ),
                      };
                    })}
                  />
                ) : (
                  <Button
                    type="dashed"
                    onClick={() => {
                      add({ name: "", kind: "image", status: "", paths: [] });
                      requestAnimationFrame(() => {
                        setActiveTabKey("0");
                      });
                    }}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add First Asset
                  </Button>
                )}
              </>
            )}
          </Form.List>
        </Card>
      </Form>

      <Modal
        title={
          uploadAssetIndex === null ? "Add New Asset" : "Add Files to Asset"
        }
        open={uploadModalVisible}
        onOk={handleUploadSubmit}
        onCancel={() => {
          setUploadModalVisible(false);
          setUploadFiles([]);
          setUploadAssetIndex(null);
        }}
        okText="Upload"
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Text>Select files to upload (max 50MB per file)</Text>
          <Upload
            multiple
            beforeUpload={(file) => {
              const maxSize = 50 * 1024 * 1024; // 50MB
              if (file.size > maxSize) {
                message.error(`${file.name} exceeds 50MB limit`);
                return false;
              }
              setUploadFiles((prev) => [...prev, file]);
              return false;
            }}
            onRemove={(file) => {
              setUploadFiles((prev) =>
                prev.filter((f) => f.name !== file.name),
              );
            }}
            fileList={uploadFiles.map((f, idx) => ({
              uid: `${idx}-${f.name}`,
              name: f.name,
              status: "done" as const,
            }))}
          >
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
        </Space>
      </Modal>

      <Modal
        title={previewData?.name || "Preview"}
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false);
          setPreviewData(null);
        }}
        footer={null}
        centered
        width="auto"
        style={{ maxWidth: "90vw" }}
        bodyStyle={{ maxHeight: "85vh", overflow: "hidden" }}
      >
        <div
          style={{
            maxHeight: "85vh",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {previewData ? (
            renderPreviewContent(
              previewData.kind,
              previewData.url,
              previewData.name,
              true,
            )
          ) : (
            <Text type="secondary">No preview available.</Text>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AssetEdit;
