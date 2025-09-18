// MongoDB ObjectId type
export interface ObjectId {
  $oid: string;
}

// MongoDB Date type
export interface MongoDate {
  $date: string;
}

// CSS styles type - allowing any CSS property
export interface LayoutStyles {
  [key: string]: string;
}

// Change tracking
export interface LayoutChange {
  timestamp: MongoDate;
  user: ObjectId;
}

// Visibility behavior rules
export interface VisibilityRule {
  comparison_type: "lte" | "gte" | "eq" | "ne" | "lt" | "gt";
  value_type: "dateTime" | "string" | "number" | "boolean";
  values: string[];
}

export interface VisibilityBehaviour {
  rules: VisibilityRule[];
}

export interface LayoutBehaviours {
  visibility?: VisibilityBehaviour;
  [key: string]: any; // Allow for additional behaviors
}

// Base layout interface
export interface BaseLayout {
  _id: ObjectId;
  identifier: string;
  type: string;
  order: number;
  parent: ObjectId[];
  attributes: any[]; // Could be more specific based on your needs
  styles: LayoutStyles;
  status: string;
  created: MongoDate;
  updated: MongoDate;
  changes: LayoutChange[];
}

// SlideLayout specific interface
export interface SlideLayout extends BaseLayout {
  type: "SlideLayout";
  classes: string;
  behaviours: LayoutBehaviours;
}

// BoxLayout specific interface
export interface BoxLayout extends BaseLayout {
  type: "BoxLayout";
  classes?: string; // Optional since not present in your BoxLayout example
  behaviours?: LayoutBehaviours; // Optional since not present in your BoxLayout example
}

// GridLayout specific interface
export interface GridLayout extends BaseLayout {
  type: "GridLayout";
  columns: number | string; // Number of columns or grid-template-columns value
  rows: number | string; // Number of rows or grid-template-rows value
  gap?: string; // Optional grid gap
  classes?: string; // Optional CSS classes
  behaviours?: LayoutBehaviours; // Optional behaviors
}

// Union type for all layout types
export type Layout = SlideLayout | BoxLayout | GridLayout;

// Type guard functions
export function isSlideLayout(layout: Layout): layout is SlideLayout {
  return layout.type === "SlideLayout";
}

export function isBoxLayout(layout: Layout): layout is BoxLayout {
  return layout.type === "BoxLayout";
}

export function isGridLayout(layout: Layout): layout is GridLayout {
  return layout.type === "GridLayout";
}

// Layout type enumeration
export const LayoutType = {
  SLIDE: "SlideLayout",
  BOX: "BoxLayout",
  GRID: "GridLayout",
} as const;

export type LayoutType = (typeof LayoutType)[keyof typeof LayoutType];
