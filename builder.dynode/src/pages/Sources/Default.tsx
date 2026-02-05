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
  Collapse,
  theme,
  Tooltip,
  Dropdown,
} from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  QuestionCircleFilled,
  ApiOutlined,
  ApiFilled,
  FolderOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Source } from "../../types/source";
import { getSources, deleteSource } from "../../services/source";
import FolderBar from "../../components/controls/FolderBar/Default";
import ItemMoveModal from "../../components/controls/ItemMoveModal/Default";
import "./Default.css";
import dayjs from "dayjs";

type SearchColumn = "name" | "created" | "updated";

const SourcesPage: React.FC = () => {
  const [sources, setSources] = useState<Source[]>([]);
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

  const fetchSources = async () => {
    setLoading(true);
    try {
      const data = await getSources();
      setSources(data);
    } catch (error) {
      message.error("Failed to load sources");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, []);

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: "Delete Source",
      content: `Are you sure you want to delete "${name}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        try {
          await deleteSource(id);
          message.success("Source deleted successfully");
          fetchSources();
        } catch (error) {
          message.error("Failed to delete source");
          console.error(error);
        }
      },
    });
  };

  const handleMoveToFolder = (id: string, name: string) => {
    setMovingItem({ id, name });
    setMoveModalVisible(true);
  };

  const getRowContextMenu = (record: Source): MenuProps => ({
    items: [
      {
        key: "edit",
        label: "Edit Source",
        icon: <EditOutlined />,
        onClick: () => navigate(`/sources/${record._id}`),
      },
      {
        key: "move",
        label: "Move to Folder",
        icon: <FolderOutlined />,
        onClick: () => handleMoveToFolder(record._id, record.name),
      },
    ],
  });

  const columns: ColumnsType<Source> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 250,
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name, record) => (
        <a
          onClick={() => navigate(`/sources/${record._id}`)}
          style={{ cursor: "pointer", color: token.colorLink }}
        >
          {name}
        </a>
      ),
    },
    {
      title: "Sources",
      key: "sources",
      width: 450,
      render: (_, record) => {
        const internalCount = record.internal?.length || 0;
        const externalCount = record.external?.length || 0;

        if (internalCount === 0 && externalCount === 0) {
          return (
            <span style={{ color: token.colorTextSecondary }}>No sources</span>
          );
        }

        const allSources = [
          ...(record.internal || []).map((source: any) => ({
            ...source,
            sourceType: "internal",
          })),
          ...(record.external || []).map((source: any) => ({
            ...source,
            sourceType: "external",
          })),
        ];

        const collapseItems = [
          {
            key: "all",
            label: (
              <Space size="small">
                {internalCount > 0 && (
                  <>
                    <ApiOutlined style={{ color: token.colorSuccess }} />
                    <span>Internal</span>
                    <Badge
                      count={internalCount}
                      showZero
                      color={token.colorSuccess}
                    />
                  </>
                )}
                {internalCount > 0 && externalCount > 0 && <span>|</span>}
                {externalCount > 0 && (
                  <>
                    <ApiFilled style={{ color: token.colorInfo }} />
                    <span>External</span>
                    <Badge
                      count={externalCount}
                      showZero
                      color={token.colorInfo}
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
                {allSources.map((source: any, index: number) => (
                  <div key={source._id || index} className="endpoint-row">
                    <Space size="small">
                      <Tag
                        color={
                          source.sourceType === "internal"
                            ? "#52C41A"
                            : "#29B6F6"
                        }
                      >
                        {source.sourceType === "internal"
                          ? "Internal"
                          : "External"}
                      </Tag>
                      <span>{source.name}</span>
                      <Badge
                        count={source.variables?.length || 0}
                        showZero
                        color={
                          source.sourceType === "internal"
                            ? "#52C41A"
                            : "#29B6F6"
                        }
                      />
                      {source.sourceType === "external" &&
                        (source.status === "valid" ? (
                          <CheckCircleFilled
                            style={{
                              color: token.colorSuccess,
                              fontSize: "20px",
                            }}
                          />
                        ) : source.status === "invalid" ? (
                          <CloseCircleFilled
                            style={{
                              color: token.colorError,
                              fontSize: "20px",
                            }}
                          />
                        ) : (
                          <QuestionCircleFilled
                            style={{
                              color: token.colorBorder,
                              fontSize: "20px",
                            }}
                          />
                        ))}
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
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.created).getTime() - new Date(b.created).getTime(),
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.updated).getTime() - new Date(b.updated).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/sources/${record._id}`)}
              size="small"
              style={{ opacity: 1 }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id, record.name)}
              size="small"
              style={{ opacity: 1 }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filter sources based on search criteria
  const filteredSources = sources.filter((source) => {
    // First filter by folder
    if (currentFolder) {
      // Check if source has folder field matching currentFolder
      const sourceFolderId =
        typeof (source as any).folder === "object" &&
        (source as any).folder !== null
          ? ((source as any).folder as any).$oid ||
            ((source as any).folder as any).toString()
          : (source as any).folder;
      if (sourceFolderId !== currentFolder) {
        return false;
      }
    }

    // Then apply search filters
    if (searchColumn === "created" || searchColumn === "updated") {
      if (!dateRange[0] || !dateRange[1]) return true;
      const recordDate = dayjs(source[searchColumn]);
      return (
        recordDate.isAfter(dateRange[0]) &&
        recordDate.isBefore(dateRange[1].add(1, "day"))
      );
    } else {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      if (searchColumn === "name") {
        return source.name?.toLowerCase().includes(searchLower);
      }
    }
    return true;
  });

  return (
    <div className="sources-page">
      <div className="sources-header">
        <div>
          <h1>My Sources</h1>
          <p>Manage your external data sources with caching</p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchSources}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/sources/new")}
          >
            Create New
          </Button>
        </Space>
      </div>

      <FolderBar
        itemType="sources"
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
        dataSource={filteredSources}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        onRow={(_record) => ({
          onContextMenu: (e) => {
            e.preventDefault();
          },
        })}
        components={{
          body: {
            row: (props: any) => {
              const record = filteredSources.find(
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
        itemType="sources"
        onClose={() => {
          setMoveModalVisible(false);
          setMovingItem(null);
        }}
        onSuccess={() => {
          setMoveModalVisible(false);
          setMovingItem(null);
          fetchSources();
        }}
      />
    </div>
  );
};

export default SourcesPage;
