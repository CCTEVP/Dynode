import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, message, theme } from "antd";
import type {
  Folder,
  CreateFolderDto,
  UpdateFolderDto,
} from "../../../types/folder";
import FolderService from "../../../services/folder";

interface FolderModalProps {
  visible: boolean;
  folder: Folder | null; // null for create, Folder for edit
  parentId: string | null;
  onClose: () => void;
  onSave: () => void;
}

const FolderModal: React.FC<FolderModalProps> = ({
  visible,
  folder,
  parentId,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();
  const isEdit = !!folder;

  // Color presets - using Ant Design 5.x color palette
  const COLOR_PRESETS = [
    { value: token.colorPrimary, label: "Primary" },
    { value: token.colorSuccess, label: "Success" },
    { value: token.colorWarning, label: "Warning" },
    { value: token.colorError, label: "Error" },
    { value: token.colorInfo, label: "Info" },
    { value: "#722ed1", label: "Purple" },
    { value: "#13c2c2", label: "Cyan" },
    { value: "#eb2f96", label: "Magenta" },
    { value: "#a0d911", label: "Lime" },
    { value: "#fa541c", label: "Volcano" },
    { value: "#faad14", label: "Gold" },
    { value: "#2f54eb", label: "Geek Blue" },
  ];

  useEffect(() => {
    if (visible) {
      if (folder) {
        form.setFieldsValue({
          name: folder.name,
          color: folder.attributes?.color || undefined,
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, folder, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (isEdit) {
        const updateData: UpdateFolderDto = {
          name: values.name,
          color: values.color || null,
        };
        await FolderService.updateFolder(folder._id, updateData);
        message.success("Folder updated");
      } else {
        const createData: CreateFolderDto = {
          name: values.name,
          parent: parentId || undefined,
          color: values.color || undefined,
        };
        await FolderService.createFolder(createData);
        message.success("Folder created");
      }

      onSave();
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.errorFields) {
        // Form validation error
        return;
      } else {
        message.error(
          isEdit ? "Failed to update folder" : "Failed to create folder",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Edit Folder" : "Create Folder"}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText={isEdit ? "Save" : "Create"}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Folder Name"
          rules={[
            { required: true, message: "Please enter a folder name" },
            { max: 50, message: "Folder name cannot exceed 50 characters" },
          ]}
        >
          <Input placeholder="Enter folder name" />
        </Form.Item>

        <Form.Item name="color" label="Color (Optional)">
          <Select
            placeholder="Select a color"
            allowClear
            options={COLOR_PRESETS.map((preset) => ({
              value: preset.value,
              label: (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: preset.value,
                      border: "1px solid #d9d9d9",
                    }}
                  />
                  {preset.label}
                </div>
              ),
            }))}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FolderModal;
