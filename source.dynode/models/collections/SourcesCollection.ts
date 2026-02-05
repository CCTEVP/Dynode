import mongoose from "mongoose";
import changeSchema from "../shared/ChangeSchema";

const internalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variables: {
    type: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        value: { type: String, required: true },
        description: { type: String, required: false },
      },
    ],
    default: [],
  },
});

const endpointSchema = new mongoose.Schema({
  name: { type: String, required: true },
  source: { type: String, required: true },
  lifetime: { type: Number, required: true }, // seconds
  timeout: { type: Number, required: true }, // seconds for lock timeout
  pattern: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON Schema pattern
  status: { type: String, required: false }, // validation status
  variables: {
    type: [
      {
        path: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: false },
        description: { type: String, required: false },
      },
    ],
    default: [],
  },
});

const sourcesCollectionSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    name: { type: String, required: true },
    internal: { type: [internalSchema], default: [] },
    external: { type: [endpointSchema], default: [] },
    created: { type: Date, required: true },
    updated: { type: Date, required: true },
    changes: { type: [changeSchema], default: [] },
  },
  {
    collection: "sources",
    timestamps: false,
    versionKey: false,
  },
);

const SourcesCollection = mongoose.model(
  "SourcesCollection",
  sourcesCollectionSchema,
);

export default SourcesCollection;
