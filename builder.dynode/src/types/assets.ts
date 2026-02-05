export interface AssetPath {
  mime: string;
  filename: string;
  extension: string;
}

export interface AssetItem {
  _id: string;
  name: string;
  kind: "video" | "image" | "font" | "other";
  created: string;
  updated: string;
  status: string;
  paths: AssetPath[];
}

export interface AssetChange {
  timestamp: string;
  user: string;
}

export interface AssetBundle {
  _id: string;
  name: string;
  bundle: AssetItem[];
  created: string;
  updated: string;
  changes: AssetChange[];
}

export interface AssetListItem extends AssetBundle {
  // Extended properties for list view
  assetCount?: number;
  firstAssetName?: string;
}
