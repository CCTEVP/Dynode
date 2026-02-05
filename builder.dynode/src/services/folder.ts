import type {
  Folder,
  CreateFolderDto,
  UpdateFolderDto,
  FolderBreadcrumb,
} from "../types/folder";

const API_BASE = "/api/data/folders";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("dynode_auth_token")}`,
});

class FolderService {
  /**
   * Get all folders (sorted alphabetically by name)
   */
  async getFolders(): Promise<Folder[]> {
    const response = await fetch(API_BASE, { headers: getHeaders() });
    if (!response.ok) {
      throw new Error(`Failed to fetch folders: ${response.statusText}`);
    }
    const folders = await response.json();
    // Backend already sorts alphabetically, but ensure consistency
    return folders.sort((a: Folder, b: Folder) => a.name.localeCompare(b.name));
  }

  /**
   * Get a single folder by ID
   */
  async getFolder(id: string): Promise<Folder> {
    const response = await fetch(`${API_BASE}/${id}`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch folder: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Create a new folder
   */
  async createFolder(data: CreateFolderDto): Promise<Folder> {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  }

  /**
   * Update an existing folder
   */
  async updateFolder(id: string, data: UpdateFolderDto): Promise<Folder> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  }

  /**
   * Delete a folder (items remain, just lose folder reference)
   */
  async deleteFolder(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
  }

  /**
   * Get breadcrumb path from root to specified folder
   */
  async getBreadcrumb(id: string): Promise<FolderBreadcrumb[]> {
    const response = await fetch(`${API_BASE}/${id}/breadcrumb`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch breadcrumb: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get folder depth level (0-2, where 0 is root)
   */
  async getDepth(id: string): Promise<number> {
    const response = await fetch(`${API_BASE}/${id}/depth`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch depth: ${response.statusText}`);
    }
    const data = await response.json();
    return data.depth;
  }

  /**
   * Check if folder has no items assigned
   */
  async checkIsEmpty(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/${id}/isEmpty`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to check if empty: ${response.statusText}`);
    }
    const data = await response.json();
    return data.isEmpty;
  }

  /**
   * Get root folders (folders without parent)
   */
  getRootFolders(folders: Folder[]): Folder[] {
    return folders
      .filter((f) => !f.parent)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get child folders of a specific folder
   */
  getChildFolders(folders: Folder[], parentId: string): Folder[] {
    return folders
      .filter((f) => f.parent === parentId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Check if a folder is empty (no items)
   */
  isFolderEmpty(folder: Folder): boolean {
    const items = folder.items;
    return (
      (!items.creatives || items.creatives.length === 0) &&
      (!items.sources || items.sources.length === 0) &&
      (!items.assets || items.assets.length === 0)
    );
  }

  /**
   * Add item to folder
   */
  async addItemToFolder(
    folderId: string,
    itemType: "creatives" | "sources" | "assets",
    itemId: string,
  ): Promise<Folder> {
    const response = await fetch(`${API_BASE}/${folderId}/items`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ type: itemType, itemId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  }

  /**
   * Remove item from folder
   */
  async removeItemFromFolder(
    folderId: string,
    itemType: "creatives" | "sources" | "assets",
    itemId: string,
  ): Promise<Folder> {
    const response = await fetch(
      `${API_BASE}/${folderId}/items/${itemType}/${itemId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      },
    );
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
    return response.json();
  }

  /**
   * Bulk assign items to folder (or remove from all if folderId is null)
   */
  async bulkAssignToFolder(
    itemType: "creatives" | "sources" | "assets",
    itemIds: string[],
    folderId: string | null,
  ): Promise<void> {
    const response = await fetch(`${API_BASE}/bulk-assign`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ itemType, itemIds, folderId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw error;
    }
  }

  /**
   * Move a single item to a folder (or to root if folderId is null)
   */
  async moveItemToFolder(
    itemId: string,
    itemType: "creatives" | "sources" | "assets",
    folderId: string | null,
  ): Promise<void> {
    // Use bulk assign with single item
    return this.bulkAssignToFolder(itemType, [itemId], folderId);
  }
}

export default new FolderService();
