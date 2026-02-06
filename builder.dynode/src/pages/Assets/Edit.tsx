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
  DeleteOutlined,
  SwapOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import assetService from "../../services/asset";
import env from "../../../config/env";
import type { AssetBundle } from "../../types/assets";
import logger from "../../services/logger";
import "./Edit.css";
const { Text } = Typography;

const KIND_OPTIONS = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "font", label: "Font" },
  { value: "other", label: "Other" },
];

const AssetEdit: React.FC = () => {
  const { message, modal } = App.useApp();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<Map<string, File[]>>(
    new Map(),
  );
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
    paths?: any[];
    currentIndex?: number;
    assetIndex?: number;
  } | null>(null);
  const [modalPreviewIndex, setModalPreviewIndex] = useState(0);
  const [hoveredModalPreview, setHoveredModalPreview] = useState(false);
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const [previewHeights, setPreviewHeights] = useState<Record<string, number>>(
    {},
  );
  const [previewIndices, setPreviewIndices] = useState<Record<string, number>>(
    {},
  );
  const [hoveredPreview, setHoveredPreview] = useState<string | null>(null);
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
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
      logger.error("Failed to load asset", { error, assetId });
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

      // Prepare bundle with only non-pending files (these are the files we want to keep)
      const bundleWithKeptFiles = (values.bundle || []).map((asset: any) => ({
        ...asset,
        paths: (asset.paths || []).filter((p: any) => !p._pending),
      }));

      let payload: Partial<AssetBundle> = {
        name: values.name || "",
        bundle: bundleWithKeptFiles,
      };

      if (isNew) {
        // Create new bundle first (without pending files)
        const newAsset = await assetService.createAsset(payload);
        const newBundleId = newAsset._id;

        // Then upload any pending files
        if (pendingFiles.size > 0) {
          for (const [assetKey, files] of pendingFiles.entries()) {
            if (files.length > 0) {
              const assetIndex = parseInt(assetKey);
              const assetId = newAsset.bundle?.[assetIndex]?._id;

              await assetService.uploadFiles(
                files,
                newBundleId,
                undefined,
                assetId,
              );
            }
          }
        }

        setPendingFiles(new Map());
        message.success("Asset bundle created successfully");
        navigate(`/assets/${newBundleId}`);
      } else if (id) {
        // First, save the bundle with deletions (kept files only)
        // This ensures deleted files are removed from the server before uploading new ones
        await assetService.updateAsset(id, payload);

        // Then upload any pending files
        if (pendingFiles.size > 0) {
          for (const [assetKey, files] of pendingFiles.entries()) {
            if (files.length > 0) {
              const assetIndex = parseInt(assetKey);
              const assetId = payload.bundle?.[assetIndex]?._id;

              // Upload files to server (they will be added to the now-clean asset)
              await assetService.uploadFiles(files, id, undefined, assetId);
            }
          }
          setPendingFiles(new Map());
        }

        message.success("Asset bundle updated successfully");
        fetchAsset(id);
      }
    } catch (error) {
      message.error("Failed to save asset");
      logger.error("Failed to save asset", { error, isNew, id });
    } finally {
      setSaving(false);
    }
  };

  const handleFilesSelected = (
    event: React.ChangeEvent<HTMLInputElement>,
    assetIndex: number,
    assetName: number,
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        message.error(`${file.name} exceeds 50MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      const existingBundle = form.getFieldValue("bundle") || [];
      const asset = existingBundle[assetIndex];

      if (asset) {
        const newPaths = validFiles.map((f) => ({
          filename: f.name.split(".").slice(0, -1).join("."),
          extension: f.name.split(".").pop() || "",
          mime: f.type,
          _pending: true,
        }));

        asset.paths = [...(asset.paths || []), ...newPaths];
        form.setFieldsValue({ bundle: existingBundle });

        const existingPending = pendingFiles.get(String(assetName)) || [];
        setPendingFiles(
          new Map(
            pendingFiles.set(String(assetName), [
              ...existingPending,
              ...validFiles,
            ]),
          ),
        );
      }

      message.success("Files added (will be uploaded when you save)");
      event.target.value = ""; // Reset input
    } catch (error) {
      message.error("Failed to add files");
      logger.error("Failed to add files", { error });
    }
  };

  const handleReplaceFile = (
    assetIndex: number,
    assetName: number,
    pathIndex: number,
    file: File,
  ) => {
    try {
      const existingBundle = form.getFieldValue("bundle") || [];
      const asset = existingBundle[assetIndex];

      if (asset && asset.paths[pathIndex]) {
        // Replace the path data
        asset.paths[pathIndex] = {
          filename: file.name.split(".").slice(0, -1).join("."),
          extension: file.name.split(".").pop() || "",
          mime: file.type,
          _pending: true,
        };

        form.setFieldsValue({ bundle: existingBundle });

        // Update pending files
        const existingPending = pendingFiles.get(String(assetName)) || [];
        const newPending = [...existingPending];
        newPending[pathIndex] = file;
        setPendingFiles(
          new Map(pendingFiles.set(String(assetName), newPending)),
        );

        message.success("File replaced (will be uploaded when you save)");
      }
    } catch (error) {
      message.error("Failed to replace file");
      logger.error("Failed to replace file", { error });
    }
  };

  const getAssetFileUrl = (
    path: { filename: string; extension: string; _pending?: boolean },
    assetIndex?: number,
  ) => {
    // If file is pending, create blob URL from stored file
    if (path._pending && assetIndex !== undefined) {
      const files = pendingFiles.get(String(assetIndex));
      if (files) {
        const matchingFile = files.find((f) => {
          const fname = f.name.split(".").slice(0, -1).join(".");
          const ext = f.name.split(".").pop() || "";
          return fname === path.filename && ext === path.extension;
        });
        if (matchingFile) {
          return URL.createObjectURL(matchingFile);
        }
      }
    }
    // Otherwise return server URL
    return `${fileBaseUrl}/files/assets/${path.filename}.${path.extension}`;
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

  const renderPreviewContent = (
    kind: string,
    url: string,
    label: string,
    isModal = false,
    previewMaxHeight?: number | null,
    filename?: string,
    showOverlay = false,
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
              position: "relative",
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
            {showOverlay && filename && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {filename}
              </div>
            )}
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
              position: "relative",
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
            {showOverlay && filename && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}
              >
                {filename}
              </div>
            )}
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
                    tabBarGutter={8}
                    tabBarStyle={{ marginBottom: 16 }}
                    onEdit={(targetKey, action) => {
                      if (action === "add") {
                        const currentKeys = fields.map((f) => f.key);
                        const maxKey =
                          currentKeys.length > 0
                            ? Math.max(...currentKeys)
                            : -1;
                        const now = new Date().toISOString();
                        add({
                          name: "",
                          kind: "image",
                          status: "",
                          paths: [],
                          created: now,
                          updated: now,
                        });
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
                          const asset = form.getFieldValue(["bundle", index]);
                          const assetName = asset?.name || `Asset ${index + 1}`;
                          const fileCount = asset?.paths?.length || 0;

                          modal.confirm({
                            title: "Remove Asset?",
                            content: (
                              <div>
                                <p>
                                  Are you sure you want to remove{" "}
                                  <strong>{assetName}</strong>?
                                </p>
                                {fileCount > 0 && (
                                  <p
                                    style={{
                                      color: token.colorWarning,
                                      marginTop: 8,
                                    }}
                                  >
                                    ⚠️ This asset contains {fileCount} file
                                    {fileCount !== 1 ? "s" : ""}. The files will
                                    be deleted when you save the bundle.
                                  </p>
                                )}
                              </div>
                            ),
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
                      const fieldData = form.getFieldValue(["bundle", name]);
                      const assetKind = fieldData?.kind || "other";
                      const tabKey = String(key);
                      const lockedPreviewHeight =
                        previewHeights[tabKey] || previewHeight || undefined;

                      return {
                        key: String(key),
                        label: (
                          <span>
                            <span className="tab-position-number">
                              {index + 1}.{" "}
                            </span>
                            <Space>
                              {getKindIcon(assetKind)}
                              {fieldData?.name || `Asset ${index + 1}`}
                            </Space>
                          </span>
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
                                <Form.Item name={[name, "created"]} hidden>
                                  <Input type="hidden" />
                                </Form.Item>
                                <Form.Item name={[name, "updated"]} hidden>
                                  <Input type="hidden" />
                                </Form.Item>
                                <Form.Item name={[name, "paths"]} hidden>
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
                                    <>
                                      <input
                                        type="file"
                                        multiple
                                        ref={(el) => {
                                          if (el && !el.dataset.indexed) {
                                            el.dataset.indexed = "true";
                                            el.addEventListener("change", (e) =>
                                              handleFilesSelected(
                                                e as any,
                                                index,
                                                name,
                                              ),
                                            );
                                          }
                                        }}
                                        style={{ display: "none" }}
                                        id={`file-input-${index}`}
                                      />
                                      <Button
                                        icon={<UploadOutlined />}
                                        onClick={() => {
                                          const input = document.getElementById(
                                            `file-input-${index}`,
                                          ) as HTMLInputElement;
                                          input?.click();
                                        }}
                                      >
                                        Add Files
                                      </Button>
                                    </>
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
                                    renderItem={(
                                      path: any,
                                      pathIndex: number,
                                    ) => (
                                      <List.Item
                                        actions={[
                                          <Tooltip title="Replace file">
                                            <Button
                                              type="text"
                                              size="small"
                                              icon={<SwapOutlined />}
                                              onClick={() => {
                                                const input =
                                                  document.createElement(
                                                    "input",
                                                  );
                                                input.type = "file";
                                                input.accept = "*";
                                                input.onchange = (e: Event) => {
                                                  const file = (
                                                    e.target as HTMLInputElement
                                                  ).files?.[0];
                                                  if (file) {
                                                    const maxSize =
                                                      50 * 1024 * 1024;
                                                    if (file.size > maxSize) {
                                                      message.error(
                                                        `${file.name} exceeds 50MB limit`,
                                                      );
                                                      return;
                                                    }
                                                    handleReplaceFile(
                                                      index,
                                                      name,
                                                      pathIndex,
                                                      file,
                                                    );
                                                  }
                                                };
                                                input.click();
                                              }}
                                            />
                                          </Tooltip>,
                                          <Tooltip title="Remove file">
                                            <Button
                                              type="text"
                                              size="small"
                                              danger
                                              icon={
                                                deletingFiles.has(
                                                  `${index}-${pathIndex}`,
                                                ) ? (
                                                  <LoadingOutlined />
                                                ) : (
                                                  <DeleteOutlined />
                                                )
                                              }
                                              disabled={deletingFiles.has(
                                                `${index}-${pathIndex}`,
                                              )}
                                              onClick={async () => {
                                                const fileKey = `${index}-${pathIndex}`;
                                                setDeletingFiles((prev) =>
                                                  new Set(prev).add(fileKey),
                                                );

                                                // Use setTimeout to ensure UI updates
                                                setTimeout(() => {
                                                  try {
                                                    const currentPaths =
                                                      form.getFieldValue([
                                                        "bundle",
                                                        name,
                                                        "paths",
                                                      ]);
                                                    const newPaths =
                                                      currentPaths.filter(
                                                        (_: any, idx: number) =>
                                                          idx !== pathIndex,
                                                      );
                                                    form.setFieldValue(
                                                      ["bundle", name, "paths"],
                                                      newPaths,
                                                    );
                                                    // Reset preview index if needed
                                                    const currentPreviewIndex =
                                                      previewIndices[tabKey] ||
                                                      0;
                                                    if (
                                                      currentPreviewIndex >=
                                                        newPaths.length &&
                                                      newPaths.length > 0
                                                    ) {
                                                      setPreviewIndices(
                                                        (prev) => ({
                                                          ...prev,
                                                          [tabKey]:
                                                            newPaths.length - 1,
                                                        }),
                                                      );
                                                    } else if (
                                                      newPaths.length === 0
                                                    ) {
                                                      setPreviewIndices(
                                                        (prev) => ({
                                                          ...prev,
                                                          [tabKey]: 0,
                                                        }),
                                                      );
                                                    }
                                                    // Remove pending file from map if it exists
                                                    if (path._pending) {
                                                      setPendingFiles(
                                                        (prev) => {
                                                          const key = `${name}-${pathIndex}`;
                                                          const newMap =
                                                            new Map(prev);
                                                          newMap.delete(key);
                                                          return newMap;
                                                        },
                                                      );
                                                    }
                                                  } finally {
                                                    setDeletingFiles((prev) => {
                                                      const newSet = new Set(
                                                        prev,
                                                      );
                                                      newSet.delete(fileKey);
                                                      return newSet;
                                                    });
                                                  }
                                                }, 0);
                                              }}
                                            />
                                          </Tooltip>,
                                        ]}
                                      >
                                        <Space>
                                          {path._pending && (
                                            <Tag color="orange">PENDING</Tag>
                                          )}
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
                                  styles={{
                                    body: {
                                      height: lockedPreviewHeight
                                        ? `${Math.max(lockedPreviewHeight - 56, 180)}px`
                                        : undefined,
                                      maxHeight: lockedPreviewHeight
                                        ? `${Math.max(lockedPreviewHeight - 56, 180)}px`
                                        : undefined,
                                      overflow: "hidden",
                                      padding: 0,
                                      boxSizing: "border-box",
                                    },
                                  }}
                                  extra={(() => {
                                    const paths =
                                      form.getFieldValue([
                                        "bundle",
                                        name,
                                        "paths",
                                      ]) || [];
                                    const currentPreviewIndex =
                                      previewIndices[tabKey] || 0;
                                    const currentFile =
                                      paths[currentPreviewIndex] || paths[0];
                                    const label =
                                      fieldData?.name || `Asset ${index + 1}`;
                                    if (!currentFile) return null;
                                    const url = getAssetFileUrl(
                                      currentFile,
                                      name,
                                    );
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
                                            const paths =
                                              form.getFieldValue([
                                                "bundle",
                                                name,
                                                "paths",
                                              ]) || [];
                                            setModalPreviewIndex(
                                              currentPreviewIndex,
                                            );
                                            setPreviewData({
                                              url,
                                              kind: assetKind,
                                              name: label,
                                              mime: currentFile.mime,
                                              paths,
                                              currentIndex: currentPreviewIndex,
                                              assetIndex: index,
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
                                    const currentPreviewIndex =
                                      previewIndices[tabKey] || 0;

                                    if (!previewPath) {
                                      return (
                                        <div
                                          style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            width: "100%",
                                          }}
                                        >
                                          <Text type="secondary">
                                            Upload a file to see a preview.
                                          </Text>
                                        </div>
                                      );
                                    }

                                    const currentFile =
                                      paths[currentPreviewIndex] || paths[0];
                                    const url = getAssetFileUrl(
                                      currentFile,
                                      name,
                                    );
                                    const filename = `${currentFile.filename}.${currentFile.extension}`;

                                    return (
                                      <div
                                        style={{
                                          position: "relative",
                                          height: "100%",
                                        }}
                                        onMouseEnter={() =>
                                          setHoveredPreview(tabKey)
                                        }
                                        onMouseLeave={() =>
                                          setHoveredPreview(null)
                                        }
                                      >
                                        {renderPreviewContent(
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
                                          filename,
                                          hoveredPreview === tabKey,
                                        )}
                                        {paths.length > 1 &&
                                          hoveredPreview === tabKey && (
                                            <>
                                              <Button
                                                type="text"
                                                icon={<ArrowLeftOutlined />}
                                                onClick={() => {
                                                  setPreviewIndices((prev) => ({
                                                    ...prev,
                                                    [tabKey]:
                                                      currentPreviewIndex > 0
                                                        ? currentPreviewIndex -
                                                          1
                                                        : paths.length - 1,
                                                  }));
                                                }}
                                                style={{
                                                  position: "absolute",
                                                  left: 8,
                                                  top: "50%",
                                                  transform: "translateY(-50%)",
                                                  background:
                                                    "rgba(0, 0, 0, 0.5)",
                                                  color: "white",
                                                  border: "none",
                                                }}
                                              />
                                              <Button
                                                type="text"
                                                icon={
                                                  <ArrowLeftOutlined
                                                    style={{
                                                      transform:
                                                        "rotate(180deg)",
                                                    }}
                                                  />
                                                }
                                                onClick={() => {
                                                  setPreviewIndices((prev) => ({
                                                    ...prev,
                                                    [tabKey]:
                                                      currentPreviewIndex <
                                                      paths.length - 1
                                                        ? currentPreviewIndex +
                                                          1
                                                        : 0,
                                                  }));
                                                }}
                                                style={{
                                                  position: "absolute",
                                                  right: 8,
                                                  top: "50%",
                                                  transform: "translateY(-50%)",
                                                  background:
                                                    "rgba(0, 0, 0, 0.5)",
                                                  color: "white",
                                                  border: "none",
                                                }}
                                              />
                                              <div
                                                style={{
                                                  position: "absolute",
                                                  bottom: 8,
                                                  left: "50%",
                                                  transform: "translateX(-50%)",
                                                  background:
                                                    "rgba(0, 0, 0, 0.7)",
                                                  color: "white",
                                                  padding: "4px 12px",
                                                  borderRadius: 12,
                                                  fontSize: 12,
                                                }}
                                              >
                                                {currentPreviewIndex + 1} /{" "}
                                                {paths.length}
                                              </div>
                                            </>
                                          )}
                                      </div>
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
                      const now = new Date().toISOString();
                      add({
                        name: "",
                        kind: "image",
                        status: "",
                        paths: [],
                        created: now,
                        updated: now,
                      });
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
        title={previewData?.name || "Preview"}
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false);
          setPreviewData(null);
          setHoveredModalPreview(false);
        }}
        footer={null}
        centered
        width="auto"
        style={{ maxWidth: "90vw" }}
        styles={{ body: { maxHeight: "85vh", overflow: "hidden" } }}
      >
        <div
          style={{
            maxHeight: "85vh",
            overflow: "auto",
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
          onMouseEnter={() => setHoveredModalPreview(true)}
          onMouseLeave={() => setHoveredModalPreview(false)}
        >
          {previewData ? (
            <>
              {renderPreviewContent(
                previewData.kind,
                previewData.paths && previewData.assetIndex !== undefined
                  ? getAssetFileUrl(
                      previewData.paths[modalPreviewIndex],
                      previewData.assetIndex,
                    )
                  : previewData.url,
                previewData.name,
                true,
                null,
                previewData.paths
                  ? `${previewData.paths[modalPreviewIndex]?.filename}.${previewData.paths[modalPreviewIndex]?.extension}`
                  : undefined,
                hoveredModalPreview,
              )}
              {previewData.paths && previewData.paths.length > 1 && (
                <>
                  <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={() => {
                      setModalPreviewIndex((prev) =>
                        prev > 0 ? prev - 1 : previewData.paths!.length - 1,
                      );
                    }}
                    style={{
                      position: "absolute",
                      left: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      opacity: hoveredModalPreview ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      pointerEvents: hoveredModalPreview ? "auto" : "none",
                    }}
                  />
                  <Button
                    type="text"
                    icon={
                      <ArrowLeftOutlined
                        style={{ transform: "rotate(180deg)" }}
                      />
                    }
                    onClick={() => {
                      setModalPreviewIndex((prev) =>
                        prev < previewData.paths!.length - 1 ? prev + 1 : 0,
                      );
                    }}
                    style={{
                      position: "absolute",
                      right: 8,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "rgba(0, 0, 0, 0.5)",
                      color: "white",
                      border: "none",
                      opacity: hoveredModalPreview ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      pointerEvents: hoveredModalPreview ? "auto" : "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 8,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "white",
                      padding: "4px 12px",
                      borderRadius: 12,
                      fontSize: 12,
                      opacity: hoveredModalPreview ? 1 : 0,
                      transition: "opacity 0.3s ease",
                      pointerEvents: "none",
                    }}
                  >
                    {modalPreviewIndex + 1} / {previewData.paths.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <Text type="secondary">No preview available.</Text>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AssetEdit;
