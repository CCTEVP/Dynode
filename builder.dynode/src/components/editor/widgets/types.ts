// Re-export common types from layouts (if they're in a separate file, we might need to import them)
export interface ObjectId {
  $oid: string;
}

export interface MongoDate {
  $date: string;
}

export interface WidgetStyles {
  [key: string]: string;
}

export interface WidgetChange {
  timestamp: MongoDate;
  user: ObjectId;
}

// Visibility behavior rules (same as layouts)
export interface VisibilityRule {
  comparison_type: "lte" | "gte" | "eq" | "ne" | "lt" | "gt";
  value_type: "dateTime" | "string" | "number" | "boolean";
  values: string[];
}

export interface VisibilityBehaviour {
  rules: VisibilityRule[];
}

export interface WidgetBehaviours {
  visibility?: VisibilityBehaviour;
  [key: string]: any; // Allow for additional behaviors
}

// Target DateTime configuration
export interface TargetDateTime {
  default: string;
  source: string;
  name: string;
}

// Enhanced font reference
export interface FontReference {
  _id: ObjectId;
  kind: string;
  name: string;
  created: MongoDate;
  updated: MongoDate;
  status: string;
  changes: WidgetChange[];
  paths: FilePath[];
}

// File path information
export interface FilePath {
  mime: string;
  extension: string;
  filename: string;
}

// Enhanced source reference (for media widgets)
export interface SourceReference {
  _id: ObjectId;
  kind: string;
  name: string;
  created: MongoDate;
  updated: MongoDate;
  status: string;
  changes: WidgetChange[];
  paths: FilePath[];
}

// Base widget interface
export interface BaseWidget {
  _id: ObjectId;
  identifier: string;
  type: string;
  order: number;
  parent?: ObjectId[]; // Optional since not all widgets have parent
  attributes?: string[]; // Optional since not all widgets have attributes
  styles: WidgetStyles;
  status: string;
  created: MongoDate;
  updated: MongoDate;
  changes: WidgetChange[];
  classes?: string; // Optional since not all widgets have classes
  behaviours?: WidgetBehaviours; // Optional since not all widgets have behaviors
}

// CardWidget specific interface
export interface CardWidget extends BaseWidget {
  type: "CardWidget";
  animation: string;
  value: string;
  behaviours: WidgetBehaviours; // Required for CardWidget
  font: FontReference;
}

// TextWidget specific interface
export interface TextWidget extends BaseWidget {
  type: "TextWidget";
  value: string;
  font: FontReference;
}

// VideoWidget specific interface
export interface VideoWidget extends BaseWidget {
  type: "VideoWidget";
  source: SourceReference;
  attributes: string[]; // Required for VideoWidget (e.g., "fullscreen")
}

// ImageWidget specific interface
export interface ImageWidget extends BaseWidget {
  type: "ImageWidget";
  source: SourceReference;
  classes: string; // Required for ImageWidget
  attributes: string[]; // Required for ImageWidget (even if empty array)
}

// ClockWidget specific interface
export interface ClockWidget extends BaseWidget {
  type: "ClockWidget";
  timeZone: string;
  classes: string; // Required for ClockWidget
  attributes: string[]; // Required for ClockWidget (even if empty array)
}

// CountdownWidget specific interface
export interface CountdownWidget extends BaseWidget {
  type: "CountdownWidget";
  targetDateTime: TargetDateTime;
  classes: string; // Required for CountdownWidget
  attributes: string[]; // Required for CountdownWidget (even if empty array)
}

// Union type for all widget types
export type Widget =
  | CardWidget
  | TextWidget
  | VideoWidget
  | ImageWidget
  | ClockWidget
  | CountdownWidget;

// Type guard functions
export function isCardWidget(widget: Widget): widget is CardWidget {
  return widget.type === "CardWidget";
}

export function isTextWidget(widget: Widget): widget is TextWidget {
  return widget.type === "TextWidget";
}

export function isVideoWidget(widget: Widget): widget is VideoWidget {
  return widget.type === "VideoWidget";
}

export function isImageWidget(widget: Widget): widget is ImageWidget {
  return widget.type === "ImageWidget";
}

export function isClockWidget(widget: Widget): widget is ClockWidget {
  return widget.type === "ClockWidget";
}

export function isCountdownWidget(widget: Widget): widget is CountdownWidget {
  return widget.type === "CountdownWidget";
}

// Widget type enumeration
export const WidgetType = {
  CARD: "CardWidget",
  TEXT: "TextWidget",
  VIDEO: "VideoWidget",
  IMAGE: "ImageWidget",
  CLOCK: "ClockWidget",
  COUNTDOWN: "CountdownWidget",
} as const;

export type WidgetType = (typeof WidgetType)[keyof typeof WidgetType];
