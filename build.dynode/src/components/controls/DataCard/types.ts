export interface DataCardItem {
  _id?: string;
  identifier: string | string[];
  type: string | string[];
  styles?: Record<string, string>;
  classes?: string | string[];
  attributes?: any[];
  status?: string | string[];
  contents?: any[];
  order?: number | number[];
  parent?: any[];
  created?: string;
  updated?: string;
  changes?: Array<{
    timestamp: string;
    user: string;
  }>;
  // Allow additional properties for flexibility
  [key: string]: any;
}
