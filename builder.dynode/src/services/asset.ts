import type { AssetBundle } from "../types/assets";
import env from "../../config/env";

class AssetService {
  private baseUrl = env.env === "docker" ? "/api" : env.externalOrigins.source;

  private getHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("dynode_auth_token")}`,
    };
  }

  private handleAuthError() {
    localStorage.removeItem("dynode_auth_token");
    window.location.href = "/";
  }

  async getAssets(): Promise<AssetBundle[]> {
    try {
      const response = await fetch(`${this.baseUrl}/data/assets`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Error fetching assets:", error);
      throw error;
    }
  }

  async getAsset(id: string): Promise<AssetBundle | null> {
    try {
      const response = await fetch(`${this.baseUrl}/data/assets/${id}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return null;
        }
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching asset:", error);
      throw error;
    }
  }

  async createAsset(data: Partial<AssetBundle>): Promise<AssetBundle> {
    try {
      const response = await fetch(`${this.baseUrl}/data/assets`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating asset:", error);
      throw error;
    }
  }

  async updateAsset(
    id: string,
    data: Partial<AssetBundle>,
  ): Promise<AssetBundle> {
    try {
      const response = await fetch(`${this.baseUrl}/data/assets/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating asset:", error);
      throw error;
    }
  }

  async deleteAsset(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/data/assets/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          throw new Error("Unauthorized");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting asset:", error);
      throw error;
    }
  }

  async uploadFiles(
    files: FileList | File[],
    bundleId?: string,
    assetName?: string,
    assetId?: string,
  ): Promise<AssetBundle> {
    try {
      const formData = new FormData();

      // Add files
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      // Add metadata
      if (bundleId) formData.append("bundleId", bundleId);
      if (assetName) formData.append("assetName", assetName);
      if (assetId) formData.append("assetId", assetId);

      const response = await fetch(`${this.baseUrl}/files/assets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("dynode_auth_token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          throw new Error("Unauthorized");
        }
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      return result.asset;
    } catch (error) {
      console.error("Error uploading files:", error);
      throw error;
    }
  }
}

export default new AssetService();
