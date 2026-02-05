export interface SourceInternalVariable {
  name: string;
  type: string;
  value: string;
  description?: string;
}

export interface SourceExternalVariable {
  path: string;
  name: string;
  type?: string;
  description?: string;
}

export interface SourceInternal {
  _id?: string;
  name: string;
  variables?: SourceInternalVariable[];
}

export interface SourceExternal {
  _id?: string;
  name: string;
  source: string; // URL
  lifetime: number; // seconds
  timeout: number; // seconds
  pattern: any; // JSON Schema
  status?: string; // "valid" | "invalid"
  variables?: SourceExternalVariable[];
}

export interface SourceChange {
  timestamp: Date;
  user: string;
  oldValue?: any;
  newValue?: any;
}

export interface Source {
  _id: string;
  name: string;
  internal: SourceInternal[];
  external: SourceExternal[];
  created: Date;
  updated: Date;
  changes: SourceChange[];
}

export interface BufferDocument {
  _id: string;
  data: any;
  pattern?: any;
  timestamp: Date;
  httpStatus: number;
  errorState?: string;
  created: Date;
  updated: Date;
}
