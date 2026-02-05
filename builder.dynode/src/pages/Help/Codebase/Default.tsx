import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Typography,
  Select,
  Spin,
  Alert,
  Card,
  Collapse,
  Tag,
  Space,
  Radio,
  Input,
  Button,
} from "antd";
import {
  ReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  type OnSelectionChangeParams,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./reactflow-selection.css";
import codebaseService from "../../../services/codebase";
import type { CodebaseFile } from "../../../types/codebase";
import {
  getLayoutedElements,
  groupByDirectory,
  getNodeSize,
  type LayoutDirection,
} from "../../../utils/layoutUtils";
import "./styles.css";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  source: "#1890ff",
  config: "#8c8c8c",
  style: "#722ed1",
  documentation: "#52c41a",
  test: "#faad14",
  "build-cache": "#d9d9d9",
  data: "#13c2c2",
  image: "#eb2f96",
  deployment: "#fa8c16",
  security: "#f5222d",
  "project-meta": "#2f54eb",
  other: "#bfbfbf",
};

// Custom GroupNode component to display folder labels
const GroupNode = ({ data }: { data: any }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "-45px",
        left: "0",
        padding: "8px 12px",
        background: "rgba(24, 144, 255, 0.95)",
        border: "2px solid #1890ff",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "bold",
        color: "#fff",
        minWidth: "200px",
        textAlign: "center",
        zIndex: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {data.label}
      <span
        style={{
          marginLeft: "8px",
          fontSize: "12px",
          fontWeight: "normal",
          opacity: 0.8,
        }}
      >
        ({data.fileCount} files)
      </span>
    </div>
  );
};

// Custom FileNode component to preserve top/left positioning
const FileNode = ({
  data,
  style,
}: {
  data: any;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      style={{
        ...style,
        position: data.hasParent ? "relative" : undefined,
        top: data.hasParent ? "15px" : undefined,
        left: data.hasParent ? "15px" : undefined,
      }}
    >
      {data.label}
    </div>
  );
};

