// MongoDB ObjectId reference
interface ObjectId {
  $oid: string;
}

// MongoDB Date reference
interface MongoDate {
  $date: string;
}

// Change tracking interface
interface Change {
  timestamp: MongoDate;
  user: ObjectId;
}

// File path information for assets
interface AssetPath {
  mime: string;
  extension: string;
  filename: string;
}

// Font asset reference
interface FontAsset {
  _id: ObjectId;
  name: string;
  kind: "font";
  created: MongoDate;
  updated: MongoDate;
  status: string;
  changes: Change[];
  paths: AssetPath[];
}

// Image asset reference
interface ImageAsset {
  _id: ObjectId;
  kind: "image";
  created: MongoDate;
  updated: MongoDate;
  status: string;
  changes: Change[];
  paths: AssetPath[];
  name: string;
}

// Behavior visibility rules
interface VisibilityRule {
  comparison_type: string;
  value_type: string;
  values: string[];
}

interface VisibilityBehavior {
  rules: VisibilityRule[];
}

interface Behaviors {
  visibility?: VisibilityBehavior;
}

// Target date time configuration for countdown widgets
interface TargetDateTime {
  default: string;
  source: "queryParameter" | "static" | "dynamic";
  name?: string;
}

// Base widget interface
interface BaseWidget {
  _id: ObjectId;
  identifier: string;
  type: string;
  styles?: Record<string, string>;
  classes?: string;
  attributes?: any[];
  status?: string;
  order: number;
  created: MongoDate;
  updated: MongoDate;
  changes: Change[];
  behaviours?: Behaviors;
}

// Specific widget types
interface ImageWidget extends BaseWidget {
  type: "ImageWidget";
  source: ImageAsset;
}

interface TextWidget extends BaseWidget {
  type: "TextWidget";
  value: string;
  font?: FontAsset;
}

interface CardWidget extends BaseWidget {
  type: "CardWidget";
  animation?: string;
  value: string;
  font?: FontAsset;
}

interface BoxLayout extends BaseWidget {
  type: "BoxLayout";
  contents: WidgetContent[];
}

interface CountdownWidget extends BaseWidget {
  type: "CountdownWidget";
  targetDateTime: TargetDateTime;
  contents: WidgetContent[];
}

// Union type for widget content
type WidgetContent =
  | { ImageWidget: ImageWidget }
  | { TextWidget: TextWidget }
  | { CardWidget: CardWidget }
  | { BoxLayout: BoxLayout }
  | { CountdownWidget: CountdownWidget };

// Main slide widget interface
export interface SlideWidgetItem extends BaseWidget {
  type: "SlideLayout";
  parent: ObjectId[];
  behaviours?: Behaviors;
  contents: WidgetContent[];
}

// Export additional types that might be useful
export type {
  ObjectId,
  MongoDate,
  Change,
  AssetPath,
  FontAsset,
  ImageAsset,
  VisibilityRule,
  VisibilityBehavior,
  Behaviors,
  TargetDateTime,
  BaseWidget,
  ImageWidget,
  TextWidget,
  CardWidget,
  BoxLayout,
  CountdownWidget,
  WidgetContent,
};
