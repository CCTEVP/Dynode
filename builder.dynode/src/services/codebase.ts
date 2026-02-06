import env from "../config/env";
import type { CodebaseFile } from "../types/codebase";
import logger from "./logger";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class CodebaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.sourceApi;
  }

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private getCacheKey(key: string): string {
    return `codebase_${key}`;
  }

  private getCache<T>(key: string): T | null {
    try {
      const cached = sessionStorage.getItem(this.getCacheKey(key));
      if (!cached) return null;

      const item: CacheItem<T> = JSON.parse(cached);
      const now = Date.now();

      if (now - item.timestamp > CACHE_TTL) {
        sessionStorage.removeItem(this.getCacheKey(key));
        return null;
      }

      return item.data;
    } catch (error) {
      logger.warn("Cache read error", { error, key });
      return null;
    }
  }

  private setCache<T>(key: string, data: T): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(this.getCacheKey(key), JSON.stringify(item));
    } catch (error) {
      logger.warn("Cache write error", { error, key });
    }
  }

  async getProjects(): Promise<string[]> {
    return ["builder", "echo", "render", "source"];
  }

  async getFilesByProject(
    project?: string,
    category?: string,
  ): Promise<CodebaseFile[]> {
    const cacheKey = `files_${project || "all"}_${category || "all"}`;
    const cached = this.getCache<CodebaseFile[]>(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams();
      if (project) params.append("project", project);
      if (category) params.append("category", category);

      const url = `${this.baseUrl}/data/codebase?${params.toString()}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      logger.error("Error fetching codebase files", {
        error,
        project,
        category,
      });
      throw error;
    }
  }

  async getFileDetails(id: string): Promise<CodebaseFile> {
    const cacheKey = `file_${id}`;
    const cached = this.getCache<CodebaseFile>(cacheKey);
    if (cached) return cached;

    try {
      const url = `${this.baseUrl}/data/codebase/${id}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      logger.error("Error fetching file details", { error, id });
      throw error;
    }
  }

  clearCache(): void {
    const keys = Object.keys(sessionStorage);
    keys.forEach((key) => {
      if (key.startsWith("codebase_")) {
        sessionStorage.removeItem(key);
      }
    });
  }
}

export default new CodebaseService();
