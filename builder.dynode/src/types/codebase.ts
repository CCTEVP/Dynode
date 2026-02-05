export interface CodebaseDependency {
  path: string;
  resolvedPath: string;
  id: string;
}

export interface CodebaseHistoryEntry {
  commitId: string;
  author: string;
  date: string;
  message: string;
}

export interface CodebaseFile {
  _id: string;
  filename: string;
  path: string;
  created: string;
  updated: string;
  size: number;
  description: string;
  internalDependencies: CodebaseDependency[];
  externalDependencies: string[];
  externalDependencyLabels?: string[];
  category: string;
  project: string;
  dependencyCount: number;
  directDependencies: Array<{
    _id: string;
    filename: string;
    path: string;
    category: string;
    project: string;
  }>;
  reverseDependencies?: Array<{
    _id: string;
    filename: string;
    path: string;
    category: string;
    project: string;
  }>;
  history: CodebaseHistoryEntry[];
  isInCircularDependency?: boolean;
  dependencyDepth?: number;
  isEntryPoint?: boolean;
}

export interface CodebaseNode {
  id: string;
  type: "file";
  data: {
    file: CodebaseFile;
    label: string;
  };
  position: { x: number; y: number };
}

export interface CodebaseEdge {
  id: string;
  source: string;
  target: string;
  type: "default";
  animated: boolean;
}

export interface CodebaseCategory {
  project: string;
  totalFiles: number;
  categories: Array<{
    category: string;
    count: number;
    files: string[];
  }>;
}
