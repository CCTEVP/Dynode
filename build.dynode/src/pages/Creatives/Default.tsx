import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Typography,
  Spin,
  Alert,
  Card,
  Modal,
  DatePicker,
  message,
} from "antd";
import { Tag } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import creativeService from "../../services/creative";
import type { Creative } from "../../types/creative";
import "./Default.css";

const { Title, Text } = Typography;

interface CreativeListItem {
  key: string;
  _id: string;
  name: string;
  identifier?: string;
  description?: string;
  status: string | string[];
  created?: any;
  updated?: any;
  format?: any;
  origin?: string;
}

const Creatives: React.FC = () => {
  const navigate = useNavigate();
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCreatives();
    const openHandler = () => setModalOpen(true);
    const searchHandler = (e: any) => setSearchTerm(e.detail || "");

    window.addEventListener("openNewFolder", openHandler as EventListener);
    window.addEventListener("search", searchHandler as EventListener);

    return () => {
      window.removeEventListener("openNewFolder", openHandler as EventListener);
      window.removeEventListener("search", searchHandler as EventListener);
    };
  }, []);

  const loadCreatives = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await creativeService.getAllCreatives(false); // No children as requested
      setCreatives(data);
      // Debug: log the first few records so we can see which fields exist on the API objects
      // and why some table columns render as "-" (empty/missing values).
      console.debug(
        "[Creatives] fetched:",
        data && data.length ? data.slice(0, 5) : data
      );
    } catch (err) {
      console.error("Failed to load creatives:", err);
      setError("Failed to load creatives. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (creativeId: string) => {
    navigate(`/creatives/edit/${creativeId}`);
  };

  const handleCreate = () => {
    navigate("/creatives/create");
  };

  const handleRemove = (creativeId: string) => {
    Modal.confirm({
      title: "Remove creative",
      content: "This will permanently delete the creative. Are you sure?",
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await creativeService.deleteCreative(creativeId);
          message.success("Creative removed");
          loadCreatives();
        } catch (err) {
          console.error("Failed to delete creative:", err);
          message.error("Failed to remove creative");
        }
      },
    });
  };

  const formatDateTime = (dateObj?: any) => {
    if (!dateObj) return "-";
    // Accept either { $date: string } or a raw ISO string
    const iso =
      typeof dateObj === "string" ? dateObj : dateObj.$date || dateObj;
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "-";
    }
  };

  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      active: "green",
      draft: "orange",
      archived: "red",
      published: "blue",
      default: "default",
    };
    return colors[status.toLowerCase()] || colors.default;
  };

  // Generic helper to build filters from current creatives state
  const getFiltersFor = (mapper: (c: any) => string) => {
    const vals = creatives
      .map((c: any) => mapper(c))
      .filter(
        (v: any) => v !== undefined && v !== null && String(v).trim() !== ""
      );
    const uniq = Array.from(new Set(vals.map((v: any) => String(v))));
    return uniq.map((v) => ({ text: v, value: v }));
  };

  // Small component used as a filter dropdown for date ranges (Created/Updated)
  const DateRangeFilter: React.FC<any> = ({
    setSelectedKeys,
    selectedKeys,
    confirm,
    clearFilters,
  }) => {
    const [range, setRange] = React.useState<any>(
      selectedKeys && selectedKeys[0]
        ? selectedKeys[0]
            .split("|")
            .map((s: string) => (s ? new Date(s) : null))
        : []
    );

    return (
      <div style={{ padding: 8 }}>
        <DatePicker.RangePicker
          value={range}
          onChange={(vals: any) => setRange(vals)}
          showTime
        />
        <div style={{ marginTop: 8, textAlign: "right" }}>
          <Button
            size="small"
            onClick={() => {
              clearFilters && clearFilters();
              confirm();
            }}
            style={{ marginRight: 8 }}
          >
            Reset
          </Button>
          <Button
            type="primary"
            size="small"
            onClick={() => {
              if (range && range.length === 2) {
                const s = new Date(range[0]).toISOString();
                const e = new Date(range[1]).toISOString();
                setSelectedKeys([`${s}|${e}`]);
              } else {
                setSelectedKeys([]);
              }
              confirm();
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    );
  };
  const getUniqueStatuses = () => {
    const statuses = [
      ...new Set(
        creatives.flatMap((creative) => {
          // Handle both string and array formats for status
          if (Array.isArray(creative.status)) {
            return creative.status.filter((s) => s && s.trim() !== "");
          } else if (creative.status && typeof creative.status === "string") {
            return [creative.status];
          }
          return [];
        })
      ),
    ];
    return statuses.map((status) => ({
      text: status.toUpperCase(),
      value: status,
    }));
  };

  const columns: ColumnsType<CreativeListItem> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      width: 260,
      render: (text: string) => <Text strong>{text}</Text>,
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      filters: getFiltersFor((c: any) => c.name),
      onFilter: (value, record) => String(record.name) === String(value),
    },
    {
      title: "Format",
      dataIndex: "format",
      key: "format",
      render: (_text: any, record: any) => {
        const fmt = record?.format;
        if (fmt && typeof fmt === "object") {
          const rawW = fmt.width || fmt.w || fmt.W || "";
          const rawH = fmt.height || fmt.h || fmt.H || "";
          const w = String(rawW).replace(/px$/i, "").trim();
          const h = String(rawH).replace(/px$/i, "").trim();
          if (w && h) return <Text>{`${w} x ${h}`}</Text>;
        }
        // fallback to identifier string
        const id = record?.identifier;
        if (typeof id === "string") {
          const dims = id.split(/[x×]/).map((s) => s.trim());
          if (dims.length === 2 && dims[0] && dims[1]) {
            return <Text>{`${dims[0]} x ${dims[1]}`}</Text>;
          }
          return <Text>{id}</Text>;
        }
        return <Text>-</Text>;
      },
      filters: getFiltersFor((c: any) => {
        const fmt = c?.format || c?.identifier;
        if (!fmt) return "";
        if (typeof fmt === "object") {
          const w = String(fmt.width || fmt.w || "")
            .replace(/px$/i, "")
            .trim();
          const h = String(fmt.height || fmt.h || "")
            .replace(/px$/i, "")
            .trim();
          return w && h ? `${w} x ${h}` : "";
        }
        return typeof fmt === "string" ? fmt : "";
      }),
      onFilter: (value, record) => {
        const v = String(value);
        const s = (() => {
          const fmt = record?.format || record?.identifier;
          if (!fmt) return "";
          if (typeof fmt === "object") {
            const w = String(fmt.width || fmt.w || "")
              .replace(/px$/i, "")
              .trim();
            const h = String(fmt.height || fmt.h || "")
              .replace(/px$/i, "")
              .trim();
            return w && h ? `${w} x ${h}` : "";
          }
          return typeof fmt === "string" ? fmt : "";
        })();
        return s === v;
      },
      sorter: (a: any, b: any) => {
        const aw =
          Number(
            String(a.format?.width || a.format?.w || a.identifier || 0).replace(
              /px$/i,
              ""
            )
          ) || 0;
        const bw =
          Number(
            String(b.format?.width || b.format?.w || b.identifier || 0).replace(
              /px$/i,
              ""
            )
          ) || 0;
        return aw - bw;
      },
    },
    {
      title: "Labels",
      dataIndex: "status",
      key: "status",
      render: (status: string | string[]) => {
        // Handle both string and array formats for status
        const statusText = Array.isArray(status)
          ? status.filter((s) => s && s.trim() !== "").join(", ") || "No Status"
          : status || "No Status";
        let color: "green" | "orange" | "red" | "blue" | "default" = "default";
        switch (getStatusColor(statusText)) {
          case "green":
            color = "green";
            break;
          case "orange":
            color = "orange";
            break;
          case "red":
            color = "red";
            break;
          case "blue":
            color = "blue";
            break;
          default:
            color = "default";
        }
        return (
          <Tag color={color} className="mini-label-tag">
            {statusText.toUpperCase()}
          </Tag>
        );
      },
      filters: getUniqueStatuses(),
      onFilter: (value, record) => {
        const v = String(value);
        if (Array.isArray(record.status)) {
          return record.status.map(String).includes(v);
        }
        return String(record.status || "") === v;
      },
      sorter: (a: any, b: any) => {
        const sa = Array.isArray(a.status)
          ? a.status.join(",")
          : String(a.status || "");
        const sb = Array.isArray(b.status)
          ? b.status.join(",")
          : String(b.status || "");
        return sa.localeCompare(sb);
      },
    },
    {
      title: "Origin",
      dataIndex: "origin",
      key: "origin",
      ellipsis: true,
      render: (text: string, record: any) => {
        const val = text || record.origin || record.description;
        return val || "-";
      },
      filters: getFiltersFor((c: any) => c.origin || c.description),
      onFilter: (value, record) =>
        String(record.origin || record.description) === String(value),
      sorter: (a: any, b: any) =>
        String(a.origin || a.description || "").localeCompare(
          String(b.origin || b.description || "")
        ),
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      render: formatDateTime,
      filterDropdown: (props) => <DateRangeFilter {...props} field="created" />,
      onFilter: (value, record) => {
        if (!value) return true;
        const [s, e] = String(value).split("|");
        const ts = new Date(record.created || 0).getTime();
        return ts >= new Date(s).getTime() && ts <= new Date(e).getTime();
      },
      sorter: (a: any, b: any) =>
        new Date(a.created || 0).getTime() - new Date(b.created || 0).getTime(),
    },
    {
      title: "Updated",
      dataIndex: "updated",
      key: "updated",
      render: formatDateTime,
      filterDropdown: (props) => <DateRangeFilter {...props} field="updated" />,
      onFilter: (value, record) => {
        if (!value) return true;
        const [s, e] = String(value).split("|");
        const ts = new Date(record.updated || 0).getTime();
        return ts >= new Date(s).getTime() && ts <= new Date(e).getTime();
      },
      sorter: (a: any, b: any) =>
        new Date(a.updated || 0).getTime() - new Date(b.updated || 0).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_: any, record: any) => {
        const id = record._id || record.key || "";
        const url = `http://localhost:5000/dynamics/${id}`;
        return (
          <Space>
            <Button
              icon={<EyeOutlined />}
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              size="small"
            />
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(id)}
              size="small"
            />
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemove(id)}
              size="small"
            />
          </Space>
        );
      },
    },
  ];

  // Transform creatives data for the table
  const tableData: CreativeListItem[] = creatives.map((creative: any) => ({
    key: typeof creative._id === "string" ? creative._id : creative._id?.$oid,
    _id: typeof creative._id === "string" ? creative._id : creative._id?.$oid,
    name: creative.name,
    identifier: creative.identifier,
    format: creative.format, // keep structured format available
    origin: creative.origin || creative.description,
    description: creative.description,
    status: creative.status,
    created: creative.created,
    updated: creative.updated,
  }));

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Space direction="vertical" align="center">
          <Spin size="large" />
          <Text>Loading creatives...</Text>
        </Space>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Creatives"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={loadCreatives}>
            Retry
          </Button>
        }
        style={{ margin: "20px" }}
      />
    );
  }

  return (
    <div style={{ fontSize: "90%" }}>
      <div style={{ width: "100%", margin: 0, padding: "32px 0" }}>
        <Card
          bordered={false}
          style={{
            display: "flex",
            flexDirection: "column",
            margin: 0,
            width: "100%",
            maxWidth: "100%",
            background: "transparent",
            boxShadow: "none",
            borderRadius: 0,
            border: "none",
            padding: 0,
          }}
          bodyStyle={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: "100%",
            background: "transparent",
            padding: 0,
            border: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <Title level={2} style={{ margin: 0 }}>
                Creatives
              </Title>
              <Text type="secondary">Manage your creative content</Text>
            </div>

            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadCreatives}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Create New
              </Button>
            </Space>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "100%",
            }}
          >
            <Table
              columns={columns}
              className="no-row-border"
              dataSource={
                searchTerm
                  ? tableData.filter((t) =>
                      t.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                  : tableData
              }
              pagination={{
                total: tableData.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} items`,
              }}
              scroll={{ x: "max-content" }}
              loading={loading}
              locale={{
                emptyText:
                  "No creatives found. Create your first creative to get started!",
              }}
              style={{
                flex: 1,
                width: "100%",
                maxWidth: "100%",
                borderCollapse: "collapse",
                background: "transparent",
              }}
              rowClassName={() => "no-row-border"}
              // remove default header background via class override
            />
          </div>
        </Card>
        {/* New Folder Modal (triggered from layout header) */}
        <Modal
          title="Create New Folder"
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
        >
          <p>
            This is a simulated modal. Folder creation endpoint is not available
            yet.
          </p>
        </Modal>
      </div>
    </div>
  );
};

export default Creatives;
