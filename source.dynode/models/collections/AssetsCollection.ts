import mongoose from "mongoose";
import changeSchema from "../shared/ChangeSchema";

// Schema for individual file paths within an asset
const pathSchema = new mongoose.Schema(
  {
    mime: { type: String, required: true },
    filename: { type: String, required: true },
    extension: { type: String, required: true },
  },
  { _id: false },
);

// Schema for individual assets within a bundle
const assetItemSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    kind: {
      type: String,
      required: true,
      enum: ["video", "image", "font", "other"],
    },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    status: { type: String, default: "" },
    paths: { type: [pathSchema], default: [] },
  },
  { _id: true, versionKey: false },
);

// Main schema for asset bundles
const assetsCollectionSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    bundle: { type: [assetItemSchema], default: [] },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    changes: { type: [changeSchema], default: [] },
  },
  {
    collection: "assets",
    timestamps: false,
    versionKey: false,
  },
);

const AssetsCollection = mongoose.model(
  "AssetsCollection",
  assetsCollectionSchema,
);

export default AssetsCollection;
