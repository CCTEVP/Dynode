import mongoose from "mongoose";
import changeSchema from "../shared/ChangeSchema";
import { url } from "inspector";

const assetsCollectionSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    status: { type: String, default: "" },
    changes: { type: [changeSchema], default: [] },
    paths: [{ mime: String, filename: String, extension: String, _id: false }],
  },
  {
    collection: "assets",
    timestamps: false,
    versionKey: false,
  }
);

const AssetsCollection = mongoose.model(
  "AssetsCollection",
  assetsCollectionSchema
);

export default AssetsCollection;
