import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Space,
  Breadcrumb,
  Dropdown,
  Modal,
  message,
  theme,
  Input,
  Select,
  DatePicker,
} from "antd";
import {
  FolderOutlined,
  FolderAddOutlined,
  HomeOutlined,
  EditOutlined,
  DragOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import type { Folder, FolderBreadcrumb } from "../../../types/folder";
import FolderService from "../../../services/folder";
import FolderModal from "../FolderModal/Default";
import FolderMoveModal from "../FolderMoveModal/Default";
import type { Dayjs } from "dayjs";

interface FolderBarProps {
  itemType: "creatives" | "sources" | "assets";
  onFolderChange: (folderId: string | null) => void;
  // Search props
  searchColumn?: string;
  onSearchColumnChange?: (column: string) => void;
  searchColumnOptions?: { value: string; label: string }[];
  searchTerm?: string;
  onSearchTermChange?: (term: string) => void;
  dateRange?: [Dayjs | null, Dayjs | null];
  onDateRangeChange?: (dates: [Dayjs | null, Dayjs | null]) => void;
}

const FolderBar: React.FC<FolderBarProps> = ({
  itemType,
  onFolderChange,
  searchColumn,
  onSearchColumnChange,
  searchColumnOptions,
  searchTerm,
  onSearchTermChange,
  dateRange,
  onDateRangeChange,
}) => {
  const { token } = theme.useToken();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FolderBreadcrumb[]>([]);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [movingFolder, setMovingFolder] = useState<Folder | null>(null);

  // Load folders
  const loadFolders = useCallback(async () => {
    try {
      console.log("[FolderBar] Loading folders...");
      const data = await FolderService.getFolders();
      console.log(`[FolderBar] Loaded ${data.length} folders`);
      setFolders(data);
    } catch (error) {
      console.error("[FolderBar] Failed to load folders:", error);
      message.error("Failed to load folders");
      console.error(error);
    }
  }, []);

  // Load breadcrumb when current folder changes
  const loadBreadcrumb = useCallback(async () => {
    if (!currentFolder) {
      setBreadcrumb([]);
      return;
    }

    try {
      const crumbs = await FolderService.getBreadcrumb(currentFolder);
      setBreadcrumb(crumbs);
    } catch (error) {
      console.error("Failed to load breadcrumb:", error);
    }
  }, [currentFolder]);

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  useEffect(() => {
    loadBreadcrumb();
  }, [loadBreadcrumb]);

  // Listen for openNewFolder event from header button
  useEffect(() => {
    const handleOpenNewFolder = () => {
      handleCreateFolder();
    };

    window.addEventListener(
      "openNewFolder",
      handleOpenNewFolder as EventListener,
    );
    return () => {
      window.removeEventListener(
        "openNewFolder",
        handleOpenNewFolder as EventListener,
      );
    };
  }, [currentFolder, breadcrumb]);

  // Get folders to display (children of current folder)
  // Backend already filters out empty folders, so we only need to filter by parent
  const displayFolders = folders
    .filter((f) => {
      if (!currentFolder) {
        // Show root folders (no parent or parent is null/undefined)
        const parentId =
          typeof f.parent === "object" && f.parent !== null
            ? (f.parent as any).$oid || (f.parent as any).toString()
            : f.parent;
        return !parentId;
      }
      // Show children of current folder
      const parentId =
        typeof f.parent === "object" && f.parent !== null
          ? (f.parent as any).$oid || (f.parent as any).toString()
          : f.parent;
      return parentId === currentFolder;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const getParentId = (folder: Folder) =>
    typeof folder.parent === "object" && folder.parent !== null
      ? (folder.parent as any).$oid || (folder.parent as any).toString()
      : folder.parent;

  const hasDescendantItems = (folderId: string): boolean => {
    const children = folders.filter((f) => getParentId(f) === folderId);
    return children.some(
      (child) =>
        (child.items?.[itemType]?.length || 0) > 0 ||
        hasDescendantItems(child._id),
    );
  };

  // Handle folder click
  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId);
    onFolderChange(folderId);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolder(folderId);
    onFolderChange(folderId);
  };

  // Handle create folder
  const handleCreateFolder = () => {
    setEditingFolder(null);
    setFolderModalVisible(true);
  };

  // Handle folder context menu
  const getFolderContextMenu = (folder: Folder): MenuProps => ({
    items: [
      {
        key: "edit",
        icon: <EditOutlined />,
        label: "Edit Folder",
        onClick: () => {
          setEditingFolder(folder);
          setFolderModalVisible(true);
        },
      },
      {
        key: "move",
        icon: <DragOutlined />,
        label: "Move Folder",
        onClick: () => {
          setMovingFolder(folder);
          setMoveModalVisible(true);
        },
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        label: "Delete Folder",
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: "Delete Folder",
            content: `Are you sure you want to delete "${folder.name}"? Items in this folder will not be deleted.`,
            okText: "Delete",
            okType: "danger",
            onOk: async () => {
              try {
                await FolderService.deleteFolder(folder._id);
                message.success("Folder deleted");
                loadFolders();
                if (currentFolder === folder._id) {
                  setCurrentFolder(folder.parent || null);
                  onFolderChange(folder.parent || null);
                }
              } catch (error: any) {
                message.error(
                  error.response?.data?.message || "Failed to delete folder",
                );
              }
            },
          });
        },
      },
    ],
  });

  // Handle folder save
  const handleFolderSave = async () => {
    await loadFolders();
    setFolderModalVisible(false);
    setEditingFolder(null);
  };

  // Handle folder move
  const handleFolderMove = async () => {
    await loadFolders();
    setMoveModalVisible(false);
    setMovingFolder(null);
  };

  return (
    <div
      style={{
        padding: `${token.padding}px ${token.paddingLG}px`,
        background: token.colorBgLayout,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      {/* Top row: Breadcrumb */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Space>
          <Breadcrumb>
            <Breadcrumb.Item>
              <a
                onClick={() => handleBreadcrumbClick(null)}
                style={{ color: token.colorTextSecondary }}
              >
                <HomeOutlined /> All Items{" "}
                {breadcrumb.length === 0 && displayFolders.length > 0 && (
                  <span>
                    ({displayFolders.length}{" "}
                    {displayFolders.length === 1 ? "Folder" : "Folders"})
                  </span>
                )}
              </a>
            </Breadcrumb.Item>
            {breadcrumb.map((crumb, index) => (
              <Breadcrumb.Item key={crumb._id}>
                <a
                  onClick={() => handleBreadcrumbClick(crumb._id)}
                  style={{ color: token.colorTextSecondary }}
                >
                  {crumb.name}
                  {index === breadcrumb.length - 1 &&
                    displayFolders.length > 0 && (
                      <span
                        style={{
                          marginLeft: 4,
                          fontSize: "0.9em",
                        }}
                      >
                        ({displayFolders.length})
                      </span>
                    )}
                </a>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </Space>
      </div>

      {/* Folder buttons row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Space wrap size={8}>
          {displayFolders.map((folder) => {
            // Check if folder has any items or child folders
            const hasItems = (folder.items?.[itemType]?.length || 0) > 0;

            // Check if folder has any children
            const hasChildren = hasDescendantItems(folder._id);

            const isEmpty = !hasItems && !hasChildren;

            return (
              <Dropdown
                key={folder._id}
                menu={getFolderContextMenu(folder)}
                trigger={["contextMenu"]}
              >
                <Button
                  icon={isEmpty ? <FolderOutlined /> : <FolderAddOutlined />}
                  onClick={() => handleFolderClick(folder._id)}
                  size="small"
                  style={{
                    ...(isEmpty && {
                      borderStyle: "dashed",
                      opacity: 0.5,
                    }),
                    ...(folder.attributes?.color && {
                      borderColor: folder.attributes.color,
                      color: folder.attributes.color,
                    }),
                  }}
                >
                  {folder.name}
                </Button>
              </Dropdown>
            );
          })}
          <Button
            icon={<PlusOutlined />}
            onClick={handleCreateFolder}
            size="small"
            type="primary"
            style={{ marginLeft: 8 }}
          >
            New Folder
          </Button>
        </Space>
        {/* Search controls on right */}
        {searchColumnOptions && onSearchColumnChange && (
          <Space>
            <Select
              value={searchColumn}
              style={{ width: 120 }}
              onChange={onSearchColumnChange}
              size="small"
            >
              {searchColumnOptions.map((opt) => (
                <Select.Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Option>
              ))}
            </Select>
            {(searchColumn === "created" || searchColumn === "updated") &&
            onDateRangeChange ? (
              <DatePicker.RangePicker
                style={{ width: 280 }}
                value={dateRange}
                onChange={(dates) =>
                  onDateRangeChange(dates as [Dayjs | null, Dayjs | null])
                }
                size="small"
              />
            ) : (
              <Input
                placeholder={`Search by ${searchColumn}...`}
                prefix={<SearchOutlined />}
                style={{ width: 280 }}
                value={searchTerm}
                onChange={(e) => onSearchTermChange?.(e.target.value)}
                allowClear
                size="small"
              />
            )}
          </Space>
        )}
      </div>

      {/* Create/Edit Folder Modal */}
      {folderModalVisible && (
        <FolderModal
          visible={folderModalVisible}
          folder={editingFolder}
          parentId={currentFolder}
          onClose={() => {
            setFolderModalVisible(false);
            setEditingFolder(null);
          }}
          onSave={handleFolderSave}
        />
      )}

      {/* Move Folder Modal */}
      {moveModalVisible && movingFolder && (
        <FolderMoveModal
          visible={moveModalVisible}
          folder={movingFolder}
          allFolders={folders}
          onClose={() => {
            setMoveModalVisible(false);
            setMovingFolder(null);
          }}
          onSave={handleFolderMove}
        />
      )}
    </div>
  );
};

export default FolderBar;
