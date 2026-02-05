import mongoose from "mongoose";

const bufferCollectionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    timestamp: { type: Date, required: true },
    httpStatus: { type: Number, required: true },
    errorState: { type: String, required: false },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
  },
  {
    collection: "buffer",
    timestamps: false,
    versionKey: false,
  },
);

// Note: This will be bound to cacheConnection in app.ts
export default bufferCollectionSchema;

export type BufferDocument = mongoose.Document & {
  data: any;
  timestamp: Date;
  httpStatus: number;
  errorState?: string;
  created: Date;
  updated: Date;
};
