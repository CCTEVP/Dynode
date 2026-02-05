import React, { useState, useEffect } from "react";
import { Modal, TreeSelect, message, theme } from "antd";
import { FolderFilled } from "@ant-design/icons";
import type { Folder } from "../../../types/folder";
import FolderService from "../../../services/folder";

interface ItemMoveModalProps {
  visible: boolean;
  itemId: string;
  itemName: string;
  itemType: "creatives" | "sources" | "assets";
  currentFolderId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
  onSave?: (folderId: string | null) => void;
}

const ItemMoveModal: React.FC<ItemMoveModalProps> = ({
  visible,
  itemId,
  itemName,
  itemType,
  currentFolderId,
  onClose,
  onSuccess,
  onSave,
}) => {
  const { token } = theme.useToken();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    currentFolderId || undefined,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadFolders();
      setSelectedFolder(currentFolderId || undefined);
    }
  }, [visible, currentFolderId]);

  const loadFolders = async () => {
    try {
      const data = await FolderService.getFolders();
      setFolders(data);
    } catch (error) {
      message.error("Failed to load folders");
    }
  };

  // Build tree data for TreeSelect
  const buildTreeData = () => {
    const rootItems = folders.filter((f) => {
      const parentId =
        typeof f.parent === "object" && f.parent !== null
          ? (f.parent as any).$oid || (f.parent as any).toString()
          : f.parent;
      return !parentId;
    });

    const renderFolderTitle = (folder: Folder) => (
      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <FolderFilled
          style={{ color: folder.attributes?.color || "#faad14" }}
        />
        {folder.name}
      </span>
    );

    const buildChildren = (parentId: string): any[] => {
      return folders
        .filter((f) => {
          const fParentId =
            typeof f.parent === "object" && f.parent !== null
              ? (f.parent as any).$oid || (f.parent as any).toString()
              : f.parent;
          return fParentId === parentId;
        })
        .map((f) => ({
          title: renderFolderTitle(f),
          value: f._id,
          children: buildChildren(f._id),
        }));
    };

    return [
      {
        title: (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FolderFilled style={{ color: "#faad14" }} />
            Root (No Folder)
          </span>
        ),
        value: "__root__",
        children: [],
      },
      ...rootItems.map((f) => ({
        title: renderFolderTitle(f),
        value: f._id,
        children: buildChildren(f._id),
      })),
    ];
  };

  const itemTypeLabel =
    itemType.charAt(0).toUpperCase() + itemType.slice(1, -1);

  const handleOk = async () => {
    setLoading(true);
    try {
      const targetFolder =
        selectedFolder === "__root__" ? null : selectedFolder || null;

      if (onSave) {
        // If onSave is provided, use it (for custom handling)
        await onSave(targetFolder);
      } else {
        // Otherwise, use FolderService to move the item
        await FolderService.moveItemToFolder(itemId, itemType, targetFolder);
        message.success(`${itemTypeLabel} moved successfully`);
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      message.error("Failed to move item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`Move ${itemTypeLabel} to Folder`}
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Move"
    >
      <p>
        Select a destination folder for <strong>{itemName}</strong>:
      </p>
      <TreeSelect
        style={{ width: "100%" }}
        value={selectedFolder}
        dropdownStyle={{ 
          maxHeight: 400, 
          overflow: "auto",
          // Use CSS custom property for theme-aware selected background
          ["--tree-node-selected-bg" as any]: token.controlItemBgActive,
        }}
        treeData={buildTreeData()}
        placeholder="Select a folder"
        treeDefaultExpandAll
        onChange={(value) => setSelectedFolder(value)}
        allowClear
        popupClassName="item-move-modal-tree"
      />
      <style>{`
        .item-move-modal-tree .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected {
          background-color: ${token.controlItemBgActive} !important;
        }
      `}</style>
    </Modal>
  );
};

export default ItemMoveModal;
