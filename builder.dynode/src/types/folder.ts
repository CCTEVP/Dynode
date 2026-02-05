export interface FolderOwner {
  domain: string;
  user: string;
}

export interface FolderItems {
  creatives?: string[];
  sources?: string[];
  assets?: string[];
}

export interface FolderAttributes {
  color?: string;
}

export interface Folder {
  _id: string;
  name: string;
  owner: FolderOwner;
  items: FolderItems;
  domains: string[];
  parent?: string;
  attributes: FolderAttributes;
  created?: string;
  updated?: string;
}

export interface CreateFolderDto {
  name: string;
  parent?: string;
  color?: string;
}

export interface UpdateFolderDto {
  name?: string;
  parent?: string;
  color?: string;
}

export interface FolderBreadcrumb {
  _id: string;
  name: string;
  color?: string;
}
