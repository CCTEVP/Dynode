import type { Creative, CreativeResponse } from "../types/creative";
import env from "../../config/env";
import logger from "./logger";

interface ElementWithType {
  widgetType: string;
  data: any;
  path: string[];
}

interface CreativeWithElements {
  root: Omit<Creative, "elements">;
  elements: any[];
}

interface CreativeWithFlatElements {
  root: Omit<Creative, "elements">;
  elements: ElementWithType[];
}

class CreativeService {
  // Use relative /api proxy inside docker (nginx forwards to source)
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

  async getAllCreatives(children: boolean = false): Promise<Creative[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/data/creatives?children=${children}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return [];
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // The API returns data directly as an array, not wrapped in an object
      if (Array.isArray(data)) {
        return data;
      } else if (data.success && Array.isArray(data.creatives)) {
        return data.creatives;
      } else {
        throw new Error(data.message || "Failed to fetch creatives");
      }
    } catch (error) {
      logger.error("Error fetching creatives", { error });
      throw error;
    }
  }

  async getCreative(id: string): Promise<Creative | null> {
    try {
      const url = `${this.baseUrl}/data/creatives/${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();

      // The API might return data directly or wrapped in an object
      if (data._id) {
        // Direct creative object
        return data;
      } else if (data.success && data.creative) {
        // Wrapped response
        return data.creative;
      } else {
        throw new Error(data.message || "Failed to fetch creative");
      }
    } catch (error) {
      logger.error("Error fetching creative", { error, id });
      throw error;
    }
  }

  async updateCreative(
    id: string,
    creativeData: Partial<Creative>,
  ): Promise<Creative | null> {
    try {
      const url = `${this.baseUrl}/data/creatives/${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(creativeData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CreativeResponse = await response.json();

      if (data.success && data.creative) {
        return data.creative;
      } else {
        throw new Error(data.message || "Failed to update creative");
      }
    } catch (error) {
      logger.error("Error updating creative", { error, id });
      throw error;
    }
  }

  /**
   * Recursively collects all elements (with their widget type) from the creative,
   * flattening the tree structure. Each element will include its widget type and path.
   */
  private collectElementsRecursively(
    elements: any[],
    parentPath: string[] = [],
  ): ElementWithType[] {
    const collected: ElementWithType[] = [];

    elements.forEach((element, idx) => {
      // Each element is an object with a single key (widget type)
      const [widgetType] = Object.keys(element);
      const data = element[widgetType];
      const currentPath = [...parentPath, data.identifier || widgetType || idx];

      collected.push({ widgetType, data, path: currentPath });

      // If this element has children in "contents", recurse
      if (Array.isArray(data.contents) && data.contents.length > 0) {
        data.contents.forEach((child: any) => {
          collected.push(
            ...this.collectElementsRecursively([child], currentPath),
          );
        });
      }
    });

    return collected;
  }

  /**
   * Fetches a creative by ID and returns:
   * - root: the creative object without the 'elements' field
   * - elements: a flat array of all elements (including nested ones), each with widgetType, data, and path
   */
  async getCreativeWithFlatElements(
    creativeId: string,
  ): Promise<CreativeWithFlatElements> {
    const creative = await this.getCreative(creativeId);

    if (!creative) {
      throw new Error(`Creative with ID ${creativeId} not found`);
    }

    // Separate elements from the root object
    const { elements = [], ...root } = creative as any;

    // Recursively collect all elements (flat)
    const flatElements = this.collectElementsRecursively(elements);

    return {
      root: root as Omit<Creative, "elements">,
      elements: flatElements,
    };
  }

  /**
   * Fetches a creative by ID and returns an object with:
   * - root: the creative object without the 'elements' field
   * - elements: an array of element objects (from creative.elements)
   */
  async getCreativeWithElements(
    creativeId: string,
  ): Promise<CreativeWithElements> {
    const creative = await this.getCreative(creativeId);

    if (!creative) {
      throw new Error(`Creative with ID ${creativeId} not found`);
    }

    // Separate elements from the root object
    const { elements = [], ...root } = creative as any;

    return {
      root: root as Omit<Creative, "elements">,
      elements,
    };
  }

  // Backward compatibility aliases for retriever functions
  async fetchCreativeById(creativeId: string): Promise<Creative | null> {
    return this.getCreative(creativeId);
  }

  async fetchCreatives(): Promise<Creative[]> {
    return this.getAllCreatives(false);
  }

  async fetchCreativeWithAllElementsFlat(
    creativeId: string,
  ): Promise<CreativeWithFlatElements> {
    return this.getCreativeWithFlatElements(creativeId);
  }

  async fetchCreativeWithElementsSeparated(
    creativeId: string,
  ): Promise<CreativeWithElements> {
    return this.getCreativeWithElements(creativeId);
  }

  async deleteCreative(creativeId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/data/creatives/${encodeURIComponent(creativeId)}`,
        {
          method: "DELETE",
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          this.handleAuthError();
          return false;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: any = await response.json();
      return data && (data.success === true || response.status === 204);
    } catch (error) {
      logger.error("Error deleting creative", { error, creativeId });
      throw error;
    }
  }
}

export default new CreativeService();
