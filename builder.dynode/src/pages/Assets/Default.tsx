import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Modal,
  Tag,
  message,
  Badge,
  theme,
  Tooltip,
  Collapse,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FontSizeOutlined,
  FileOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { AssetBundle, AssetItem } from "../../types/assets";
import assetService from "../../services/asset";
import FolderBar from "../../components/controls/FolderBar/Default";
import ItemMoveModal from "../../components/controls/ItemMoveModal/Default";
import "./Default.css";
import dayjs from "dayjs";

type SearchColumn = "name" | "created" | "updated";

const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<AssetBundle[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchColumn, setSearchColumn] = useState<SearchColumn>("name");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null]
  >([null, null]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [movingItem, setMovingItem] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const data = await assetService.getAssets();
      setAssets(data);
    } catch (error) {
      message.error("Failed to load assets");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: "Delete Asset Bundle",
      content: `Are you sure you want to delete "${name}"? This will permanently remove all associated files.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await assetService.deleteAsset(id);
          message.success("Asset bundle deleted successfully");
          fetchAssets();
        } catch (error) {
          message.error("Failed to delete asset bundle");
          console.error(error);
        }
      },
    });
  };

  const handleCreate = async () => {
    try {
      const newAsset = await assetService.createAsset({
        name: "",
        bundle: [],
      });
      message.success("Asset bundle created successfully");
      navigate(`/assets/${newAsset._id}`);
    } catch (error) {
      message.error("Failed to create asset bundle");
      console.error(error);
    }
  };

  const handleMoveToFolder = (id: string, name: string) => {
    setMovingItem({ id, name });
    setMoveModalVisible(true);
  };

  const getRowContextMenu = (record: AssetBundle): MenuProps => ({
    items: [
      {
        key: "edit",
        label: "Edit Asset",
        icon: <EditOutlined />,
        onClick: () => navigate(`/assets/${record._id}`),
      },
      {
        key: "move",
        label: "Move to Folder",
        icon: <FolderOutlined />,
        onClick: () => handleMoveToFolder(record._id, record.name),
      },
    ],
  });

  const getKindColor = (kind: string) => {
    switch (kind) {
      case "image":
        return (token as any).colorAssetImage || "#52C41A";
      case "video":
        return (token as any).colorAssetVideo || "#F5222D";
      case "font":
        return (token as any).colorAssetFont || "#FA8C16";
      default:
        return (token as any).colorAssetOther || "#8C8C8C";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const columns: ColumnsType<AssetBundle> = [
    {
      title: "Name",
      key: "name",
      width: 250,
      sorter: (a, b) => {
        const nameA = a.name || "Unnamed";
        const nameB = b.name || "Unnamed";
        return nameA.localeCompare(nameB);
      },
      render: (_, record) => {
        const displayName = record.name || "Unnamed Bundle";
        return (
          <a
            onClick={() => navigate(`/assets/${record._id}`)}
            style={{ cursor: "pointer", color: token.colorLink }}
          >
            {displayName}
          </a>
        );
      },
    },
    {
      title: "Assets",
      key: "assets",
      width: 550,
      render: (_, record) => {
        if (record.bundle.length === 0) {
          return (
            <span style={{ color: token.colorTextSecondary }}>No assets</span>
          );
        }

        // Group assets by kind
        const assetsByKind: { [key: string]: AssetItem[] } = {
          image: [],
          video: [],
          font: [],
          other: [],
        };

        record.bundle.forEach((asset) => {
          if (assetsByKind[asset.kind]) {
            assetsByKind[asset.kind].push(asset);
          } else {
            assetsByKind.other.push(asset);
          }
        });

        const kindCounts = {
          image: assetsByKind.image.length,
          video: assetsByKind.video.length,
          font: assetsByKind.font.length,
          other: assetsByKind.other.length,
        };

        const collapseItems = [
          {
            key: "all",
            label: (
              <Space size="small">
                {kindCounts.image > 0 && (
                  <>
                    <FileImageOutlined
                      style={{
                        color: (token as any).colorAssetImage || "#52C41A",
                      }}
                    />
                    <span>Image</span>
                    <Badge
                      count={kindCounts.image}
                      showZero
                      color={(token as any).colorAssetImage || "#52C41A"}
                    />
                  </>
                )}
                {kindCounts.image > 0 &&
                  (kindCounts.video > 0 ||
                    kindCounts.font > 0 ||
                    kindCounts.other > 0) && <span>|</span>}
                {kindCounts.video > 0 && (
                  <>
                    <VideoCameraOutlined
                      style={{
                        color: (token as any).colorAssetVideo || "#F5222D",
                      }}
                    />
                    <span>Video</span>
                    <Badge
                      count={kindCounts.video}
                      showZero
                      color={(token as any).colorAssetVideo || "#F5222D"}
                    />
                  </>
                )}
                {kindCounts.video > 0 &&
                  (kindCounts.font > 0 || kindCounts.other > 0) && (
                    <span>|</span>
                  )}
                {kindCounts.font > 0 && (
                  <>
                    <FontSizeOutlined
                      style={{
                        color: (token as any).colorAssetFont || "#FA8C16",
                      }}
                    />
                    <span>Font</span>
                    <Badge
                      count={kindCounts.font}
                      showZero
                      color={(token as any).colorAssetFont || "#FA8C16"}
                    />
                  </>
                )}
                {kindCounts.font > 0 && kindCounts.other > 0 && <span>|</span>}
                {kindCounts.other > 0 && (
                  <>
                    <FileOutlined
                      style={{
                        color: (token as any).colorAssetOther || "#8C8C8C",
                      }}
                    />
                    <span>Other</span>
                    <Badge
                      count={kindCounts.other}
                      showZero
                      color={(token as any).colorAssetOther || "#8C8C8C"}
                    />
                  </>
                )}
              </Space>
            ),
            children: (
              <Space
                direction="vertical"
                size={0}
                style={{ width: "100%", paddingLeft: "24px" }}
              >
                {record.bundle.map((asset, index) => (
                  <div key={asset._id || index} className="endpoint-row">
                    <Space size="small">
                      <Tag color={getKindColor(asset.kind)}>{asset.kind}</Tag>
                      <span>{asset.name}</span>
                      <Badge
                        count={asset.paths.length}
                        showZero
                        color={getKindColor(asset.kind)}
                      />
                      {asset.status && (
                        <span style={{ color: token.colorTextSecondary }}>
                          ({asset.status})
                        </span>
                      )}
                    </Space>
                  </div>
                ))}
              </Space>
            ),
          },
        ];

        return (
          <Collapse
            items={collapseItems}
            bordered={false}
            size="small"
            ghost
            style={{ background: "transparent" }}
          />
        );
      },
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      width: 200,
      sorter: (a, b) =>
        new Date(a.created).getTime() - new Date(b.created).getTime(),
      render: formatDate,
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      width: 200,
      sorter: (a, b) =>
        new Date(a.updated).getTime() - new Date(b.updated).getTime(),
      render: formatDate,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/assets/${record._id}`)}
              size="small"
              style={{ opacity: 1 }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() =>
                handleDelete(record._id, record.name || "Unnamed Bundle")
              }
              size="small"
              style={{ opacity: 1 }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter assets based on search criteria
  const filteredAssets = assets.filter((asset) => {
    // First filter by folder
    if (currentFolder) {
      // Check if asset has folder field matching currentFolder
      const assetFolderId =
        typeof (asset as any).folder === "object" &&
        (asset as any).folder !== null
          ? ((asset as any).folder as any).$oid ||
            ((asset as any).folder as any).toString()
          : (asset as any).folder;
      if (assetFolderId !== currentFolder) {
        return false;
      }
    }

    // Then apply search filters
    if (searchColumn === "created" || searchColumn === "updated") {
      if (!dateRange[0] || !dateRange[1]) return true;
      const recordDate = dayjs(asset[searchColumn]);
      return (
        recordDate.isAfter(dateRange[0]) &&
        recordDate.isBefore(dateRange[1].add(1, "day"))
      );
    } else {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      if (searchColumn === "name") {
        return asset.name?.toLowerCase().includes(searchLower);
      }
    }
    return true;
  });

  return (
    <div className="assets-page">
      <div className="page-header">
        <div>
          <h1>My Assets</h1>
          <p>Manage your digital hoard with style</p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchAssets}
            loading={loading}
          >
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create New Asset Bundle
          </Button>
        </Space>
      </div>

      <FolderBar
        itemType="assets"
        onFolderChange={(folderId) => setCurrentFolder(folderId)}
        searchColumn={searchColumn}
        onSearchColumnChange={(value) => {
          setSearchColumn(value as SearchColumn);
          setSearchTerm("");
          setDateRange([null, null]);
        }}
        searchColumnOptions={[
          { value: "name", label: "Name" },
          { value: "created", label: "Created" },
          { value: "updated", label: "Updated" },
        ]}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <Table
        columns={columns}
        dataSource={filteredAssets}
        rowKey="_id"
        loading={loading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} asset bundles`,
        }}
        onRow={(_record) => ({
          onContextMenu: (e) => {
            e.preventDefault();
          },
        })}
        components={{
          body: {
            row: (props: any) => {
              const record = filteredAssets.find(
                (item) => item._id === props["data-row-key"],
              );
              if (!record) return <tr {...props} />;
              return (
                <Dropdown
                  menu={getRowContextMenu(record)}
                  trigger={["contextMenu"]}
                >
                  <tr {...props} />
                </Dropdown>
              );
            },
          },
        }}
      />

      <ItemMoveModal
        visible={moveModalVisible}
        itemId={movingItem?.id || ""}
        itemName={movingItem?.name || ""}
        itemType="assets"
        onClose={() => {
          setMoveModalVisible(false);
          setMovingItem(null);
        }}
        onSuccess={() => {
          setMoveModalVisible(false);
          setMovingItem(null);
          fetchAssets();
        }}
      />
    </div>
  );
};

export default AssetsPage;
