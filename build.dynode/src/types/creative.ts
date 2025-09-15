import type { ObjectId, MongoDate } from "../components/creative/layouts/types";

export interface Creative {
  _id: ObjectId;
  identifier?: string;
  name: string;
  description?: string;
  status: string | string[];
  created: MongoDate;
  updated: MongoDate;
  changes: CreativeChange[];
  elements: any[]; // Complex nested structure from API
  styles?: {
    [key: string]: string;
  };
  format?: any[];
  parent?: string[];
  cache?: {
    duration?: string;
  };
  origin?: string;
  resources?: any;
  metadata?: {
    [key: string]: any;
  };
}

export interface CreativeChange {
  timestamp: MongoDate;
  user: ObjectId;
  oldValue?: any;
  newValue?: any;
}

export interface CreativeResponse {
  success: boolean;
  message?: string;
  creative?: Creative;
  error?: string;
}
