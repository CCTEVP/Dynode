import dagre from "dagre";
import type { Node, Edge } from "@xyflow/react";

export type LayoutDirection = "TB" | "LR" | "BT" | "RL";

export interface LayoutOptions {
  direction: LayoutDirection;
  ranksep: number;
  nodesep: number;
  edgesep: number;
}

const defaultLayoutOptions: LayoutOptions = {
  direction: "TB",
  ranksep: 100,
  nodesep: 120, // Increased for much better parallel edge separation
  edgesep: 80, // Increased for much better parallel edge separation
};

/**
 * Calculate hierarchical layout positions using dagre
 */
export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: Partial<LayoutOptions> = {},
): Node[] => {
  const opts = { ...defaultLayoutOptions, ...options };

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Configure layout algorithm
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.ranksep,
    nodesep: opts.nodesep,
    edgesep: opts.edgesep,
    ranker: "longest-path", // Better for hierarchical depth-based layouts
    align: undefined,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to dagre graph with rank constraint if dependencyDepth is available
  nodes.forEach((node) => {
    // Use node dimensions - check both top-level and style properties
    const width = node.width || (node.style?.width as number) || 150;
    const height = node.height || (node.style?.height as number) || 80;

    // Use dependencyDepth for hierarchical rank if available
    const file = (node.data as any)?.file;
    const nodeConfig: any = { width, height };

    if (file?.dependencyDepth !== undefined && file.dependencyDepth >= 0) {
      // Set rank constraint to enforce hierarchical layout
      nodeConfig.rank = file.dependencyDepth;
    }

    dagreGraph.setNode(node.id, nodeConfig);
  });

  // Add edges to dagre graph
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  dagre.layout(dagreGraph);

  // Separate nodes into groups and children
  const groupNodes = nodes.filter((n) => n.type === "group");
  const childNodes = nodes.filter((n) => n.type !== "group" && n.parentId);
  const standaloneNodes = nodes.filter(
    (n) => n.type !== "group" && !n.parentId,
  );

  // Apply calculated positions to standalone nodes and groups
  const layoutedStandaloneAndGroups = [...standaloneNodes, ...groupNodes].map(
    (node) => {
      const nodeWithPosition = dagreGraph.node(node.id);

      // dagre returns center positions, adjust to top-left for React Flow
      const width = node.width || (node.style?.width as number) || 150;
      const height = node.height || (node.style?.height as number) || 80;

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2,
        },
      };
    },
  );

  // For child nodes, position them in a grid inside their parent
  const childNodesByParent = new Map<string, Node[]>();
  childNodes.forEach((node) => {
    const parentId = node.parentId!;
    if (!childNodesByParent.has(parentId)) {
      childNodesByParent.set(parentId, []);
    }
    childNodesByParent.get(parentId)!.push(node);
  });

  const layoutedChildren: Node[] = [];
  childNodesByParent.forEach((children, parentId) => {
    const cols = Math.ceil(Math.sqrt(children.length));
    console.log(
      `Laying out ${children.length} children for parent ${parentId} in ${cols} columns`,
    );

    children.forEach((node, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const nodeWidth = node.width || (node.style?.width as number) || 120;
      const nodeHeight = node.height || (node.style?.height as number) || 80;

      // Position RELATIVE to parent - ReactFlow handles this automatically
      // Add offset to account for parent padding and create proper margins
      const leftPadding = 30; // Match parent's left padding
      const topPadding = 40; // Match parent's top padding
      const nodeSpacing = 20; // Spacing between nodes

      const position = {
        x: leftPadding + col * (nodeWidth + nodeSpacing),
        y: topPadding + row * (nodeHeight + nodeSpacing),
      };

      console.log(
        `Child ${index} (${node.id}): ${nodeWidth}x${nodeHeight} at relative (${position.x}, ${position.y}) within parent ${parentId}`,
      );

      layoutedChildren.push({
        ...node,
        position,
        parentId, // Keep parent reference for ReactFlow's automatic relative positioning
        extent: "parent", // Constrain node movement to parent bounds
        draggable: false, // Allow dragging
        selectable: true, // Allow selection
      });
    });
  });

  console.log(
    "Total nodes returned:",
    layoutedStandaloneAndGroups.length + layoutedChildren.length,
  );
  return [...layoutedStandaloneAndGroups, ...layoutedChildren];
};

/**
 * Group files by directory path
 */
export const groupByDirectory = (
  files: Array<{ _id: string; path: string; [key: string]: any }>,
): Map<string, Array<{ _id: string; path: string; [key: string]: any }>> => {
  const groups = new Map<
    string,
    Array<{ _id: string; path: string; [key: string]: any }>
  >();

  files.forEach((file) => {
    const pathParts = file.path.split("/");

    // Get directory path (everything except filename)
    const dir = pathParts.slice(0, -1).join("/") || "root";

    if (!groups.has(dir)) {
      groups.set(dir, []);
    }
    groups.get(dir)!.push(file);
  });

  return groups;
};

/**
 * Calculate node size based on dependency count (for hub detection)
 */
export const getNodeSize = (
  dependencyCount: number = 0,
): { width: number; height: number } => {
  const baseWidth = 180;
  const baseHeight = 80;

  // Scale up for hub nodes (files with many dependencies)
  if (dependencyCount > 10) {
    return { width: baseWidth * 1.5, height: baseHeight * 1.3 };
  } else if (dependencyCount > 5) {
    return { width: baseWidth * 1.2, height: baseHeight * 1.15 };
  }

  return { width: baseWidth, height: baseHeight };
};
