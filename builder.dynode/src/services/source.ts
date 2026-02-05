import type { Source, BufferDocument } from "../types/source";
import { getSourceApiBase } from "../../config/env";

const API_BASE = getSourceApiBase();

const getAuthHeaders = () => {
  const token = localStorage.getItem("dynode_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getSources = async (): Promise<Source[]> => {
  const response = await fetch(`${API_BASE}/data/sources`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok)
    throw new Error(`Failed to fetch sources: ${response.statusText}`);
  return response.json();
};

export const getSourceById = async (id: string): Promise<Source> => {
  const response = await fetch(`${API_BASE}/data/sources/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok)
    throw new Error(`Failed to fetch source: ${response.statusText}`);
  return response.json();
};

export const createSource = async (data: Partial<Source>): Promise<Source> => {
  const response = await fetch(`${API_BASE}/data/sources`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error(`Failed to create source: ${response.statusText}`);
  return response.json();
};

export const updateSource = async (
  id: string,
  data: Partial<Source>,
): Promise<Source> => {
  const response = await fetch(`${API_BASE}/data/sources/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok)
    throw new Error(`Failed to update source: ${response.statusText}`);
  return response.json();
};

export const deleteSource = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/data/sources/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!response.ok)
    throw new Error(`Failed to delete source: ${response.statusText}`);
};

export const getEndpointData = async (
  sourceId: string,
  endpointId: string,
  forceBufferUpdate: boolean = false,
  readOnly: boolean = false,
  forcePatternUpdate: boolean = false,
): Promise<BufferDocument> => {
  let url = `${API_BASE}/data/sources/${sourceId}/${endpointId}`;
  const params = new URLSearchParams();
  if (forceBufferUpdate) params.append("forceBufferUpdate", "true");
  if (readOnly) params.append("readOnly", "true");
  if (forcePatternUpdate) params.append("forcePatternUpdate", "true");
  if (params.toString()) url += `?${params.toString()}`;

  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok)
    throw new Error(`Failed to fetch endpoint data: ${response.statusText}`);
  return response.json();
};
