import mongoose from "mongoose";
import changeSchema from "./ChangeSchema";
import cacheSchema from "./CacheSchema";

const creativeBaseCollectionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    styles: { type: Map, of: String, default: {} },
    format: { type: String, required: false }, // <-- FIXED
    parent: { type: Array, default: [] },
    status: [{ type: String }],
    changes: { type: [changeSchema], default: [] },
    cache: { type: cacheSchema, default: { duration: "20" } }, // <-- FIXED
  },
  {
      discriminatorKey: "creativeType",
      timestamps: false,
      versionKey: false,

    // _id: false, // REMOVE this line for root documents
  }
);

export default creativeBaseCollectionSchema;