const CodebasePageContent: React.FC = () => {
  const { fitView } = useReactFlow();
  const [files, setFiles] = useState<CodebaseFile[]>([]);
  const [allFilesForProject, setAllFilesForProject] = useState<CodebaseFile[]>(
    [],
  ); // All files before category filtering
  const [selectedFile, setSelectedFile] = useState<CodebaseFile | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("source");
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [allEdges, setAllEdges] = useState<Edge[]>([]); // Store all edges
  const [allLayoutedNodes, setAllLayoutedNodes] = useState<Node[]>([]); // Store all layouted nodes
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(
    new Set(),
  ); // Track selected nodes for styling
  const [layoutMode, setLayoutMode] = useState<"hierarchical" | "grid">(
    "hierarchical",
  );
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>("TB");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Fetch files and apply layout
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch files for the selected project (without category filter)
      const data = await codebaseService.getFilesByProject(
        selectedProject,
        undefined, // Don't filter by category in API call
      );

      // Store all files for category counts
      setAllFilesForProject(data);

      // Filter by selected categories on the client side
      const filteredData =
        selectedCategory.length > 0
          ? data.filter((file) => selectedCategory.includes(file.category))
          : data;

      setFiles(filteredData);

      // Separate files into linked (in dependency chain) and orphaned (standalone)
      const linkedFiles = filteredData.filter(
        (f) => f.dependencyDepth !== undefined && f.dependencyDepth >= 0,
      );
      const orphanedFiles = filteredData.filter(
        (f) => f.dependencyDepth === undefined || f.dependencyDepth === -1,
      );

      // Group linked files by directory
      const dirGroups = groupByDirectory(linkedFiles);

      // Group orphaned files by category
      const orphanedByCategory = new Map<string, CodebaseFile[]>();
      orphanedFiles.forEach((file) => {
        const category = file.category || "other";
        if (!orphanedByCategory.has(category)) {
          orphanedByCategory.set(category, []);
        }
        orphanedByCategory.get(category)!.push(file);
      });

      // Create group nodes for directories (linked files)
      const groupNodes: Node[] = [];
      dirGroups.forEach((filesInDir, dirPath) => {
        const groupId = `group-dir-${dirPath}`;
        const childCount = filesInDir.length;
        const cols = Math.ceil(Math.sqrt(childCount));
        const rows = Math.ceil(childCount / cols);

        const maxNodeWidth = 270;
        const maxNodeHeight = 104;
        const spacing = 20;
        const padding = 80; // Increased from 60 for better margins

        const groupWidth = padding + cols * (maxNodeWidth + spacing);
        const groupHeight = padding + rows * (maxNodeHeight + spacing);

        groupNodes.push({
          id: groupId,
          type: "group",
          data: {
            label:
              dirPath === "root" ? "Root" : dirPath.split("/").pop() || dirPath,
            fullPath: dirPath,
            fileCount: filesInDir.length,
            isOrphanedGroup: false,
          },
          position: { x: 0, y: 0 },
          style: {
            width: groupWidth,
            height: groupHeight,
            backgroundColor: "rgba(240, 240, 240, 0.3)",
            border: "2px dashed #ccc",
            borderRadius: "8px",
            padding: "40px 30px 30px 30px",
          },
        });
      });

      // Create category group nodes for orphaned files
      orphanedByCategory.forEach((filesInCategory, category) => {
        const groupId = `group-cat-${category}`;
        const childCount = filesInCategory.length;
        const cols = Math.ceil(Math.sqrt(childCount));
        const rows = Math.ceil(childCount / cols);

        const maxNodeWidth = 270;
        const maxNodeHeight = 104;
        const spacing = 20;
        const padding = 80; // Increased from 60 for better margins

        const groupWidth = padding + cols * (maxNodeWidth + spacing);
        const groupHeight = padding + rows * (maxNodeHeight + spacing);

        groupNodes.push({
          id: groupId,
          type: "group",
          data: {
            label: `${category.toUpperCase()}`,
            fullPath: category,
            fileCount: filesInCategory.length,
            isOrphanedGroup: true,
          },
          position: { x: 0, y: 0 },
          style: {
            width: groupWidth,
            height: groupHeight,
            backgroundColor: CATEGORY_COLORS[category]
              ? `${CATEGORY_COLORS[category]}15`
              : "rgba(240, 240, 240, 0.3)",
            border: `2px dashed ${CATEGORY_COLORS[category] || "#ccc"}`,
            borderRadius: "8px",
            padding: "40px 30px 30px 30px",
          },
        });
      });

      // Create file nodes with size based on dependency count
      const fileNodes: Node[] = filteredData.map((file) => {
        const size = getNodeSize(file.dependencyCount);
        const isSelected = selectedNodeIds.has(file._id);
        const isOrphaned =
          file.dependencyDepth === undefined || file.dependencyDepth === -1;

        // Add circular dependency indicator to label
        let nodeLabel = file.filename;
        if (file.isInCircularDependency) {
          nodeLabel = `⚠️ ${file.filename}`;
        }
        if (file.isEntryPoint) {
          nodeLabel = `🚀 ${file.filename}`;
        }

        // Determine parent group - ONLY for grid mode
        let parentId = undefined;
        if (layoutMode === "grid") {
          if (isOrphaned) {
            // Orphaned files go into category groups
            parentId = `group-cat-${file.category || "other"}`;
          } else {
            // Linked files go into directory groups
            const dirPath =
              file.path.split("/").slice(0, -1).join("/") || "root";
            parentId = `group-dir-${dirPath}`;
          }
        }

        return {
          id: file._id,
          type: "file",
          data: {
            label: nodeLabel,
            file,
            hasParent: !!parentId,
          },
          position: { x: 0, y: 0 }, // Will be calculated by layout
          parentId: parentId,
          width: size.width, // ReactFlow v12: MUST be top-level
          height: size.height, // ReactFlow v12: MUST be top-level
          style: {
            position: parentId ? "relative" : undefined,
            top: parentId ? "15px" : undefined,
            left: parentId ? "15px" : undefined,
            background: file.isInCircularDependency
              ? "#ff4d4f" // Red for circular dependencies
              : CATEGORY_COLORS[file.category] || CATEGORY_COLORS.other,
            color: "#fff",
            border: isSelected
              ? "3px solid #fff"
              : file.isEntryPoint
                ? "2px solid #52c41a"
                : "1px solid #fff",
            borderRadius: "8px",
            padding: "10px",
            fontSize: file.dependencyCount > 10 ? "14px" : "12px",
            fontWeight: file.dependencyCount > 10 ? "bold" : "normal",
            boxShadow: isSelected
              ? "0 0 10px rgba(255, 255, 255, 0.5)"
              : file.isEntryPoint
                ? "0 0 8px rgba(82, 196, 26, 0.5)"
                : "none",
            filter: isSelected ? "brightness(1.1)" : "brightness(1)",
            transition: "all 0.2s ease",
          },
        };
      });

      // Deduplicate edges and detect bidirectional connections
      const edgesMap = new Map<string, Edge>();
      const edgePairs = new Map<string, number>(); // Track bidirectional edges

      filteredData.forEach((file) => {
        file.directDependencies?.forEach((dep) => {
          const edgeId = `${file._id}-${dep._id}`;

          // Check if reverse edge exists to detect bidirectional
          const pairKey = [file._id, dep._id].sort().join("-");
          const pairCount = edgePairs.get(pairKey) || 0;
          edgePairs.set(pairKey, pairCount + 1);

          if (!edgesMap.has(edgeId)) {
            // Check if dependency is external (cross-directory)
            const sourceDir =
              file.path.split("/").slice(0, -1).join("/") || "root";
            const targetFile = filteredData.find((f) => f._id === dep._id);
            const targetDir =
              targetFile?.path.split("/").slice(0, -1).join("/") || "root";
            const isCrossDependency = sourceDir !== targetDir;
            const isFromSelected = selectedNodeIds.has(file._id);

            // Add offset for bidirectional edges to prevent overlap
            const hasBidirectional = pairCount > 0;

            // Alternate connection points for parallel edges
            const offset = pairCount % 4;
            let sourceHandle = undefined;
            let targetHandle = undefined;

            if (hasBidirectional) {
              // Use different handles to create separation
              if (offset === 1) {
                sourceHandle = "bottom";
                targetHandle = "top";
              } else if (offset === 2) {
                sourceHandle = "right";
                targetHandle = "left";
              } else if (offset === 3) {
                sourceHandle = "left";
                targetHandle = "right";
              }
            }

            edgesMap.set(edgeId, {
              id: edgeId,
              source: file._id,
              target: dep._id,
              type: "step", // Changed from smoothstep to step for more vertical/horizontal routing
              sourceHandle: sourceHandle,
              targetHandle: targetHandle,
              markerEnd: {
                type: "arrowclosed",
                width: 20,
                height: 20,
              },
              animated: isCrossDependency || isFromSelected,
              style: {
                stroke: isFromSelected
                  ? "#1890ff"
                  : isCrossDependency
                    ? "#ff7a45"
                    : "#999",
                strokeWidth: isFromSelected ? 2.5 : isCrossDependency ? 2 : 1,
              },
            });
          }
        });
      });

      const allEdgesArray = Array.from(edgesMap.values());
      setAllEdges(allEdgesArray);

      let layoutedNodes: Node[];
      let currentFolderEdges: Edge[] = []; // Store folder edges for this render

      if (layoutMode === "hierarchical") {
        // Use ALL files in hierarchical mode - position by folder structure using pre-computed keys
        const allFiles = fileNodes;

        // Group ALL files by folKey - use pre-computed hierarchical keys
        const hierarchicalFolKeyGroups = new Map<string, Node[]>();
        allFiles.forEach((node) => {
          const file = (node.data as any)?.file;
          if (file && file.folKey) {
            if (!hierarchicalFolKeyGroups.has(file.folKey)) {
              hierarchicalFolKeyGroups.set(file.folKey, []);
            }
            hierarchicalFolKeyGroups.get(file.folKey)!.push(node);
          }
        });

        // Create group nodes for folders with 2+ files
        const hierarchicalGroupNodes: Node[] = [];
        const groupedFiles: Node[] = [];
        const ungroupedFiles: Node[] = [];
        const folKeyToGroupId = new Map<string, string>(); // Map folKey to group ID

        // Create root node (ID "0") to contain all top-level folders
        const rootGroupId = "group-root-0";
        hierarchicalGroupNodes.push({
          id: rootGroupId,
          type: "group",
          data: {
            label: "Root",
            fullPath: "root",
            folKey: "0",
            fileCount: 0, // Will be calculated
            isOrphanedGroup: false,
            file: { dependencyDepth: 0 },
          },
          position: { x: 0, y: 0 },
          width: 400,
          height: 200,
          style: {
            width: 400,
            height: 200,
            backgroundColor: "rgba(82, 196, 26, 0.08)",
            border: "3px solid #52c41a",
            borderRadius: "12px",
            padding: "30px",
          },
        });

        // Get first file's path for each folKey to determine folder name
        const folKeyToPaths = new Map<string, string>();
        allFiles.forEach((node) => {
          const file = (node.data as any)?.file;
          if (file && file.folKey && !folKeyToPaths.has(file.folKey)) {
            const dirPath =
              file.path.split("/").slice(0, -1).join("/") || "root";
            folKeyToPaths.set(file.folKey, dirPath);
          }
        });

        hierarchicalFolKeyGroups.forEach((filesInFolder, folKey) => {
          if (filesInFolder.length >= 2) {
            // Create a group for this folder
            const groupId = `group-folkey-${folKey}`;
            folKeyToGroupId.set(folKey, groupId);

            const maxNodeWidth = 270;
            const maxNodeHeight = 104;
            const spacing = 20;
            const padding = 60;

            const cols = Math.ceil(Math.sqrt(filesInFolder.length));
            const rows = Math.ceil(filesInFolder.length / cols);
            const groupWidth = padding + cols * (maxNodeWidth + spacing);
            const groupHeight = padding + rows * (maxNodeHeight + spacing);

            // Use pre-computed folDepth directly
            const file = (filesInFolder[0].data as any)?.file;
            const folderDepth = file?.folDepth || 0;
            const dirPath = folKeyToPaths.get(folKey) || "unknown";

            hierarchicalGroupNodes.push({
              id: groupId,
              type: "group",
              data: {
                label: dirPath === "root" ? "Root" : dirPath,
                fullPath: dirPath,
                folKey: folKey,
                fileCount: filesInFolder.length,
                isOrphanedGroup: false,
                file: { dependencyDepth: folderDepth }, // Use folDepth for layout
              },
              position: { x: 0, y: 0 },
              width: groupWidth,
              height: groupHeight,
              style: {
                width: groupWidth,
                height: groupHeight,
                backgroundColor: "rgba(24, 144, 255, 0.08)",
                border: "2px solid #1890ff",
                borderRadius: "8px",
                padding: "20px",
              },
            });

            // Add files with parentId set
            filesInFolder.forEach((fileNode, index) => {
              const col = index % cols;
              const row = Math.floor(index / cols);
              groupedFiles.push({
                ...fileNode,
                parentId: groupId,
                position: {
                  x: col * (maxNodeWidth + spacing),
                  y: row * (maxNodeHeight + spacing),
                },
              });
            });
          } else {
            // Single file in folder - don't group
            ungroupedFiles.push(...filesInFolder);
          }
        });

        // Create folder structure edges using pre-computed folParent keys
        const folderEdges: Edge[] = [];

        // Create parent-child edges between folder groups using folKey hierarchy
        hierarchicalFolKeyGroups.forEach((filesInFolder, folKey) => {
          if (filesInFolder.length >= 2) {
            const groupId = folKeyToGroupId.get(folKey);
            if (!groupId) return;

            // Get folParent from the first file in this folder
            const file = (filesInFolder[0].data as any)?.file;
            const folParent = file?.folParent;

            if (folParent === "0") {
              // Top-level folder - connect to root
              folderEdges.push({
                id: `folder-edge-root-${folKey}`,
                source: rootGroupId,
                target: groupId,
                type: "smoothstep",
                label: "contains",
                style: {
                  stroke: "#52c41a",
                  strokeWidth: 3,
                  strokeDasharray: "8,4",
                },
                animated: false,
                selectable: false,
                data: { isFolderEdge: true },
              });
            } else if (folParent) {
              // Parent is another folder - find its group ID
              const parentGroupId = folKeyToGroupId.get(folParent);
              if (parentGroupId) {
                folderEdges.push({
                  id: `folder-edge-${folParent}-${folKey}`,
                  source: parentGroupId,
                  target: groupId,
                  type: "smoothstep",
                  label: "contains",
                  style: {
                    stroke: "#1890ff",
                    strokeWidth: 3,
                    strokeDasharray: "8,4",
                  },
                  animated: false,
                  selectable: false,
                  data: { isFolderEdge: true },
                });
              }
            }
          }
        });

        // Store folder edges for immediate use in this render
        currentFolderEdges = folderEdges;

        // Layout groups and ungrouped files by folder structure
        // Create a hierarchical structure based on folder paths
        const layoutedFiles = getLayoutedElements(
          [...ungroupedFiles, ...hierarchicalGroupNodes],
          folderEdges,
          {
            direction: layoutDirection,
            ranksep: 300, // Large separation for clear hierarchy
            nodesep: 150, // Wide horizontal spacing
          },
        );

        layoutedNodes = [
          ...layoutedFiles.map((n) => ({
            ...n,
            parentId: n.type === "group" ? undefined : n.parentId,
          })),
          ...groupedFiles,
        ];
      } else {
        // Grid layout - position files within their groups
        const maxNodeWidth = 270;
        const maxNodeHeight = 104;
        const spacing = 20;

        // Group files by their parent group
        const filesByGroup = new Map<string, Node[]>();
        fileNodes.forEach((node) => {
          const parentId = node.parentId || "no-group";
          if (!filesByGroup.has(parentId)) {
            filesByGroup.set(parentId, []);
          }
          filesByGroup.get(parentId)!.push(node);
        });

        // Position each file within its group
        const positionedFiles: Node[] = [];
        filesByGroup.forEach((files) => {
          files.forEach((file, index) => {
            const cols = Math.ceil(Math.sqrt(files.length));
            const col = index % cols;
            const row = Math.floor(index / cols);

            positionedFiles.push({
              ...file,
              position: {
                x: col * (maxNodeWidth + spacing),
                y: row * (maxNodeHeight + spacing),
              },
            });
          });
        });

        layoutedNodes = [...groupNodes, ...positionedFiles];
      }

      // Filter nodes based on search query
      const filteredNodes = searchQuery
        ? layoutedNodes.filter((node) => {
            if (node.type === "group") {
              // Keep groups that have matching files
              const groupId = node.id;
              return layoutedNodes.some(
                (n) =>
                  n.parentId === groupId &&
                  (n.data as any)?.file?.filename
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()),
              );
            }
            // Filter file nodes by filename
            return (node.data as any)?.file?.filename
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase());
          })
        : layoutedNodes;

      // Remove empty groups (groups with no visible children)
      const visibleFileNodeIds = new Set(
        filteredNodes.filter((n) => n.type !== "group").map((n) => n.id),
      );
      const finalNodes = filteredNodes.filter((node) => {
        if (node.type === "group") {
          // Only keep group if it has at least one visible child
          return filteredNodes.some(
            (n) => n.parentId === node.id && visibleFileNodeIds.has(n.id),
          );
        }
        return true;
      });

      // Get IDs of groups that remain after filtering
      const remainingGroupIds = new Set(
        finalNodes.filter((n) => n.type === "group").map((n) => n.id),
      );

      // Clear parentId references for nodes whose parent groups were removed
      // and position them using a grid layout
      let orphanedNodeIndex = 0;
      const nodesWithValidParents = finalNodes.map((node) => {
        if (
          node.type !== "group" &&
          node.parentId &&
          !remainingGroupIds.has(node.parentId)
        ) {
          // Parent group was removed, clear the reference and position manually
          const gridPosition = {
            x: (orphanedNodeIndex % 5) * 220,
            y: Math.floor(orphanedNodeIndex / 5) * 120,
          };
          orphanedNodeIndex++;

          return {
            ...node,
            parentId: undefined,
            extent: undefined,
            position: gridPosition,
          };
        }
        return node;
      });

      // Nodes already have correct positions from getLayoutedElements
      // No need to recalculate - just add positionAbsolute
      const nodesWithAbsolutePositions = nodesWithValidParents.map((node) => ({
        ...node,
        positionAbsolute: node.position,
      }));

      setAllLayoutedNodes(layoutedNodes); // Store all nodes for reference

      setNodes(nodesWithAbsolutePositions);

      // Fit view to show all visible nodes - single call after React has rendered
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 150);

      // Filter edges based on layout mode and selection
      let edgesToDisplay: Edge[] = [];

      if (layoutMode === "hierarchical") {
        // In hierarchical mode:
        // 1. Always show folder hierarchy edges (gray, dashed) - these connect folder groups
        // 2. Include ALL dependency edges but make them invisible initially
        //    (they'll be shown/styled by onSelectionChange when nodes are selected)

        // Dependency edges (include all but make them nearly invisible initially)
        // The onSelectionChange handler will show/style them when nodes are selected
        const dependencyEdges = allEdgesArray.map((edge) => ({
          ...edge,
          style: {
            ...edge.style,
            stroke: "#f0f0f0", // Nearly invisible gray
            strokeWidth: 0.5,
          },
          animated: false,
          data: { ...edge.data, isDependencyEdge: true },
        }));

        // Combine folder hierarchy edges (always visible) with dependency edges (interactive)
        edgesToDisplay = [...currentFolderEdges, ...dependencyEdges];
      } else {
        // Grid mode: show all edges
        edgesToDisplay = allEdgesArray;
      }

      setEdges(edgesToDisplay);
    } catch (err) {
      console.error(
        "%c[FETCH ERROR] Error processing files:",
        "background: #ff0000; color: #ffffff; font-weight: bold",
        err,
      );
      console.error(
        "[FETCH ERROR] Error stack:",
        err instanceof Error ? err.stack : "No stack",
      );
      setError(err instanceof Error ? err.message : "Failed to process files");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProject,
    selectedCategory,
    layoutMode,
    layoutDirection,
    selectedNodeIds,
    searchQuery,
  ]);

  // Only fetch when category is selected or search is active
  useEffect(() => {
    if (selectedCategory.length > 0 || searchQuery) {
      fetchFiles();
    } else {
      // Clear the view when no category and no search
      setNodes([]);
      setEdges([]);
      setAllLayoutedNodes([]);
      setAllEdges([]);
      setFiles([]);
      setSelectedFile(null); // Clear selected file when view is cleared
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  // Fetch files on mount and when project changes to populate category counts
  useEffect(() => {
    const fetchForCategoryCounts = async () => {
      try {
        const data = await codebaseService.getFilesByProject(
          selectedProject,
          undefined,
        );
        setAllFilesForProject(data);
      } catch (err) {
        console.error("Error fetching files for category counts:", err);
      }
    };
    fetchForCategoryCounts();
  }, [selectedProject]);

  // Clear selectedFile when it's no longer in the filtered dataset
  useEffect(() => {
    if (selectedFile && !files.find((f) => f._id === selectedFile._id)) {
      setSelectedFile(null);
    }
  }, [files, selectedFile]);

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // Skip group nodes
      if (node.type === "group") {
        return;
      }

      const file = files.find((f) => f._id === node.id);
      if (file) {
        setSelectedFile(file);
        // Don't set selectedNodeIds here - let onSelectionChange handle it
      }
    },
    [files, setNodes, setEdges],
  );

  // Handle selection changes - update tracking for styling
  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      const selectedFileNodes = params.nodes.filter((n) => n.type !== "group");
      const selectedIds = new Set(selectedFileNodes.map((n) => n.id));

      // Update selected node tracking
      setSelectedNodeIds(selectedIds);

      // Update node styles based on selection
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === "group") return node;

          const isSelected = selectedIds.has(node.id);
          const file = (node.data as any)?.file;

          return {
            ...node,
            selected: isSelected,
            style: {
              ...node.style,
              border: isSelected
                ? "4px solid #0050b3" // Darker blue border for selected
                : file?.isEntryPoint
                  ? "2px solid #52c41a"
                  : "1px solid #fff",
              boxShadow: file?.isEntryPoint
                ? "0 0 8px rgba(82, 196, 26, 0.5)"
                : "none",
              filter: isSelected ? "brightness(1.2)" : "brightness(1)",
            },
          };
        }),
      );

      // Highlight edges connected to selected nodes
      if (selectedIds.size > 0) {
        setEdges((eds) =>
          eds.map((edge) => {
            // Don't modify folder hierarchy edges (they stay gray/dashed)
            if ((edge.data as any)?.isFolderEdge) {
              return edge;
            }

            const isFromSelected = selectedIds.has(edge.source);
            const isToSelected = selectedIds.has(edge.target);
            const isConnected = isFromSelected || isToSelected;

            // Only modify dependency edges
            if (!(edge.data as any)?.isDependencyEdge) {
              return edge;
            }

            // Differentiate edge types:
            // - Solid blue line for children (FROM selected = internal dependencies)
            // - Dashed orange line for parents (TO selected = reverse dependencies)
            let strokeDasharray = undefined;
            let stroke = "#f0f0f0"; // Nearly invisible when not connected
            let strokeWidth = 0.5;
            let zIndex = 0;
            let markerEnd = edge.markerEnd;

            if (isFromSelected && !isToSelected) {
              // Edge FROM selected node (children/imports)
              stroke = "#1890ff"; // Light blue
              strokeDasharray = undefined;
              strokeWidth = 4;
              zIndex = 1000;
              markerEnd = {
                type: "arrowclosed",
                width: 12,
                height: 12,
                color: "#1890ff",
              };
            } else if (isToSelected && !isFromSelected) {
              // Edge TO selected node (parents/imported by)
              stroke = "#ff7a45"; // Light orange
              strokeDasharray = "15 10"; // More obvious dashed pattern
              strokeWidth = 4;
              zIndex = 1000;
              markerEnd = {
                type: "arrowclosed",
                width: 12,
                height: 12,
                color: "#ff7a45",
              };
            }

            return {
              ...edge,
              animated: isConnected,
              className: isConnected ? "selected" : "",
              zIndex: zIndex,
              markerEnd: markerEnd,
              style: {
                ...edge.style,
                stroke: stroke,
                strokeWidth: strokeWidth,
                strokeDasharray: strokeDasharray,
              },
            };
          }),
        );
      } else {
        // Reset all edges when nothing selected
        setEdges((eds) =>
          eds.map((edge) => {
            // Don't modify folder hierarchy edges
            if ((edge.data as any)?.isFolderEdge) {
              return edge;
            }

            // Only reset dependency edges to nearly invisible
            if ((edge.data as any)?.isDependencyEdge) {
              return {
                ...edge,
                animated: false,
                className: "",
                markerEnd: {
                  type: "arrowclosed" as const,
                  width: 12,
                  height: 12,
                  color: "#f0f0f0",
                },
                style: {
                  ...edge.style,
                  stroke: "#f0f0f0",
                  strokeWidth: 0.5,
                },
              };
            }

            return edge; // Return other edges unchanged
          }),
        );
      }

      // Update selectedFile if a single node is selected
      if (selectedFileNodes.length === 1) {
        const file = files.find((f) => f._id === selectedFileNodes[0].id);
        if (file) {
          setSelectedFile(file);
        }
      }
    },
    [files, setNodes, setEdges],
  );

  // Focus on specific node - generate mindmap starting from this node
  const handleFocusNode = useCallback(
    (nodeId: string) => {
      setFocusedNodeId(nodeId);

      // Get the focused node and its dependencies recursively
      const getNodeWithDependencies = (
        id: string,
        visited = new Set<string>(),
      ): Set<string> => {
        if (visited.has(id)) return visited;
        visited.add(id);

        const deps = allEdges
          .filter((edge) => edge.source === id)
          .map((edge) => edge.target);

        deps.forEach((depId) => getNodeWithDependencies(depId, visited));
        return visited;
      };

      const focusedNodeIds = getNodeWithDependencies(nodeId);

      // Get parent group IDs
      const focusedNodes = allLayoutedNodes.filter((n) =>
        focusedNodeIds.has(n.id),
      );
      const parentGroupIds = new Set(
        focusedNodes
          .map((n) => n.parentId)
          .filter((id): id is string => id !== undefined && id !== null),
      );

      // Filter to show only focused node, its dependencies, and their groups
      const filteredNodes = allLayoutedNodes.filter(
        (n) => focusedNodeIds.has(n.id) || parentGroupIds.has(n.id),
      );

      setNodes(filteredNodes);

      // Show all edges between focused nodes
      const focusedEdges = allEdges.filter(
        (edge) =>
          focusedNodeIds.has(edge.source) && focusedNodeIds.has(edge.target),
      );
      setEdges(focusedEdges);

      // Auto-expand the focused node with selection
      setSelectedNodeIds(new Set([nodeId]));

      // Fit view to focused subgraph with animation
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    },
    [allLayoutedNodes, allEdges, setNodes, setEdges, fitView],
  );

  // Clear focus and return to normal view
  const handleClearFocus = useCallback(() => {
    setFocusedNodeId(null);
    fetchFiles();
  }, [fetchFiles]);

  // Use predefined categories instead of deriving from files (which is empty initially)
  const categories = Object.keys(CATEGORY_COLORS);

  // Handle layout mode change
  const handleLayoutModeChange = useCallback(
    (mode: "hierarchical" | "grid") => {
      setLayoutMode(mode);
    },
    [],
  );

  // Handle layout direction change
  const handleLayoutDirectionChange = useCallback(
    (direction: LayoutDirection) => {
      setLayoutDirection(direction);
    },
    [],
  );

  // Re-apply layout when mode, direction, or search changes
  useEffect(() => {
    if (files.length > 0) {
      fetchFiles();
    }
  }, [layoutMode, layoutDirection, searchQuery]);

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "100%",
        height: "calc(100vh - 64px)",
      }}
    >
      <Row gutter={[16, 16]} style={{ height: "100%" }}>
        <Col span={24}>
          <Title level={2}>Codebase Mind Map</Title>
          <Paragraph>
            Explore the codebase structure and file dependencies across all
            projects.
          </Paragraph>

          {files.length > 0 && (
            <Card size="small" style={{ marginTop: 16 }}>
              <Space size="large" wrap>
                <div>
                  <Text strong>Total Files: </Text>
                  <Text>{files.length}</Text>
                </div>
                {files.filter((f) => f.isEntryPoint).length > 0 && (
                  <div>
                    <Text strong>Entry Points: </Text>
                    <Tag color="green">
                      {files.filter((f) => f.isEntryPoint).length}
                    </Tag>
                  </div>
                )}
                {files.filter((f) => f.isInCircularDependency).length > 0 && (
                  <div>
                    <Text strong>Circular Dependencies: </Text>
                    <Tag color="red">
                      {files.filter((f) => f.isInCircularDependency).length}
                    </Tag>
                  </div>
                )}
                {files.filter((f) => f.dependencyDepth === -1).length > 0 && (
                  <div>
                    <Text strong>Orphaned Files: </Text>
                    <Tag color="orange">
                      {files.filter((f) => f.dependencyDepth === -1).length}
                    </Tag>
                  </div>
                )}
                {files.filter(
                  (f) =>
                    f.dependencyDepth !== undefined && f.dependencyDepth >= 0,
                ).length > 0 && (
                  <div>
                    <Text strong>Max Depth: </Text>
                    <Tag color="blue">
                      {Math.max(
                        ...files
                          .filter(
                            (f) =>
                              f.dependencyDepth !== undefined &&
                              f.dependencyDepth >= 0,
                          )
                          .map((f) => f.dependencyDepth || 0),
                      )}
                    </Tag>
                  </div>
                )}
              </Space>
            </Card>
          )}
        </Col>

        <Col span={24}>
          <Space size="middle" wrap>
            <Select
              value={selectedProject}
              onChange={(value) => {
                setSelectedProject(value);
                setSelectedFile(null); // Clear selected file when project changes
              }}
              style={{ width: 150 }}
            >
              <Option value="builder">Builder</Option>
              <Option value="echo">Echo</Option>
              <Option value="render">Render</Option>
              <Option value="source">Source</Option>
            </Select>

            <Select
              mode="multiple"
              value={selectedCategory}
              onChange={(value) => {
                // Handle "all" selection to toggle between select all and select none
                if (value.includes("all")) {
                  // Check if all categories are currently selected
                  const allSelected = categories.every((cat) =>
                    selectedCategory.includes(cat),
                  );
                  if (allSelected) {
                    // If all are selected, clear all
                    setSelectedCategory([]);
                  } else {
                    // If not all are selected, select all categories
                    setSelectedCategory(
                      categories.filter((cat) => cat !== "all"),
                    );
                  }
                } else {
                  setSelectedCategory(value);
                }
              }}
              placeholder="Select Categories"
              allowClear
              style={{ width: 250 }}
              maxTagCount="responsive"
            >
              <Option
                key="all"
                value="all"
                style={{
                  fontWeight: "bold",
                  borderBottom: "1px solid #d9d9d9",
                }}
              >
                {selectedCategory.length === categories.length
                  ? "✖ Select None"
                  : "📋 Select All"}
              </Option>
              {categories.map((cat) => {
                const count = allFilesForProject.filter(
                  (f) => f.category === cat,
                ).length;
                return (
                  <Option
                    key={cat}
                    value={cat}
                    disabled={count === 0}
                    style={{
                      color: count === 0 ? "#bfbfbf" : undefined,
                    }}
                  >
                    {cat} {count > 0 ? `(${count})` : "(0)"}
                  </Option>
                );
              })}
            </Select>

            <Select
              value={layoutMode}
              onChange={handleLayoutModeChange}
              style={{ width: 150 }}
            >
              <Option value="hierarchical">Hierarchical</Option>
              <Option value="grid">Grid</Option>
            </Select>

            {layoutMode === "hierarchical" && (
              <Radio.Group
                value={layoutDirection}
                onChange={(e) => handleLayoutDirectionChange(e.target.value)}
                buttonStyle="solid"
              >
                <Radio.Button value="TB">Top ↓ Bottom</Radio.Button>
                <Radio.Button value="LR">Left → Right</Radio.Button>
              </Radio.Group>
            )}

            <Input.Search
              placeholder="Search files by name..."
              allowClear
              style={{ width: 250 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Text type="secondary">
              {searchQuery
                ? `${nodes.filter((n) => n.type !== "group").length} / ${files.length} files`
                : `${files.length} files`}
            </Text>
          </Space>
        </Col>

        {error && (
          <Col span={24}>
            <Alert message="Error" description={error} type="error" showIcon />
          </Col>
        )}

        {loading ? (
          <Col span={24} style={{ textAlign: "center", paddingTop: "100px" }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Loading codebase...</div>
          </Col>
        ) : (
          <>
            <Col
              span={selectedFile ? 16 : 24}
              style={{ height: "calc(100% - 200px)" }}
            >
              <Card
                style={{ height: "100%", padding: 0 }}
                styles={{ body: { height: "100%", padding: 0 } }}
              >
                {nodes.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      color: "#999",
                    }}
                  >
                    Select a category or search to visualize the codebase
                  </div>
                ) : (
                  <div style={{ width: "100%", height: "100%" }}>
                    <ReactFlow
                      nodes={nodes}
                      edges={edges}
                      nodeTypes={{ group: GroupNode, file: FileNode }}
                      onNodeClick={onNodeClick}
                      onSelectionChange={onSelectionChange}
                      onEdgeMouseEnter={(_event, edge) => {
                        // On hover, change edge color to darker tone if edge is connected to selected node
                        const isConnected =
                          selectedNodeIds.has(edge.source) ||
                          selectedNodeIds.has(edge.target);
                        if (isConnected) {
                          setEdges((eds) =>
                            eds.map((e) => {
                              if (e.id === edge.id) {
                                const isDashed = e.style?.strokeDasharray;
                                const darkerColor = isDashed
                                  ? "#d4380d"
                                  : "#0050b3";
                                const markerEnd =
                                  e.markerEnd && typeof e.markerEnd === "object"
                                    ? e.markerEnd
                                    : {
                                        type: "arrowclosed" as const,
                                        width: 12,
                                        height: 12,
                                        color: "#1890ff",
                                      };
                                return {
                                  ...e,
                                  style: {
                                    ...e.style,
                                    stroke: darkerColor,
                                  },
                                  markerEnd: {
                                    ...markerEnd,
                                    color: darkerColor,
                                  },
                                };
                              }
                              return e;
                            }),
                          );
                        }
                      }}
                      onEdgeMouseLeave={(_event, edge) => {
                        // On mouse leave, revert to original light colors
                        const isConnected =
                          selectedNodeIds.has(edge.source) ||
                          selectedNodeIds.has(edge.target);
                        if (isConnected) {
                          setEdges((eds) =>
                            eds.map((e) => {
                              if (e.id === edge.id) {
                                const isDashed = e.style?.strokeDasharray;
                                const originalColor = isDashed
                                  ? "#ff7a45"
                                  : "#1890ff";
                                const markerEnd =
                                  e.markerEnd && typeof e.markerEnd === "object"
                                    ? e.markerEnd
                                    : {
                                        type: "arrowclosed" as const,
                                        width: 12,
                                        height: 12,
                                        color: "#1890ff",
                                      };
                                return {
                                  ...e,
                                  style: {
                                    ...e.style,
                                    stroke: originalColor,
                                  },
                                  markerEnd: {
                                    ...markerEnd,
                                    color: originalColor,
                                  },
                                };
                              }
                              return e;
                            }),
                          );
                        }
                      }}
                      nodesDraggable={false}
                      nodesConnectable={false}
                      elementsSelectable={true}
                      selectNodesOnDrag={false}
                      panOnScroll={true}
                      panOnDrag={true}
                      proOptions={{ hideAttribution: true }}
                      fitViewOptions={{
                        padding: 0.2,
                        includeHiddenNodes: false,
                      }}
                      minZoom={0.1}
                      maxZoom={2}
                    >
                      <Background />
                      <Controls />
                      <MiniMap
                        nodeColor={(node) => {
                          const file = node.data.file as CodebaseFile;
                          return (
                            CATEGORY_COLORS[file?.category] ||
                            CATEGORY_COLORS.other
                          );
                        }}
                      />
                    </ReactFlow>
                  </div>
                )}
              </Card>
            </Col>

            {selectedFile && (
              <Col
                span={8}
                style={{ height: "calc(100% - 200px)", overflowY: "auto" }}
              >
                <Card
                  title={selectedFile.filename}
                  extra={
                    <Space>
                      {focusedNodeId === selectedFile._id ? (
                        <Button size="small" onClick={handleClearFocus}>
                          Clear Focus
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => handleFocusNode(selectedFile._id)}
                        >
                          Focus on This
                        </Button>
                      )}
                      <Tag color={CATEGORY_COLORS[selectedFile.category]}>
                        {selectedFile.category}
                      </Tag>
                    </Space>
                  }
                >
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text strong>Path:</Text>
                      <br />
                      <Text code>{selectedFile.path}</Text>
                    </div>

                    <div>
                      <Text strong>Description:</Text>
                      <Paragraph>{selectedFile.description}</Paragraph>
                    </div>

                    <div>
                      <Text strong>Size:</Text>{" "}
                      {selectedFile.size !== undefined &&
                      selectedFile.size !== null
                        ? (Number(selectedFile.size) / 1024).toFixed(2) + " KB"
                        : "Unknown"}
                    </div>

                    <div>
                      <Text strong>Dependencies:</Text>{" "}
                      {selectedFile.dependencyCount || 0}
                    </div>

                    {selectedFile.dependencyDepth !== undefined && (
                      <div>
                        <Text strong>Dependency Depth:</Text>{" "}
                        {selectedFile.dependencyDepth === -1 ? (
                          <Tag color="orange">Orphaned (Unreachable)</Tag>
                        ) : (
                          <Tag color="blue">
                            Level {selectedFile.dependencyDepth}
                          </Tag>
                        )}
                      </div>
                    )}

                    {selectedFile.isEntryPoint && (
                      <div>
                        <Tag color="green">🚀 Entry Point</Tag>
                      </div>
                    )}

                    {selectedFile.isInCircularDependency && (
                      <div>
                        <Tag color="red">⚠️ Circular Dependency</Tag>
                      </div>
                    )}

                    {selectedFile.reverseDependencies &&
                      selectedFile.reverseDependencies.length > 0 && (
                        <div>
                          <Text strong>Imported By:</Text>{" "}
                          {selectedFile.reverseDependencies.length} file(s)
                        </div>
                      )}

                    {selectedFile.directDependencies &&
                      selectedFile.directDependencies.length > 0 && (
                        <Collapse
                          items={[
                            {
                              key: "deps",
                              label: `Internal Dependencies (${selectedFile.directDependencies.length})`,
                              children: (
                                <Space
                                  direction="vertical"
                                  size="small"
                                  style={{ width: "100%" }}
                                >
                                  {selectedFile.directDependencies.map(
                                    (dep, index) => (
                                      <Card
                                        key={`dep-${dep._id}-${index}`}
                                        size="small"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          const file = files.find(
                                            (f) => f._id === dep._id,
                                          );
                                          if (file) {
                                            setSelectedFile(file);
                                            // Use ReactFlow's built-in selection
                                            setNodes((nds) =>
                                              nds.map((node) => ({
                                                ...node,
                                                selected: node.id === dep._id,
                                              })),
                                            );
                                          }
                                        }}
                                      >
                                        <Text strong>{dep.filename}</Text>
                                        <br />
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: "12px" }}
                                        >
                                          {dep.path}
                                        </Text>
                                      </Card>
                                    ),
                                  )}
                                </Space>
                              ),
                            },
                          ]}
                        />
                      )}

                    {selectedFile.reverseDependencies &&
                      selectedFile.reverseDependencies.length > 0 && (
                        <Collapse
                          items={[
                            {
                              key: "reverse-deps",
                              label: `Reverse Dependencies (${selectedFile.reverseDependencies.length})`,
                              children: (
                                <Space
                                  direction="vertical"
                                  size="small"
                                  style={{ width: "100%" }}
                                >
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
                                    Files that import this file:
                                  </Text>
                                  {selectedFile.reverseDependencies.map(
                                    (dep, index) => (
                                      <Card
                                        key={`rev-dep-${dep._id}-${index}`}
                                        size="small"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          const file = files.find(
                                            (f) => f._id === dep._id,
                                          );
                                          if (file) {
                                            setSelectedFile(file);
                                            // Use ReactFlow's built-in selection
                                            setNodes((nds) =>
                                              nds.map((node) => ({
                                                ...node,
                                                selected: node.id === dep._id,
                                              })),
                                            );
                                          }
                                        }}
                                      >
                                        <Text strong>{dep.filename}</Text>
                                        <br />
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: "12px" }}
                                        >
                                          {dep.path}
                                        </Text>
                                      </Card>
                                    ),
                                  )}
                                </Space>
                              ),
                            },
                          ]}
                        />
                      )}

                    {selectedFile.externalDependencies &&
                      selectedFile.externalDependencies.length > 0 && (
                        <Collapse
                          items={[
                            {
                              key: "external",
                              label: `External Dependencies (${selectedFile.externalDependencies.length})`,
                              children: (
                                <Space direction="vertical" size="small">
                                  {selectedFile.externalDependencies.map(
                                    (dep, idx) => (
                                      <Tag key={idx}>{dep}</Tag>
                                    ),
                                  )}
                                </Space>
                              ),
                            },
                          ]}
                        />
                      )}

                    {selectedFile.history &&
                      selectedFile.history.length > 0 && (
                        <Collapse
                          items={[
                            {
                              key: "history",
                              label: `Git History (${selectedFile.history.length} commits)`,
                              children: (
                                <Space
                                  direction="vertical"
                                  size="small"
                                  style={{ width: "100%" }}
                                >
                                  {selectedFile.history
                                    .slice(0, 5)
                                    .map((entry, idx) => (
                                      <Card key={idx} size="small">
                                        <Text strong>{entry.message}</Text>
                                        <br />
                                        <Text
                                          type="secondary"
                                          style={{ fontSize: "12px" }}
                                        >
                                          {entry.author} •{" "}
                                          {new Date(
                                            entry.date,
                                          ).toLocaleDateString()}
                                        </Text>
                                      </Card>
                                    ))}
                                </Space>
                              ),
                            },
                          ]}
                        />
                      )}
                  </Space>
                </Card>
              </Col>
            )}
          </>
        )}
      </Row>
    </div>
  );
};

const CodebasePage: React.FC = () => {
  return (
    <ReactFlowProvider>
      <CodebasePageContent />
    </ReactFlowProvider>
  );
};

export default CodebasePage;
