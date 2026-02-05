import React, { useState, useEffect, useMemo } from "react";
import { Modal, Form, TreeSelect, message } from "antd";
import type { Folder, UpdateFolderDto } from "../../../types/folder";
import FolderService from "../../../services/folder";
import { HomeOutlined, FolderOutlined } from "@ant-design/icons";

interface FolderMoveModalProps {
  visible: boolean;
  folder: Folder;
  allFolders: Folder[];
  onClose: () => void;
  onSave: () => void;
}

interface TreeNode {
  value: string;
  title: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
}

const FolderMoveModal: React.FC<FolderMoveModalProps> = ({
  visible,
  folder,
  allFolders,
  onClose,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Build folder tree structure
  const treeData = useMemo(() => {
    // Helper to check if a folder is a descendant of the moving folder
    const isDescendant = (folderId: string, targetId: string): boolean => {
      if (folderId === targetId) return true;

      const children = allFolders.filter((f) => f.parent === folderId);
      for (const child of children) {
        if (isDescendant(child._id, targetId)) {
          return true;
        }
      }
      return false;
    };

    // Build tree recursively
    const buildTree = (
      parentId: string | null,
      depth: number = 0,
    ): TreeNode[] => {
      return allFolders
        .filter((f) => (parentId ? f.parent === parentId : !f.parent))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((f) => {
          // Disable current folder and its descendants
          const isCurrentOrDescendant =
            f._id === folder._id || isDescendant(f._id, folder._id);

          // Disable if depth would exceed 2 (max 3 levels: 0, 1, 2)
          const wouldExceedDepth = depth >= 2;

          return {
            value: f._id,
            title: (
              <span>
                <FolderOutlined style={{ marginRight: 8 }} />
                {f.name}
              </span>
            ),
            children: buildTree(f._id, depth + 1),
            disabled: isCurrentOrDescendant || wouldExceedDepth,
          };
        });
    };

    // Root node + folder tree
    return [
      {
        value: "__ROOT__",
        title: (
          <span>
            <HomeOutlined style={{ marginRight: 8 }} />
            Root (No Parent)
          </span>
        ),
        children: buildTree(null, 0),
      },
    ];
  }, [allFolders, folder]);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        parent: folder.parent || "__ROOT__",
      });
    }
  }, [visible, folder, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const updateData: UpdateFolderDto = {
        parent: values.parent === "__ROOT__" ? null : values.parent,
      };

      await FolderService.updateFolder(folder._id, updateData);
      message.success("Folder moved");
      onSave();
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.errorFields) {
        // Form validation error
        return;
      } else {
        message.error("Failed to move folder");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Move "${folder.name}"`}
      open={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Move"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="parent"
          label="Move to"
          rules={[{ required: false }]}
          help="Select a destination folder or root. Disabled folders would exceed depth limits or create circular references."
        >
          <TreeSelect
            treeData={treeData}
            placeholder="Select destination"
            treeDefaultExpandAll
            showSearch
            treeNodeFilterProp="title"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FolderMoveModal;
